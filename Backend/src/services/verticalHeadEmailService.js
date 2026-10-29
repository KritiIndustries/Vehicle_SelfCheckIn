// import transporter from "../utils/mailer.js";
// const GLOBAL_CC_RECIPIENTS = [
//   "garima.singh@kritiindia.com",
// ];

// function escapeHtml(value = "") {
//   return String(value ?? "").replace(/[&<>"']/g, (char) => ({
//     "&": "&",
//     "<": "&lt;",
//     ">": "&gt;",
//     '"': "&quot;",
//     "'": "&#39;",
//   })[char]);
// }

// function formatNumber(value) {
//   if (value === null || value === undefined || value === "") return "N/A";
//   const number = Number(value);
//   if (!Number.isFinite(number)) return "N/A";
//   return Number(number).toLocaleString("en-IN");
// }

// function formatPercent(value) {
//   if (value === null || value === undefined || value === "") return "N/A";
//   const number = Number(value);
//   if (!Number.isFinite(number)) return "N/A";
//   return `${Number(number).toFixed(2)}%`;
// }

// function rowForEmployee(employee) {
//   const employeeName = employee.employeeName || employee.EmployeeName || "N/A";
//   const employeeCode = employee.EmpCode ?? employee.EmployeeCode ?? "N/A";
//   const state = employee.state || employee.State || "N/A";
//   const division = employee.division || employee.Division || "N/A";
//   const visitsPlanned = formatNumber(employee.visitsPlanned ?? employee.visits_planned ?? 0);
//   const actualVisits = formatNumber(employee.actualVisits ?? employee.actual_visits ?? 0);
//   const marketingPlanned = formatNumber(employee.marketingPlanned ?? employee.marketing_planned ?? 0);
//   const marketingDone = formatNumber(employee.marketingDone ?? employee.marketing_done ?? 0);
//   const eligibleWorkingDays = formatNumber(employee.eligibleWorkingDays ?? employee.eligible_working_days ?? 0);
//   const fullMjpAdherenceDays = formatNumber(employee.fullMjpAdherenceDays ?? employee.full_mjp_adherence_days ?? 0);
//   const mjp = formatPercent(employee.mjpAdherencePct ?? employee.mjp_adherence_pct ?? null);

//   return `
//     <tr>
//       <td style="border:1px solid #dfe3e8;padding:10px 12px;">${escapeHtml(String(employeeCode))}</td>
//       <td style="border:1px solid #dfe3e8;padding:10px 12px;">${escapeHtml(String(employeeName))}</td>
//       <td style="border:1px solid #dfe3e8;padding:10px 12px;">${escapeHtml(String(state))}</td>
//       <td style="border:1px solid #dfe3e8;padding:10px 12px;">${escapeHtml(String(division))}</td>
//       <td style="border:1px solid #dfe3e8;padding:10px 12px; text-align:right;">${escapeHtml(String(visitsPlanned))}</td>
//       <td style="border:1px solid #dfe3e8;padding:10px 12px; text-align:right;">${escapeHtml(String(actualVisits))}</td>
//       <td style="border:1px solid #dfe3e8;padding:10px 12px; text-align:right;">${escapeHtml(String(marketingPlanned))}</td>
//       <td style="border:1px solid #dfe3e8;padding:10px 12px; text-align:right;">${escapeHtml(String(marketingDone))}</td>
//       <td style="border:1px solid #dfe3e8;padding:10px 12px; text-align:right;">${escapeHtml(String(eligibleWorkingDays))}</td>
//       <td style="border:1px solid #dfe3e8;padding:10px 12px; text-align:right;">${escapeHtml(String(fullMjpAdherenceDays))}</td>
//       <td style="border:1px solid #dfe3e8;padding:10px 12px; text-align:right;">${escapeHtml(String(mjp))}</td>
//     </tr>
//   `;
// }

