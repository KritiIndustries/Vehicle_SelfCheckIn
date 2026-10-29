// import prisma from "../Config/index.js";
// import { sendVerticalHeadEmailGroup } from "./verticalHeadEmailService.js";

// function normalizeText(value) {
//   if (value === null || value === undefined) return "";
//   return String(value).trim();
// }

// export function normalizeEmail(value) {
//   const text = normalizeText(value);
//   if (!text) return null;
//   const normalized = text.toLowerCase();
//   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return null;
//   return normalized;
// }

// export function dedupeEmails(values = []) {
//   return [...new Set((values || []).map((value) => normalizeEmail(value)).filter(Boolean))];
// }

// export async function fetchVerticalHeadMappings() {
//   return prisma.Mapping.findMany({
//     select: {
//       EmployeeCode: true,
//       State: true,
//       Division: true,
//       EmployeeName: true,
//       EmployeeEmailID: true,
//       ReportingManagerEmailID: true,
//       RSMEmailID: true,
//       VerticleHeadAgri: true,
//       VerticleHeadBP: true,
//     },
//   });
// }

// export function resolveStateDivisionRsm(mappingRows, state, division) {
//   const stateName = normalizeText(state);
//   const divisionName = normalizeText(division);

//   if (!stateName && !divisionName) {
//     return [];
//   }

//   const candidates = dedupeEmails(
//     mappingRows
//       .filter((mapping) => normalizeText(mapping.State) === stateName && normalizeText(mapping.Division) === divisionName)
//       .map((mapping) => mapping.RSMEmailID)
//   );

//   return candidates;
// }

// export function buildVerticalHeadReportGroups({ mappings = [], reports = [], reportingPeriod = null } = {}) {
//   const reportByCode = new Map(
//     (reports || []).map((report) => [Number(report.EmpCode), report])
//   );

//   const stateDivisionRsmCache = new Map();
//   const groups = new Map();
//   const validMappings = Array.isArray(mappings) ? mappings : [];

//   for (const mapping of validMappings) {
//     if (!mapping || Number.isNaN(Number(mapping.EmployeeCode))) continue;

//     const toRecipients = dedupeEmails([
//       mapping.VerticleHeadAgri,
//       mapping.VerticleHeadBP,
//     ]);

//     if (toRecipients.length === 0) {
//       continue;
//     }

//     const state = normalizeText(mapping.State);
//     const division = normalizeText(mapping.Division);
//     const cacheKey = `${state}||${division}`;

//     if (!stateDivisionRsmCache.has(cacheKey)) {
//       stateDivisionRsmCache.set(cacheKey, resolveStateDivisionRsm(validMappings, state, division));
//     }

//     const rsmOptions = stateDivisionRsmCache.get(cacheKey);
//     const rsmRecipients = rsmOptions.length > 1 ? [] : rsmOptions;

//     const groupKey = [
//       state || "unknown",
//       division || "unknown",
//       ...toRecipients.slice().sort(),
//     ].join("|");

//     if (!groups.has(groupKey)) {
//       groups.set(groupKey, {
//         groupKey,
//         state,
//         division,
//         to: [],
//         cc: [],
//         employees: [],
//         employeesByCode: new Map(),
//         reportingPeriod,
//       });
//     }

//     const group = groups.get(groupKey);
//     group.to = dedupeEmails([...group.to, ...toRecipients]);
//     group.cc = dedupeEmails([...group.cc, ...rsmRecipients]);

//     const employeeKey = Number(mapping.EmployeeCode);
//     const employeeReport = reportByCode.get(employeeKey);
//     if (employeeReport) {
//       const employeeDetails = {
//         ...employeeReport,
//         state,
//         division,
//       };
//       if (!group.employeesByCode.has(employeeKey)) {
//         group.employeesByCode.set(employeeKey, employeeDetails);
//       }
//     }
//   }

