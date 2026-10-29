import prisma from "../Config/index.js";
import transporter from "../utils/mailer.js";

function formatNumber(value) {
  return Number(value).toLocaleString("en-IN");
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}
function formatDate(date) {
  if (!date) return "N/A";

  const d = new Date(date);

  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();

  return `${day}-${month}-${year}`;
}

// function buildEmail(report, mapping) {
//     const visitPercentage =
//         report.visitPercentage === null
//             ? "N/A"
//             : `${report.visitPercentage}%`;

//     const marketingPercentage =
//         report.marketingPercentage === null
//             ? "N/A"
//             : `${report.marketingPercentage}%`;

//     return {
//         subject: `Field Visit & Marketing Activity Report - ${report.employeeName}`,

//         html: `
//       <div style="font-family:Arial,sans-serif;max-width:650px">
//         <h2>Employee Performance Report</h2>

//         <p>Hello ${escapeHtml(mapping.EmployeeName || report.employeeName)},</p>

//         <p>Here is your performance summary for the uploaded Massist sheet.</p>

//         <table cellpadding="10" cellspacing="0"
//           style="border-collapse:collapse;width:100%">
//           <tr>
//             <td style="border:1px solid #ddd">Employee Code</td>
//             <td style="border:1px solid #ddd">${report.EmpCode}</td>
//           </tr>
//           <tr>
//             <td style="border:1px solid #ddd">Total Records</td>
//             <td style="border:1px solid #ddd">${report.totalRecords}</td>
//           </tr>
//           <tr>
//             <td style="border:1px solid #ddd">Visits Planned</td>
//             <td style="border:1px solid #ddd">${formatNumber(report.visitsPlanned)}</td>
//           </tr>
//           <tr>
//             <td style="border:1px solid #ddd">Actual Visits</td>
//             <td style="border:1px solid #ddd">${formatNumber(report.actualVisits)}</td>
//           </tr>
//           <tr>
//             <td style="border:1px solid #ddd">Visit Completion</td>
//             <td style="border:1px solid #ddd"><strong>${visitPercentage}</strong></td>
//           </tr>
//           <tr>
//             <td style="border:1px solid #ddd">Marketing Activities Planned</td>
//             <td style="border:1px solid #ddd">${formatNumber(report.marketingPlanned)}</td>
//           </tr>
//           <tr>
//             <td style="border:1px solid #ddd">Marketing Activities Done</td>
//             <td style="border:1px solid #ddd">${formatNumber(report.marketingDone)}</td>
//           </tr>
//           <tr>
//             <td style="border:1px solid #ddd">Marketing Activity Completion</td>
//             <td style="border:1px solid #ddd"><strong>${marketingPercentage}</strong></td>
//           </tr>
//         </table>

//         <p>Regards,<br/>Sales Reporting System</p>
//       </div>
//     `,
//     };
// }