// export function buildVerticalHeadEmail(group) {
//   const employees = (group.employees || []).map((employee) => rowForEmployee(employee)).join("");
//   const reportingPeriod = group.reportingPeriod || "N/A";
//   const state = group.state || "All States";
//   const division = group.division || "All Divisions";
//   const to = (group.to || []).join(", ");
//   const cc = (group.cc || []).join(", ");

//   const html = `
//     <div style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:24px;color:#1f2937;">
//       <div style="background:#0f172a;padding:20px 24px;border-radius:8px 8px 0 0;color:#fff;">
//         <h2 style="margin:0;font-size:22px;">Vertical Head / RSM Massist Report</h2>
//       </div>
//       <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
//         <p><strong>Reporting Period:</strong> ${escapeHtml(String(reportingPeriod))}</p>
//         <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin-top:20px;">
//           <thead>
//             <tr style="background:#e2e8f0;">
//               <th style="border:1px solid #dfe3e8;padding:10px 12px;text-align:left;">Employee Code</th>
//               <th style="border:1px solid #dfe3e8;padding:10px 12px;text-align:left;">Employee Name</th>
//               <th style="border:1px solid #dfe3e8;padding:10px 12px;text-align:left;">State</th>
//               <th style="border:1px solid #dfe3e8;padding:10px 12px;text-align:left;">Division</th>
//               <th style="border:1px solid #dfe3e8;padding:10px 12px;text-align:right;">Visits Planned</th>
//               <th style="border:1px solid #dfe3e8;padding:10px 12px;text-align:right;">Actual Visits</th>
//               <th style="border:1px solid #dfe3e8;padding:10px 12px;text-align:right;">Marketing / Field Activity Planned</th>
//               <th style="border:1px solid #dfe3e8;padding:10px 12px;text-align:right;">Marketing / Field Activity Done</th>
//               <th style="border:1px solid #dfe3e8;padding:10px 12px;text-align:right;">Eligible Working Days</th>
//               <th style="border:1px solid #dfe3e8;padding:10px 12px;text-align:right;">100% Adherence Days</th>
//               <th style="border:1px solid #dfe3e8;padding:10px 12px;text-align:right;">Final MJP Adherence</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${employees || '<tr><td colspan="9" style="border:1px solid #dfe3e8;padding:14px;">No employee records available for this report.</td></tr>'}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   `;

//   const textLines = [
//     "Vertical Head / RSM Massist Report",
//     `Reporting Period: ${reportingPeriod}`,
//     `State: ${state}`,
//     `Division: ${division}`,
//     `To: ${to || "N/A"}`,
//     `CC: ${cc || "N/A"}`,
//     "",
//     "Employee Code | Employee Name | State | Division | Visits Planned | Actual Visits | Marketing / Field Activity Planned | Marketing / Field Activity Done | Eligible Working Days | 100% Adherence Days | Final MJP Adherence",
//   ];

//   for (const employee of group.employees || []) {
//     textLines.push(
//       [
//         employee.EmpCode ?? employee.EmployeeCode ?? "N/A",
//         employee.employeeName || employee.EmployeeName || "N/A",
//         employee.state || employee.State || "N/A",
//         employee.division || employee.Division || "N/A",
//         employee.visitsPlanned ?? employee.visits_planned ?? 0,
//         employee.actualVisits ?? employee.actual_visits ?? 0,
//         employee.marketingPlanned ?? employee.marketing_planned ?? 0,
//         employee.marketingDone ?? employee.marketing_done ?? 0,
//         employee.eligibleWorkingDays ?? employee.eligible_working_days ?? 0,
//         employee.fullMjpAdherenceDays ?? employee.full_mjp_adherence_days ?? 0,
//         employee.mjpAdherencePct ?? employee.mjp_adherence_pct ?? "N/A",
//       ].join(" | ")
//     );
//   }

//   const text = textLines.join("\n");

//   return {
//     subject: `Vertical Head / RSM Massist Report - ${escapeHtml(String(state))} - ${escapeHtml(String(division))}`,
//     html,
//     text,
//   };
// }

// export async function sendVerticalHeadEmailGroup(group) {
//   if (!Array.isArray(group.to) || group.to.length === 0) {
//     throw new Error("No valid recipients configured for this report group.");
//   }

