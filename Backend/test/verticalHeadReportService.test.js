import test from "node:test";
import assert from "node:assert/strict";
import {
  buildVerticalHeadReportGroups,
  normalizeEmail,
  sendVerticalHeadReports,
} from "../src/services/verticalHeadReportService.js";
import { buildVerticalHeadEmail } from "../src/services/verticalHeadEmailService.js";
import transporter from "../src/utils/mailer.js";

function report(empCode, overrides = {}) {
  return {
    EmpCode: empCode,
    employeeName: `Employee ${empCode}`,
    visitsPlanned: 10,
    actualVisits: 7,
    marketingPlanned: 5,
    marketingDone: 4,
    mjpAdherencePct: 80,
    ...overrides,
  };
}

test("Agriculture Vertical Head and RSM receive the report in To", () => {
  const groups = buildVerticalHeadReportGroups({
    mappings: [{
      EmployeeCode: 101,
      State: "MH",
      Division: "Agri",
      EmployeeName: "Employee 101",
      EmployeeEmailID: "employee1@example.test",
      RSMEmailID: "rsm.agri@example.test",
      VerticleHeadAgri: "agri.head@example.test",
      VerticleHeadBP: "   ",
    }],
    reports: [report(101)],
    reportingPeriod: "Nov 2026",
  });

  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].to, ["agri.head@example.test", "rsm.agri@example.test"]);
  assert.deepEqual(groups[0].cc, []);
  assert.equal(groups[0].employees.length, 1);
  assert.equal(groups[0].employees[0].EmpCode, 101);
  assert.match(buildVerticalHeadEmail(groups[0]).html, /Vertical Head \/ RSM Massist Report/);
});

test("When both Vertical Head emails are populated they share one consolidated report", () => {
  const groups = buildVerticalHeadReportGroups({
    mappings: [{
      EmployeeCode: 101,
      State: "MH",
      Division: "Agri",
      EmployeeName: "Employee 101",
      EmployeeEmailID: "employee1@example.test",
      RSMEmailID: "rsm.agri@example.test",
      VerticleHeadAgri: "agri.head@example.test",
      VerticleHeadBP: "bp.head@example.test",
    }, {
      EmployeeCode: 102,
      State: "MH",
      Division: "Agri",
      EmployeeName: "Employee 102",
      EmployeeEmailID: "employee2@example.test",
      RSMEmailID: "rsm.agri@example.test",
      VerticleHeadAgri: "agri.head@example.test",
      VerticleHeadBP: "bp.head@example.test",
    }],
    reports: [report(101), report(102)],
    reportingPeriod: "Nov 2026",
  });

  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].to, [
    "agri.head@example.test",
    "bp.head@example.test",
    "rsm.agri@example.test",
  ]);
  assert.deepEqual(groups[0].cc, []);
  assert.equal(groups[0].employees.length, 2);
});

test("matches supplied report records by EmployeeCode as well as EmpCode", () => {
  const groups = buildVerticalHeadReportGroups({
    mappings: [{
      EmployeeCode: 101,
      State: "MH",
      Division: "Agri",
      RSMEmailID: "rsm.agri@example.test",
      VerticleHeadAgri: "agri.head@example.test",
      VerticleHeadBP: null,
    }],
    reports: [{
      EmployeeCode: "101",
      employeeName: "Employee 101",
      visitsPlanned: 6,
      actualVisits: 4,
      marketingPlanned: 3,
      marketingDone: 2,
      mjpAdherencePct: 50,
    }],
  });

  assert.equal(groups.length, 1);
  assert.equal(groups[0].employees.length, 1);
  assert.equal(groups[0].employees[0].EmpCode, 101);
  assert.equal(groups[0].employees[0].visitsPlanned, 6);
  assert.equal(groups[0].employees[0].marketingDone, 2);
  assert.equal(groups[0].employees[0].mjpAdherencePct, 50);
});

