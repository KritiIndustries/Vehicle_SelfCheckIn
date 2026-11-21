import test from "node:test";
import assert from "node:assert/strict";

const prismaState = {
  mappings: [],
  visits: [],
  visitQueries: [],
};

const prismaMock = {
  Mapping: {
    async findMany() {
      return prismaState.mappings;
    },
  },
  visits: {
    async findMany(query) {
      prismaState.visitQueries.push(query);
      return prismaState.visits;
    },
    async aggregate() {
      const dates = prismaState.visits
        .map((row) => row.Date)
        .filter(Boolean)
        .sort((left, right) => left - right);
      return {
        _min: { Date: dates[0] || null },
        _max: { Date: dates.at(-1) || null },
      };
    },
  },
};

globalThis.prisma = prismaMock;

const {
  generateVerticalHeadReports,
  sendVerticalHeadReports,
} = await import("../src/services/verticalHeadReportService.js");
const { triggerVerticalHeadReports } = await import(
  "../src/Controllers/verticalHeadReportController.js"
);
const { default: transporter } = await import("../src/utils/mailer.js");

function mapping(EmployeeCode = 101) {
  return {
    EmployeeCode,
    State: "MH",
    Division: "Agri",
    EmployeeName: `Employee ${EmployeeCode}`,
    RSMEmailID: "rsm.agri@example.test",
    VerticleHeadAgri: "agri.head@example.test",
    VerticleHeadBP: "bp.head@example.test",
  };
}

function visit(dateString, values = {}) {
  return {
    Date: new Date(`${dateString}T00:00:00.000Z`),
    EmpCode: 101,
    EmployeeName: "Employee 101",
    AttendanceStatus: "P",
    NoofVisitsPlanned: 0,
    ActualVisits: 0,
    NoOfFieldActivityPlanned: 0,
    NoOfFieldActivityDone: 0,
    ...values,
  };
}

function resetPrismaState() {
  prismaState.mappings = [mapping()];
  prismaState.visits = [];
  prismaState.visitQueries = [];
}

test("loads real visit data for the requested month and matches EmpCode to EmployeeCode", async () => {
  resetPrismaState();
  prismaState.visits = [
    visit("2026-11-01", {
      NoofVisitsPlanned: 3,
      ActualVisits: 3,
      NoOfFieldActivityPlanned: 1,
      NoOfFieldActivityDone: 1,
    }),
    visit("2026-11-02", {
      NoofVisitsPlanned: 4,
      ActualVisits: 2,
      NoOfFieldActivityPlanned: 2,
      NoOfFieldActivityDone: 1,
    }),
  ];

  const groups = await generateVerticalHeadReports({
    reportingPeriod: "2026-11",
  });

  assert.equal(prismaState.visitQueries.length, 1);
  assert.deepEqual(prismaState.visitQueries[0].where.Date, {
    gte: new Date("2026-11-01T00:00:00.000Z"),
    lt: new Date("2026-12-01T00:00:00.000Z"),
  });
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].to, [
    "agri.head@example.test",
    "bp.head@example.test",
    "rsm.agri@example.test",
  ]);
  assert.deepEqual(groups[0].cc, []);
  assert.equal(groups[0].employees.length, 1);
  assert.equal(groups[0].employees[0].EmpCode, 101);
  assert.equal(groups[0].employees[0].visitsPlanned, 7);
  assert.equal(groups[0].employees[0].actualVisits, 5);
  assert.equal(groups[0].employees[0].marketingPlanned, 3);
  assert.equal(groups[0].employees[0].marketingDone, 2);
  assert.equal(groups[0].employees[0].eligibleWorkingDays, 2);
  assert.equal(groups[0].employees[0].fullMjpAdherenceDays, 1);
  assert.equal(groups[0].employees[0].mjpAdherencePct, 50);
});

test("does not attempt email when the period has no employee visit data", async () => {
  resetPrismaState();

  const groups = await generateVerticalHeadReports({
    reportingPeriod: "2026-11",
  });
  const result = await sendVerticalHeadReports(groups);

  assert.deepEqual(groups, []);
  assert.equal(result.attempted, 0);
  assert.equal(result.sent, 0);
  assert.equal(prismaState.visitQueries.length, 1);
});

test("infers the reporting period when persisted visits are limited to one month", async () => {
  resetPrismaState();
  prismaState.visits = [visit("2026-10-01")];

  const groups = await generateVerticalHeadReports();

  assert.equal(groups.length, 1);
  assert.equal(groups[0].reportingPeriod, "October 2026");
  assert.deepEqual(prismaState.visitQueries[0].where.Date, {
    gte: new Date("2026-10-01T00:00:00.000Z"),
    lt: new Date("2026-11-01T00:00:00.000Z"),
  });
});

test("requires an explicit period when there are no dated visits to infer from", async () => {
  resetPrismaState();

  await assert.rejects(
    generateVerticalHeadReports(),
    /no dated visit records are available/,
  );
  assert.equal(prismaState.visitQueries.length, 0);
});

test("requires an explicit period when persisted visits span multiple months", async () => {
  resetPrismaState();
  prismaState.visits = [
    visit("2026-10-31"),
    visit("2026-11-01"),
  ];

  await assert.rejects(
    generateVerticalHeadReports(),
    /visit records span multiple months/,
  );
  assert.equal(prismaState.visitQueries.length, 0);
});

test("API resolves a missing period from single-month visits and sends a populated report", async () => {
  resetPrismaState();
  prismaState.visits = [
    visit("2026-10-01", {
      NoofVisitsPlanned: 5,
      ActualVisits: 5,
      NoOfFieldActivityPlanned: 2,
      NoOfFieldActivityDone: 2,
    }),
  ];
  const originalSendMail = transporter.sendMail;
  const sentMessages = [];
  transporter.sendMail = async (message) => {
    sentMessages.push(message);
    return { messageId: "mock" };
  };

  try {
    const response = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };

    await triggerVerticalHeadReports({ body: {} }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.reportingPeriod, "October 2026");
    assert.equal(response.body.sent, 1);
    assert.equal(sentMessages.length, 1);
    assert.equal(
      sentMessages[0].to,
      "agri.head@example.test, bp.head@example.test, rsm.agri@example.test",
    );
    assert.match(sentMessages[0].cc, /garima\.singh@kritiindia\.com/);
    assert.match(sentMessages[0].html, /Employee 101/);
    assert.match(sentMessages[0].html, />5</);
  } finally {
    transporter.sendMail = originalSendMail;
  }
});