//   const { subject, html, text } = buildVerticalHeadEmail(group);
//   const from = process.env.MAIL_FROM || process.env.SMTP_USER || "noreply@local";
//   const toRecipients = [
//     ...new Set(group.to.map((email) => email.trim().toLowerCase())),
//   ];
//   const ccRecipients = [
//     ...new Set([
//       ...(group.cc || []),
//       ...GLOBAL_CC_RECIPIENTS,
//     ]
//       .map((email) => email.trim().toLowerCase())
//       .filter((email) => email && !toRecipients.includes(email))),
//   ];

//   // await transporter.sendMail({
//   //   from,
//   //   to: group.to.join(", "),
//   //   cc: group.cc && group.cc.length ? group.cc.join(", ") : undefined,
//   //   subject,
//   //   html,
//   //   text,
//   // });

//   // return { subject, recipients: [...group.to], cc: [...(group.cc || [])] };
//   await transporter.sendMail({
//     from,
//     to: toRecipients.join(", "),
//     cc: ccRecipients.length ? ccRecipients.join(", ") : undefined,
//     subject,
//     html,
//     text,
//   });

//   return {
//     subject,
//     recipients: toRecipients,
//     cc: ccRecipients,
//   };
// }


import transporter from "../utils/mailer.js";

const GLOBAL_CC_RECIPIENTS = ["garima.singh@kritiindia.com", "neha.jhalani@kritiindia.com", "srao@kritiindia.com", "ngaur@kritiindia.com", "nsethiya@kritiindia.com", "sahil.sharma@kritiindia.com", "richa.giri@kritiindia.com"];

/* ----------------------------- helpers ----------------------------- */

function escapeHtml(value = "") {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  const number = Number(value);
  if (!Number.isFinite(number)) return "N/A";
  return number.toLocaleString("en-IN");
}

function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  const number = Number(value);
  if (!Number.isFinite(number)) return "N/A";
  return `${number.toFixed(2)}%`;
}

// Normalises the different key spellings coming from the data source.
function normalizeEmployee(e) {
  return {
    code: e.EmpCode ?? e.EmployeeCode ?? "N/A",
    name: e.employeeName || e.EmployeeName || "N/A",
    state: e.state || e.State || "N/A",
    division: e.division || e.Division || "N/A",
    visitsPlanned: e.visitsPlanned ?? e.visits_planned ?? 0,
    actualVisits: e.actualVisits ?? e.actual_visits ?? 0,
    marketingPlanned: e.marketingPlanned ?? e.marketing_planned ?? 0,
    marketingDone: e.marketingDone ?? e.marketing_done ?? 0,
    eligibleWorkingDays: e.eligibleWorkingDays ?? e.eligible_working_days ?? 0,
    fullMjpAdherenceDays: e.fullMjpAdherenceDays ?? e.full_mjp_adherence_days ?? 0,
    mjp: e.mjpAdherencePct ?? e.mjp_adherence_pct ?? null,
  };
}

function mjpColor(value) {
  const n = Number(value);
  if (value === null || value === undefined || value === "" || !Number.isFinite(n)) return "#475569";
  if (n >= 90) return "#15803d";
  if (n >= 70) return "#b45309";
  return "#b91c1c";
}

/* ------------------------------ styles ------------------------------ */