//   return [...groups.values()].map((group) => {
//     group.to = dedupeEmails(group.to);
//     group.cc = dedupeEmails(group.cc.filter((email) => !group.to.includes(email)));
//     group.employees = [...group.employeesByCode.values()].map((employee) => ({
//       ...employee,
//       state: normalizeText(employee.state || employee.State || group.state),
//       division: normalizeText(employee.division || employee.Division || group.division),
//       employeeName: employee.employeeName || employee.EmployeeName || "N/A",
//       visitsPlanned: employee.visitsPlanned ?? employee.visits_planned ?? 0,
//       actualVisits: employee.actualVisits ?? employee.actual_visits ?? 0,
//       marketingPlanned: employee.marketingPlanned ?? employee.marketing_planned ?? 0,
//       marketingDone: employee.marketingDone ?? employee.marketing_done ?? 0,
//       mjpAdherencePct: employee.mjpAdherencePct ?? employee.mjp_adherence_pct ?? null,
//     }));
//     delete group.employeesByCode;
//     return group;
//   });
// }

// export async function generateVerticalHeadReports({ mappings, reports, reportingPeriod } = {}) {
//   const sourceMappings = Array.isArray(mappings) ? mappings : await fetchVerticalHeadMappings();
//   const sourceReports = Array.isArray(reports) ? reports : [];
//   const groups = buildVerticalHeadReportGroups({
//     mappings: sourceMappings,
//     reports: sourceReports,
//     reportingPeriod,
//   });

//   return groups;
// }

// export async function sendVerticalHeadReports(groups = []) {
//   const result = {
//     attempted: 0,
//     sent: 0,
//     skipped: [],
//     failed: [],
//     groupsProcessed: groups.length,
//   };

//   for (const group of groups) {
//     const normalizedTo = dedupeEmails(group?.to || []);
//     const normalizedCc = dedupeEmails(group?.cc || []);
//     group.to = normalizedTo;
//     group.cc = normalizedCc;

//     if (!normalizedTo.length) {
//       result.skipped.push({
//         group: group.groupKey || "unknown",
//         reason: "No valid Vertical Head recipients",
//       });
//       continue;
//     }

//     result.attempted += 1;

//     try {
//       await sendVerticalHeadEmailGroup(group);
//       result.sent += 1;
//     } catch (error) {
//       result.failed.push({
//         group: group.groupKey || "unknown",
//         error: error.message,
//       });
//     }
//   }

//   return result;
// }

// export async function processVerticalHeadReports({ mappings, reports, reportingPeriod } = {}) {
//   const groups = await generateVerticalHeadReports({ mappings, reports, reportingPeriod });
//   const emailResult = await sendVerticalHeadReports(groups);

//   return {
//     groups,
//     emailResult,
//   };
// }



import prisma from "../Config/index.js";
import { sendVerticalHeadEmailGroup } from "./verticalHeadEmailService.js";
import { calculateEmployeeReports } from "../utils/massistCalculations.js";

function normalizeText(value) {
  return value == null ? "" : String(value).trim();
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase();
}

export function normalizeEmail(value) {
  const email = normalizeText(value).toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }

  return email;
}

export function dedupeEmails(values = []) {
  return [
    ...new Set((values || []).map(normalizeEmail).filter(Boolean)),
  ];
}

/**
 * Accepted formats:
 *   October 2026
 *   2026-10
 */
export function parseReportingPeriod(period) {
  const value = normalizeText(period);

  if (!value) {
    throw new Error(
      "reportingPeriod is required. Use a format such as October 2026 or 2026-10."
    );
  }

  let year;
  let month;

  const numericMatch = value.match(/^(\d{4})-(\d{2})$/);

  if (numericMatch) {
    year = Number(numericMatch[1]);
    month = Number(numericMatch[2]);
  } else {
    const namedMatch = value.match(/^([a-zA-Z]+)\s+(\d{4})$/);

    if (!namedMatch) {
      throw new Error(
        "Invalid reportingPeriod. Use a format such as October 2026 or 2026-10."
      );
    }

    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    month =
      months.indexOf(namedMatch[1].toLowerCase()) + 1;

    year = Number(namedMatch[2]);
  }

  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new Error("Invalid reportingPeriod.");
  }

  return {
    startDate: new Date(Date.UTC(year, month - 1, 1)),
    endDate: new Date(Date.UTC(year, month, 1)),
    label: new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
      "en-IN",
      { month: "long", year: "numeric", timeZone: "UTC" }
    ),
  };
}