test("RSM is resolved by state and division, not by state alone", () => {
  const groups = buildVerticalHeadReportGroups({
    mappings: [{
      EmployeeCode: 101,
      State: "MH",
      Division: "Agri",
      RSMEmailID: "agri.rsm@example.test",
      VerticleHeadAgri: "agri.head@example.test",
      VerticleHeadBP: null,
    }, {
      EmployeeCode: 102,
      State: "MH",
      Division: "BP",
      RSMEmailID: "bp.rsm@example.test",
      VerticleHeadAgri: null,
      VerticleHeadBP: "bp.head@example.test",
    }],
    reports: [report(101), report(102)],
  });

  assert.equal(groups.length, 2);
  const agriGroup = groups.find((group) => group.state === "MH" && group.division === "Agri");
  const bpGroup = groups.find((group) => group.state === "MH" && group.division === "BP");
  assert.deepEqual(agriGroup.to, ["agri.head@example.test", "agri.rsm@example.test"]);
  assert.deepEqual(bpGroup.to, ["bp.head@example.test", "bp.rsm@example.test"]);
});

test("reports still go to Vertical Heads when no RSM is selected", () => {
  const groups = buildVerticalHeadReportGroups({
    mappings: [{
      EmployeeCode: 101,
      State: "MH",
      Division: "Agri",
      RSMEmailID: null,
      VerticleHeadAgri: "agri.head@example.test",
      VerticleHeadBP: null,
    }],
    reports: [report(101)],
  });

  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].to, ["agri.head@example.test"]);
  assert.deepEqual(groups[0].cc, []);
});

test("Duplicate employee codes are deduplicated within a report and missing recipients are skipped", () => {
  const groups = buildVerticalHeadReportGroups({
    mappings: [
      {
        EmployeeCode: 101,
        State: "MH",
        Division: "Agri",
        VerticleHeadAgri: "agri.head@example.test",
        VerticleHeadBP: null,
      },
      {
        EmployeeCode: 101,
        State: "MH",
        Division: "Agri",
        VerticleHeadAgri: "agri.head@example.test",
        VerticleHeadBP: null,
      },
    ],
    reports: [report(101)],
  });

  assert.equal(groups.length, 1);
  assert.equal(groups[0].employees.length, 1);

  const skipped = sendVerticalHeadReports([{ groupKey: "empty", state: "MH", division: "Agri", to: [], cc: [], employees: [] }]);
  return skipped.then((result) => {
    assert.equal(result.attempted, 0);
    assert.equal(result.sent, 0);
    assert.equal(result.skipped.length, 1);
  });
});

test("Invalid emails are rejected and send results continue gracefully", async () => {
  const originalSendMail = transporter.sendMail;
  const calls = [];
  transporter.sendMail = async (message) => {
    calls.push(message);
    return { messageId: "mock" };
  };

  try {
    const groups = [{
      groupKey: "mh|agri|agri.head@example.test",
      state: "MH",
      division: "Agri",
      to: ["agri.head@example.test", "bad-email"],
      cc: ["rsm.agri@example.test"],
      employees: [report(101)],
      reportingPeriod: "Nov 2026",
    }, {
      groupKey: "mh|agri|ignored",
      state: "MH",
      division: "Agri",
      to: [],
      cc: [],
      employees: [],
      reportingPeriod: "Nov 2026",
    }];

    const result = await sendVerticalHeadReports(groups);
    assert.equal(result.attempted, 1);
    assert.equal(result.sent, 1);
    assert.equal(result.failed.length, 0);
    assert.equal(result.skipped.length, 1);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].to, "agri.head@example.test");
    assert.equal(normalizeEmail("  AGRI.HEAD@example.test  "), "agri.head@example.test");
  } finally {
    transporter.sendMail = originalSendMail;
  }
});

test("A failing send does not stop other groups from being processed", async () => {
  const originalSendMail = transporter.sendMail;
  const calls = [];
  transporter.sendMail = async (message) => {
    calls.push(message);
    if (calls.length === 1) {
      throw new Error("SMTP failure");
    }
    return { messageId: "mock" };
  };

  try {
    const result = await sendVerticalHeadReports([
      {
        groupKey: "fail", state: "MH", division: "Agri",
        to: ["agri.head@example.test"], cc: [], employees: [report(101)],
      },
      {
        groupKey: "ok", state: "MH", division: "BP",
        to: ["bp.head@example.test"], cc: [], employees: [report(102)],
      },
    ]);

    assert.equal(result.attempted, 2);
    assert.equal(result.sent, 1);
    assert.equal(result.failed.length, 1);
    assert.equal(result.failed[0].group, "fail");
    assert.equal(calls.length, 2);
  } finally {
    transporter.sendMail = originalSendMail;
  }
});