// Media queries are supported by Gmail (web/app), Apple Mail, Outlook.com,
// Yahoo and most mobile clients. Desktop Outlook ignores them and simply
// shows the (compact) table layout, which still fits within 900px.
const EMAIL_CSS = `
  body, table, td, p, h1, h2 { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table { border-collapse:collapse; }
  .lbl { display:none; }

  @media only screen and (max-width: 700px) {
    .wrap { padding:8px !important; }
    .header { padding:16px !important; }
    .header h2 { font-size:18px !important; }
    .body { padding:14px !important; }
    .meta td { display:block !important; width:100% !important; padding:4px 0 !important; }

    .data thead { display:none !important; }
    .data, .data tbody, .data tr, .data td { display:block !important; width:100% !important; box-sizing:border-box; }
    .data tr.emp {
      margin:0 0 14px 0 !important;
      border:1px solid #cbd5e1 !important;
      border-radius:8px !important;
      overflow:hidden;
      background:#ffffff !important;
    }
    .data td.cell {
      border:none !important;
      border-bottom:1px solid #eef2f6 !important;
      text-align:right !important;
      padding:9px 12px !important;
      font-size:13px !important;
      overflow:hidden;
    }
    .data td.cell .lbl {
      display:inline-block !important;
      float:left;
      max-width:58%;
      text-align:left;
      font-weight:bold;
      color:#475569;
      padding-right:10px;
    }
    .data td.cell.title {
      background:#0f172a !important;
      color:#ffffff !important;
      text-align:left !important;
      font-size:14px !important;
      font-weight:bold;
    }
    .data td.cell.title .lbl { display:none !important; }
  }
`;

const TD = "border:1px solid #dfe3e8;padding:8px 6px;font-size:12px;line-height:1.35;word-break:break-word;";

/* ------------------------------ rows ------------------------------ */

function cell(label, value, { align = "left", extraStyle = "", cls = "cell" } = {}) {
  return `<td class="${cls}" style="${TD}text-align:${align};${extraStyle}"><span class="lbl">${escapeHtml(label)}</span>${escapeHtml(String(value))}</td>`;
}

function rowForEmployee(employee, index) {
  const e = normalizeEmployee(employee);
  const bg = index % 2 === 0 ? "#ffffff" : "#f8fafc";

  return `
    <tr class="emp" style="background:${bg};">
      ${cell("Employee Code", e.code)}
      ${cell("Employee Name", e.name)}
      ${cell("State", e.state)}
      ${cell("Division", e.division)}
      ${cell("Visits Planned", formatNumber(e.visitsPlanned), { align: "right" })}
      ${cell("Actual Visits", formatNumber(e.actualVisits), { align: "right" })}
      ${cell("Marketing / Field Activity Planned", formatNumber(e.marketingPlanned), { align: "right" })}
      ${cell("Marketing / Field Activity Done", formatNumber(e.marketingDone), { align: "right" })}
      ${cell("Working Days", formatNumber(e.eligibleWorkingDays), { align: "right" })}
      ${cell("100% Adherence Days", formatNumber(e.fullMjpAdherenceDays), { align: "right" })}
      ${cell("Final MJP Adherence", formatPercent(e.mjp), {
    align: "right",
    extraStyle: `font-weight:bold;color:${mjpColor(e.mjp)};`,
  })}
    </tr>
  `;
}

function headerCell(text, width, align = "left") {
  return `<th style="border:1px solid #dfe3e8;padding:8px 6px;font-size:11px;line-height:1.3;text-align:${align};vertical-align:bottom;width:${width};color:#0f172a;">${text}</th>`;
}

/* ------------------------------ email ------------------------------ */