// export async function resolveReportingPeriod(period) {
//   if (normalizeText(period)) {
//     return parseReportingPeriod(period);
//   }

//   const dateRange = await prisma.visits.aggregate({
//     where: {
//       Date: { not: null },
//       EmpCode: { not: null },
//     },
//     _min: { Date: true },
//     _max: { Date: true },
//   });
//   const firstDate = dateRange._min.Date;
//   const lastDate = dateRange._max.Date;

//   if (!firstDate || !lastDate) {
//     throw new Error(
//       "reportingPeriod is required because no dated visit records are available to infer it."
//     );
//   }

//   const start = new Date(firstDate);
//   const end = new Date(lastDate);

//   if (
//     start.getUTCFullYear() !== end.getUTCFullYear() ||
//     start.getUTCMonth() !== end.getUTCMonth()
//   ) {
//     throw new Error(
//       "reportingPeriod is required because visit records span multiple months."
//     );
//   }

//   return parseReportingPeriod(
//     `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`
//   );
// }
export async function resolveReportingPeriod(period) {
  // Use the supplied reporting period when provided.
  if (normalizeText(period)) {
    return parseReportingPeriod(period);
  }

  // Automatically infer the reporting period from the latest visit.
  const dateRange = await prisma.visits.aggregate({
    where: {
      Date: { not: null },
      EmpCode: { not: null },
    },
    _max: {
      Date: true,
    },
  });

  const latestDate = dateRange._max.Date;

  if (!latestDate) {
    throw new Error(
      "No dated visit records are available to determine the reporting period."
    );
  }

  const latestVisit = new Date(latestDate);

  const year = latestVisit.getUTCFullYear();
  const month = String(latestVisit.getUTCMonth() + 1).padStart(2, "0");

  return parseReportingPeriod(`${year}-${month}`);
}

export async function fetchVerticalHeadMappings() {
  return prisma.Mapping.findMany({
    select: {
      EmployeeCode: true,
      State: true,
      Division: true,
      EmployeeName: true,
      EmployeeEmailID: true,
      ReportingManagerEmailID: true,
      RSMEmailID: true,
      VerticleHeadAgri: true,
      VerticleHeadBP: true,
    },
  });
}

export async function fetchVisitsForPeriod(reportingPeriod) {
  const { startDate, endDate } = parseReportingPeriod(reportingPeriod);

  // Assumes the generated Prisma model delegate is prisma.visits
  // and its fields match the column names in your database.
  const visits = await prisma.visits.findMany({
    where: {
      Date: {
        gte: startDate,
        lt: endDate,
      },
      EmpCode: {
        not: null,
      },
    },
    select: {
      Date: true,
      EmpCode: true,
      EmployeeName: true,
      AttendanceStatus: true,
      NoOfFieldActivityPlanned: true,
      NoOfFieldActivityDone: true,
      NoofVisitsPlanned: true,
      ActualVisits: true,
    },
    orderBy: [
      { EmpCode: "asc" },
      { Date: "asc" },
    ],
  });

  return visits;
}

export function resolveStateDivisionRsm(mappingRows, state, division) {
  const candidates = dedupeEmails(
    mappingRows
      .filter(
        (mapping) =>
          normalizeKey(mapping.State) === normalizeKey(state) &&
          normalizeKey(mapping.Division) === normalizeKey(division)
      )
      .map((mapping) => mapping.RSMEmailID)
  );

  return candidates;
}

