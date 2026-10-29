function percentage(actual, planned) {
    if (planned === 0) return null;
    return Number(((actual / planned) * 100).toFixed(2));
}

export function isEligibleAttendanceStatus(status) {
    const normalized = String(status ?? "").trim().toLowerCase();
    return normalized === "p" || normalized === "P (System Off)" || normalized === "p (system off)";
}

export function filterEligibleAttendanceRows(rows) {
    return rows.filter((row) => isEligibleAttendanceStatus(row["Attendance Status"]));
}

function numericOrZero(value) {
    if (value === null || value === undefined ||
        (typeof value === "string" && value.trim() === "")) return 0;
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

export function calculateDailyMjpAdherence(row) {
    const planned = numericOrZero(row.NoOfFieldActivityPlanned) +
        numericOrZero(row.NoofVisitsPlanned);
    if (planned <= 0) return null;

    const completed = numericOrZero(row.NoOfFieldActivityDone) +
        numericOrZero(row.ActualVisits);
    const adherence = Math.min(100, (completed / planned) * 100);
    return Number.isFinite(adherence) ? adherence : null;
}

export function calculateEmployeeReports(rows) {
    const reports = new Map();

    // The database unique key and upload validation use employee/date. Keep
    // report calculations on that same grain if called with duplicate rows.
    const rowsByEmployeeDate = new Map();
    for (const row of rows) {
        if (row.EmpCode == null || !isEligibleAttendanceStatus(row.AttendanceStatus)) continue;
        const dateKey = row.Date instanceof Date
            ? row.Date.toISOString().slice(0, 10)
            : String(row.Date ?? "");
        rowsByEmployeeDate.set(`${row.EmpCode}:${dateKey}`, row);
    }

    for (const row of rowsByEmployeeDate.values()) {
        if (row.EmpCode == null) continue;

        const dailyMjpAdherencePct = calculateDailyMjpAdherence(row);

        if (!reports.has(row.EmpCode)) {
            reports.set(row.EmpCode, {
                EmpCode: row.EmpCode,
                employeeName: row.EmployeeName,
                totalRecords: 0,
                startDate: row.Date,
                endDate: row.Date,

                visitsPlanned: 0,
                actualVisits: 0,

                marketingPlanned: 0,
                marketingDone: 0,
                eligibleWorkingDays: 0,
                fullMjpAdherenceDays: 0,
                dailyRecords: [],
            });
        }

        const report = reports.get(row.EmpCode);

        report.totalRecords++;
        report.eligibleWorkingDays++;
        if (dailyMjpAdherencePct === 100) report.fullMjpAdherenceDays++;
        report.dailyRecords.push({
            Date: row.Date,
            AttendanceStatus: row.AttendanceStatus,
            dailyMjpAdherencePct,
        });

        if (row.Date) {
            const currentDate = new Date(row.Date);

            if (
                !report.startDate ||
                currentDate < new Date(report.startDate)
            ) {
                report.startDate = row.Date;
            }

            if (
                !report.endDate ||
                currentDate > new Date(report.endDate)
            ) {
                report.endDate = row.Date;
            }
        }
        report.visitsPlanned += row.NoofVisitsPlanned ?? 0;
        report.actualVisits += row.ActualVisits ?? 0;

        report.marketingPlanned +=
            row.NoOfFieldActivityPlanned ?? 0;

        report.marketingDone += row.NoOfFieldActivityDone ?? 0;
    }

    return [...reports.values()].map((report) => ({
        ...report,

        visitPercentage: percentage(
            report.actualVisits,
            report.visitsPlanned
        ),

        marketingPercentage: percentage(
            report.marketingDone,
            report.marketingPlanned
        ),

        mjpAdherencePct: report.eligibleWorkingDays === 0
            ? null
            : Number(((report.fullMjpAdherenceDays / report.eligibleWorkingDays) * 100).toFixed(2)),

        hasMarketingActivity:
            report.marketingPlanned > 0 ||
            report.marketingDone > 0,
    }));
}