export async function sendEmployeeReports(reports) {
  const employeeCodes = reports.map((report) => report.EmpCode);

  const mappings = await prisma.Mapping.findMany({
    where: {
      EmployeeCode: { in: employeeCodes },
    },
  });

  const mappingByCode = new Map(
    mappings.map((mapping) => [mapping.EmployeeCode, mapping])
  );

  const result = {
    attempted: 0,
    sent: 0,
    skipped: [],
    failed: [],
  };

  for (const report of reports) {
    const mapping = mappingByCode.get(report.EmpCode);

    if (!mapping) {
      result.skipped.push({
        EmpCode: report.EmpCode,
        reason: "Employee not found in Mapping",
      });
      continue;
    }

    if (!mapping.EmployeeEmailID) {
      result.skipped.push({
        EmpCode: report.EmpCode,
        reason: "Employee email missing",
      });
      continue;
    }

    // Business rule: skip the entire email if there is no
    // marketing activity planned and none completed.
    if (!report.hasMarketingActivity) {
      result.skipped.push({
        EmpCode: report.EmpCode,
        reason: "No marketing activity",
      });
      continue;
    }

    const cc = [
      mapping.ReportingManagerEmailID,
    ]
      .filter(Boolean)
      .filter((email, index, all) =>
        email !== mapping.EmployeeEmailID &&
        all.indexOf(email) === index
      );

    const email = buildEmail(report, mapping);
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;

    result.attempted++;

    // try {
    //     await transporter.sendMail({
    //         from: process.env.MAIL_FROM || process.env.SMTP_USER,
    //         to: mapping.EmployeeEmailID,
    //         cc,
    //         subject: email.subject,
    //         html: email.html,
    //     });

    //     result.sent++;
    // } catch (error) {
    //     result.failed.push({
    //         EmpCode: report.EmpCode,
    //         error: error.message,
    //     });
    // }
    try {
      const info = await transporter.sendMail({
        from,
        to: mapping.EmployeeEmailID,
        cc,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      result.sent++;
    } catch (error) {
      result.failed.push({
        EmpCode: report.EmpCode,
        email: mapping.EmployeeEmailID,
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      });

      console.error("MASSIST EMAIL FAILED", {
        employeeCode: report.EmpCode,
        email: mapping.EmployeeEmailID,
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      });
    }
  }

  return result;
}


/**
 * Professional performance report email.
 * - Table-based layout + inline styles (works in Gmail, Outlook, Apple Mail, mobile)
 * - Colour-coded progress bars and status badges
 * - Plain-text fallback included
 *
 * Assumes escapeHtml() and formatNumber() already exist in your project.
 */

// ---- Brand settings: change these to match your company ----
const BRAND = {
  companyName: "Kriti Industries India Limited",
  primary: "#1e3a8a",   // header colour (deep blue)
  accent: "#2563eb",
  text: "#1f2937",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f3f4f6",
};

function getStatus(pct) {
  if (pct === null || pct === undefined || isNaN(Number(pct))) {
    return { label: "No Data", color: "#6b7280", bg: "#f3f4f6", bar: "#9ca3af" };
  }
  const v = Number(pct);
  if (v >= 90) return { label: "Excellent", color: "#166534", bg: "#dcfce7", bar: "#16a34a" };
  if (v >= 70) return { label: "On Track", color: "#1e40af", bg: "#dbeafe", bar: "#2563eb" };
  if (v >= 50) return { label: "Needs Attention", color: "#92400e", bg: "#fef3c7", bar: "#f59e0b" };
  return { label: "Below Target", color: "#991b1b", bg: "#fee2e2", bar: "#dc2626" };
}

function fmtPct(pct) {
  if (pct === null || pct === undefined || isNaN(Number(pct))) return "N/A";
  return `${Number(pct).toFixed(2)}%`;
}

function metricCard(title, planned, actual, pct, plannedLabel, actualLabel) {
  const s = getStatus(pct);
  const width = pct === null || pct === undefined || isNaN(Number(pct))
    ? 0
    : Math.max(0, Math.min(100, Number(pct)));

  return `
    <tr>
      <td style="padding:0 32px 20px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="border:1px solid ${BRAND.border};border-radius:8px;">
          <tr>
            <td style="padding:20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:16px;font-weight:bold;color:${BRAND.text};">${title}</td>
                  
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
                <tr>
                  <td style="font-size:36px;font-weight:bold;color:${s.bar};line-height:40px;">${fmtPct(pct)}</td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:${BRAND.muted};padding-bottom:10px;">Completion rate</td>
                </tr>
              </table>

              <!-- Progress bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#e5e7eb;border-radius:6px;">
                <tr>
                  <td width="${width}%" height="10" style="background:${s.bar};border-radius:6px;font-size:0;line-height:0;">&nbsp;</td>
                  <td height="10" style="font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Planned vs Actual -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
                <tr>
                  <td width="50%" style="padding-right:8px;">
                    <div style="font-size:12px;color:${BRAND.muted};">${plannedLabel}</div>
                    <div style="font-size:20px;font-weight:bold;color:${BRAND.text};">${formatNumber(planned)}</div>
                  </td>
                  <td width="50%" style="padding-left:8px;border-left:1px solid ${BRAND.border};">
                    <div style="font-size:12px;color:${BRAND.muted};padding-left:8px;">${actualLabel}</div>
                    <div style="font-size:20px;font-weight:bold;color:${BRAND.text};padding-left:8px;">${formatNumber(actual)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function buildEmail(report, mapping) {
  const name = escapeHtml(mapping.EmployeeName || report.employeeName);
  const empCode = escapeHtml(String(report.EmpCode ?? "-"));
  const year = new Date().getFullYear();
  const mjpPct = report.mjpAdherencePct == null
    ? "N/A"
    : `${Number(report.mjpAdherencePct).toFixed(2)}%`;
  const dailyRows = (report.dailyRecords || []).map((day) => `
      <tr>
        <td style="padding:8px;border:1px solid ${BRAND.border};">${formatDate(day.Date)}</td>
        <td style="padding:8px;border:1px solid ${BRAND.border};">${escapeHtml(day.AttendanceStatus || "")}</td>
        <td style="padding:8px;border:1px solid ${BRAND.border};text-align:right;">${day.dailyMjpAdherencePct == null ? "N/A" : `${Number(day.dailyMjpAdherencePct).toFixed(2)}%`}</td>
      </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Field Visit &amp; Marketing Activity Report</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:${BRAND.text};">

  <!-- Hidden preheader text (shown in inbox preview) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Visit completion ${fmtPct(report.visitPercentage)} | Marketing completion ${fmtPct(report.marketingPercentage)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0"
          style="width:100%;max-width:640px;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid ${BRAND.border};">

          <!-- Header -->
          <tr>
            <td style="background:${BRAND.primary};padding:28px 32px;">
              <div style="font-size:12px;letter-spacing:1.5px;color:#bfdbfe;text-transform:uppercase;">${escapeHtml(BRAND.companyName)}</div>
              <div style="font-size:24px;font-weight:bold;color:#ffffff;margin-top:6px;">Performance Report</div>
              <div style="font-size:14px;color:#dbeafe;margin-top:4px;">Field Visit &amp; Marketing Activity Summary</div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <p style="margin:0 0 10px 0;font-size:16px;">Dear <strong>${name}</strong>,</p>
              <p style="margin:0;font-size:14px;line-height:22px;color:#374151;">
                Please find below your performance summary based on the latest Massist data. Kindly review the figures and reach out to your manager if you notice any discrepancy.
              </p>
            </td>
          </tr>

          <!-- Employee info strip -->
          <tr>
            <td style="padding:20px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#f9fafb;border:1px solid ${BRAND.border};border-radius:8px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <div style="font-size:11px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:1px;">Employee Code</div>
                    <div style="font-size:16px;font-weight:bold;">${empCode}</div>
                  </td>
                  <td style="padding:14px 18px;border-left:1px solid ${BRAND.border};">
                    <div style="font-size:11px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:1px;">Total Day's</div>
                    <div style="font-size:16px;font-weight:bold;">${formatNumber(report.totalRecords)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
             ${metricCard(
    "MJP Adherence",
    report.eligibleWorkingDays,
    report.fullMjpAdherenceDays,
    report.mjpAdherencePct,
    "Working Days",
    "100% Adherence Days"
  )}
          <tr>
            <td style="padding:0 32px 20px 32px;">
              <p style="margin:0;font-size:14px;line-height:22px;color:#374151;">
                ${formatNumber(report.fullMjpAdherenceDays)} days at 100% of ${formatNumber(report.eligibleWorkingDays)} working days
              </p>
            </td>
          </tr>
          ${metricCard("Field Visits", report.visitsPlanned, report.actualVisits, report.visitPercentage, "Visits Planned", "Actual Visits")}
          ${metricCard("Marketing Activities", report.marketingPlanned, report.marketingDone, report.marketingPercentage, "Activities Planned", "Activities Done")}
         <tr>
         <!-- Sign-off -->
          <tr>
            <td style="padding:0 32px 28px 32px;font-size:14px;line-height:22px;color:#374151;">
              Regards,<br/>
              <strong>Sales Reporting Team</strong><br/>
              <span style="color:${BRAND.muted};">${escapeHtml(BRAND.companyName)}</span>
            </td>
          </tr>

             <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid ${BRAND.border};padding:18px 32px;font-size:11px;line-height:17px;color:#9ca3af;text-align:center;">
              This is an automatically generated email. Please do not reply to this message.<br/>
              &copy; ${year} ${escapeHtml(BRAND.companyName)}. All rights reserved.
            </td>
          </tr>
          </table>
        </td>
      </tr>
      
    </table>
  </td>
</tr>
          

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain-text fallback (improves deliverability and supports text-only clients)
  const text = [
    `Performance Report - ${report.employeeName}`,
    ``,
    `Employee Code: ${report.EmpCode}`,
    `Total Day's: ${formatNumber(report.totalRecords)}`,
    ``,
    `FIELD VISITS`,
    `  Planned: ${formatNumber(report.visitsPlanned)}`,
    `  Actual: ${formatNumber(report.actualVisits)}`,
    `  Completion: ${fmtPct(report.visitPercentage)}`,
    ``,
    `MARKETING ACTIVITIES`,
    `  Planned: ${formatNumber(report.marketingPlanned)}`,
    `  Done: ${formatNumber(report.marketingDone)}`,
    `  Completion: ${fmtPct(report.marketingPercentage)}`,
    ``,
    `MJP ADHERENCE`,
    `  Employee adherence: ${mjpPct}`,
    `  100% days: ${report.fullMjpAdherenceDays} of ${report.eligibleWorkingDays} working days`,
    ``,
    `DAILY MJP ADHERENCE`,
    ...(report.dailyRecords || []).map((day) =>
      `  ${formatDate(day.Date)} | ${day.AttendanceStatus || ""} | ${day.dailyMjpAdherencePct == null ? "N/A" : `${Number(day.dailyMjpAdherencePct).toFixed(2)}%`}`
    ),
    ``,
    `Regards,`,
    `Sales Reporting Team`,
  ].join("\n");

  return {
    subject: `Field Visit & Marketing Activity Report (${formatDate(report.startDate)} to ${formatDate(report.endDate)}) - ${report.employeeName}`,
    html,
    text,
  };
}
function mjpAdherenceCard(report) {
  const rawPct = report.mjpAdherencePct;
  const validPct =
    rawPct !== null &&
    rawPct !== undefined &&
    Number.isFinite(Number(rawPct));

  const pct = validPct
    ? Math.max(0, Math.min(100, Number(rawPct)))
    : 0;

  const status = getStatus(pct);

  const displayPct = validPct
    ? `${Number(rawPct).toFixed(2)}%`
    : "N/A";

  return `
      <tr>
        <td style="padding:0 32px 20px 32px;">
          <table role="presentation" width="100%" cellpadding="0"
            cellspacing="0" border="0"
            style="border:1px solid ${BRAND.border};border-radius:8px;">

            <tr>
              <td style="padding:18px 20px 8px;font-size:16px;font-weight:bold;color:${BRAND.text};">
                MJP Adherence
              </td>
            </tr>

            <tr>
              <td style="padding:0 20px;font-size:28px;font-weight:bold;color:${status.color};">
                ${displayPct}
              </td>
            </tr>

            <tr>
              <td style="padding:4px 20px 12px;font-size:13px;color:${BRAND.muted};">
                Completion rate
              </td>
            </tr>

            <tr>
              <td style="padding:0 20px 16px;">
                <table role="presentation" width="100%" cellpadding="0"
                  cellspacing="0" border="0"
                  style="background:${BRAND.border};border-radius:4px;">
                  <tr>
                    <td width="${pct}%" height="8"
                      style="height:8px;background:${status.color};border-radius:4px;font-size:0;line-height:0;">
                      &nbsp;
                    </td>
                    <td style="height:8px;font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 20px 18px;">
                <table role="presentation" width="100%" cellpadding="0"
                  cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:12px;color:${BRAND.muted};">
                      100% Adherence Days
                    </td>
                    <td align="right"
                      style="font-size:16px;font-weight:bold;color:${BRAND.text};">
                      ${formatNumber(report.fullMjpAdherenceDays)}
                    </td>
                    <td style="padding-left:20px;font-size:12px;color:${BRAND.muted};">
                      Working Days
                    </td>
                    <td align="right"
                      style="font-size:16px;font-weight:bold;color:${BRAND.text};">
                      ${formatNumber(report.eligibleWorkingDays)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>`;
}