export function buildVerticalHeadReportGroups({
  mappings = [],
  reports = [],
  reportingPeriod = null,
} = {}) {
  const reportByCode = new Map();

  for (const report of reports) {
    const code = Number(report.EmpCode ?? report.EmployeeCode);

    if (Number.isFinite(code)) {
      reportByCode.set(code, report);
    }
  }

  const rsmCache = new Map();
  const groups = new Map();

  for (const mapping of mappings) {
    const employeeCode = Number(mapping.EmployeeCode);

    if (!Number.isFinite(employeeCode)) continue;

    // Never create an email group without actual report data.
    const report = reportByCode.get(employeeCode);

    if (!report) continue;

    const toRecipients = dedupeEmails([
      mapping.VerticleHeadAgri,
      mapping.VerticleHeadBP,
    ]);

    if (!toRecipients.length) continue;

    const state = normalizeText(mapping.State);
    const division = normalizeText(mapping.Division);

    const rsmKey = `${normalizeKey(state)}||${normalizeKey(division)}`;

    if (!rsmCache.has(rsmKey)) {
      rsmCache.set(
        rsmKey,
        resolveStateDivisionRsm(mappings, state, division)
      );
    }

    const rsmOptions = rsmCache.get(rsmKey);

    // Do not guess when multiple RSM emails exist for one
    // state/division. The report can still go to the heads.
    const rsmRecipients =
      rsmOptions.length === 1 ? rsmOptions : [];

    if (rsmOptions.length > 1) {
      console.warn(
        `[VerticalHeadReport] Ambiguous RSM for ${state}/${division}; CC omitted.`
      );
    }

    const recipientKey = toRecipients.slice().sort().join("|");

    const groupKey = [
      normalizeKey(state) || "unknown",
      normalizeKey(division) || "unknown",
      recipientKey,
    ].join("|");

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        groupKey,
        state,
        division,
        to: [],
        cc: [],
        employeesByCode: new Map(),
        employees: [],
        reportingPeriod,
      });
    }

    const group = groups.get(groupKey);

    group.to = dedupeEmails([...group.to, ...toRecipients]);
    group.cc = dedupeEmails([...group.cc, ...rsmRecipients]);

    if (!group.employeesByCode.has(employeeCode)) {
      group.employeesByCode.set(employeeCode, {
        ...report,
        EmpCode: employeeCode,
        employeeName:
          normalizeText(report.employeeName || report.EmployeeName) ||
          normalizeText(mapping.EmployeeName) ||
          "N/A",
        state,
        division,
      });
    }
  }

  return [...groups.values()].map((group) => {
    group.to = dedupeEmails(group.to);

    group.cc = dedupeEmails(
      group.cc.filter((email) => !group.to.includes(email))
    );

    group.employees = [...group.employeesByCode.values()];

    delete group.employeesByCode;

    return group;
  });
}

export async function generateVerticalHeadReports({
  mappings,
  reports,
  reportingPeriod,
} = {}) {
  const period = await resolveReportingPeriod(reportingPeriod);

  const sourceMappings = Array.isArray(mappings)
    ? mappings
    : await fetchVerticalHeadMappings();

  let sourceReports;

  if (Array.isArray(reports)) {
    sourceReports = reports;
  } else {
    const visitRows = await fetchVisitsForPeriod(period.label);

    sourceReports = calculateEmployeeReports(visitRows);
  }

  return buildVerticalHeadReportGroups({
    mappings: sourceMappings,
    reports: sourceReports,
    reportingPeriod: period.label,
  });
}

export async function sendVerticalHeadReports(groups = []) {
  const result = {
    attempted: 0,
    sent: 0,
    skipped: [],
    failed: [],
    groupsProcessed: groups.length,
  };

  for (const group of groups) {
    group.to = dedupeEmails(group.to);
    group.cc = dedupeEmails(
      (group.cc || []).filter(
        (email) => !group.to.includes(normalizeEmail(email))
      )
    );

    if (!group.to.length) {
      result.skipped.push({
        group: group.groupKey || "unknown",
        reason: "No valid Vertical Head recipients",
      });
      continue;
    }

    if (!group.employees?.length) {
      result.skipped.push({
        group: group.groupKey || "unknown",
        reason: "No employee records available",
      });
      continue;
    }

    result.attempted += 1;

    try {
      await sendVerticalHeadEmailGroup(group);
      result.sent += 1;
    } catch (error) {
      result.failed.push({
        group: group.groupKey || "unknown",
        error: error.message,
      });
    }
  }

  return result;
}

export async function processVerticalHeadReports({
  mappings,
  reports,
  reportingPeriod,
} = {}) {
  const groups = await generateVerticalHeadReports({
    mappings,
    reports,
    reportingPeriod,
  });

  const emailResult = await sendVerticalHeadReports(groups);

  return { groups, emailResult };
}