export function buildVerticalHeadEmail(group) {
  const employeesList = group.employees || [];
  const rows = employeesList.map((employee, i) => rowForEmployee(employee, i)).join("");
  const reportingPeriod = group.reportingPeriod || "N/A";
  const state = group.state || "All States";
  const division = group.division || "All Divisions";
  const to = (group.to || []).join(", ");
  const cc = (group.cc || []).join(", ");

  const emptyRow = `<tr><td colspan="11" style="border:1px solid #dfe3e8;padding:14px;font-size:13px;">No employee records available for this report.</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Vertical Head / RSM Massist Report</title>
  <style>${EMAIL_CSS}</style>
</head>
<body style="margin:0;padding:0;background:#eef2f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef2f6;">
    <tr>
      <td align="center" class="wrap" style="padding:20px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:900px;width:100%;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

          <tr>
            <td class="header" style="background:#0f172a;padding:20px 24px;border-radius:8px 8px 0 0;color:#ffffff;">
              <h2 style="margin:0;font-size:22px;line-height:1.3;color:#ffffff;">Vertical Head / RSM Massist Report</h2>
            </td>
          </tr>

          <tr>
            <td class="body" style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 8px 8px;">

              <table role="presentation" class="meta" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;font-size:14px;">
                <tr>
                  <td style="padding:2px 0;width:34%;"><strong>Reporting Period:</strong> ${escapeHtml(String(reportingPeriod))}</td>
                  <td style="padding:2px 0;width:33%;"><strong>State:</strong> ${escapeHtml(String(state))}</td>
                  <td style="padding:2px 0;width:33%;"><strong>Division:</strong> ${escapeHtml(String(division))}</td>
                </tr>
              </table>

              <table role="presentation" class="data" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;table-layout:fixed;width:100%;background:#ffffff;">
                <thead>
                  <tr style="background:#e2e8f0;">
                    ${headerCell("Emp. Code", "8%")}
                    ${headerCell("Employee Name", "14%")}
                    ${headerCell("State", "9%")}
                    ${headerCell("Division", "9%")}
                    ${headerCell("Visits Planned", "8%", "right")}
                    ${headerCell("Actual Visits", "8%", "right")}
                    ${headerCell("Mktg / Field Activity Planned", "9%", "right")}
                    ${headerCell("Mktg / Field Activity Done", "9%", "right")}
                    ${headerCell("Working Days", "8%", "right")}
                    ${headerCell("100% Adherence Days", "9%", "right")}
                    ${headerCell("Final MJP Adherence", "9%", "right")}
                  </tr>
                </thead>
                <tbody>
                  ${rows || emptyRow}
                </tbody>
              </table>

              <p style="margin:18px 0 0 0;font-size:11px;color:#64748b;">
                This is an automated report. MJP adherence colour key: green &ge; 90%, amber 70&ndash;89.99%, red &lt; 70%.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textLines = [
    "Vertical Head / RSM Massist Report",
    `Reporting Period: ${reportingPeriod}`,
    `State: ${state}`,
    `Division: ${division}`,
    `To: ${to || "N/A"}`,
    `CC: ${cc || "N/A"}`,
    "",
  ];

  for (const employee of employeesList) {
    const e = normalizeEmployee(employee);
    textLines.push(
      `${e.name} (${e.code}) - ${e.state} / ${e.division}`,
      `  Visits: ${formatNumber(e.actualVisits)} / ${formatNumber(e.visitsPlanned)} planned`,
      `  Marketing / Field Activity: ${formatNumber(e.marketingDone)} / ${formatNumber(e.marketingPlanned)} planned`,
      `  Eligible Working Days: ${formatNumber(e.eligibleWorkingDays)}`,
      `  100% Adherence Days: ${formatNumber(e.fullMjpAdherenceDays)}`,
      `  Final MJP Adherence: ${formatPercent(e.mjp)}`,
      ""
    );
  }

  return {
    // Subjects are plain text, so they must NOT be HTML-escaped.
    subject: `Massist MJP Performance Summary - ${reportingPeriod} - ${state} - ${division}`,
    html,
    text: textLines.join("\n"),
  };
}

/* ------------------------------ sender ------------------------------ */

export async function sendVerticalHeadEmailGroup(group) {
  if (!Array.isArray(group.to) || group.to.length === 0) {
    throw new Error("No valid recipients configured for this report group.");
  }

  const { subject, html, text } = buildVerticalHeadEmail(group);
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || "noreply@local";

  const toRecipients = [...new Set(group.to.map((email) => email.trim().toLowerCase()))];
  const ccRecipients = [
    ...new Set(
      [...(group.cc || []), ...GLOBAL_CC_RECIPIENTS]
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email && !toRecipients.includes(email))
    ),
  ];

  await transporter.sendMail({
    from,
    to: toRecipients.join(", "),
    cc: ccRecipients.length ? ccRecipients.join(", ") : undefined,
    subject,
    html,
    text,
  });

  return { subject, recipients: toRecipients, cc: ccRecipients };
}