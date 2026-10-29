import prisma from "../Config/index.js";
import XLSX from "xlsx";
import { parseMassistExcel } from "../utils/excelParser.js";
import {
    calculateEmployeeReports,
    isEligibleAttendanceStatus,
} from "../utils/massistCalculations.js";

function parseDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return new Date(
            Date.UTC(
                value.getFullYear(),
                value.getMonth(),
                value.getDate()
            )
        );
    }

    if (typeof value === "number") {
        // Excel serial date
        const parsed = XLSX.SSF.parse_date_code(value);

        if (!parsed) throw new Error("Invalid Excel date");

        return new Date(
            Date.UTC(parsed.y, parsed.m - 1, parsed.d)
        );
    }

    if (typeof value === "string") {
        const match = value.trim().match(
            /^(\d{2})-(\d{2})-(\d{4})$/
        );

        if (match) {
            return new Date(
                Date.UTC(+match[3], +match[2] - 1, +match[1])
            );
        }
    }

    throw new Error(`Invalid date: ${value}`);
}

function numberOrNull(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const result = Number(value);

    if (!Number.isFinite(result)) {
        throw new Error(`Invalid numeric value: ${value}`);
    }

    return result;
}

function stringOrNull(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    return String(value).trim();
}

function mapVisitRow(row) {
    const EmpCode = numberOrNull(row["Emp Code"]);

    if (!Number.isInteger(EmpCode) || EmpCode <= 0) {
        throw new Error(`Invalid employee code: ${row["Emp Code"]}`);
    }

    const Date = parseDate(row["Date"]);

    const NoofVisitsPlanned = numberOrNull(row["NoofVisitsPlanned"]);
    const ActualVisits = numberOrNull(row["ActualVisits"]);
    const NoOfFieldActivityPlanned = numberOrNull(
        row["No Of Field Activity Planned"]
    );
    const NoOfFieldActivityDone = numberOrNull(
        row["No Of Field Activity Done"]
    );

    for (const [name, value] of Object.entries({
        NoofVisitsPlanned,
        ActualVisits,
        NoOfFieldActivityPlanned,
        NoOfFieldActivityDone,
    })) {
        if (value !== null && (!Number.isInteger(value) || value < 0)) {
            throw new Error(`Invalid ${name} for employee ${EmpCode}`);
        }
    }

    return {
        EmpCode,
        Date,

        Day: stringOrNull(row["Day"]),
        EmployeeZone: stringOrNull(row["Employee Zone"]),
        EmployeeState: stringOrNull(row["Employee State"]),
        EmployeeCity: stringOrNull(row["Employee City"]),
        EmployeeName: stringOrNull(row["Employee Name"]),
        EmployeeMobile: stringOrNull(row["Employee Mobile"]),
        EmployeeDesignation: stringOrNull(row["Employee Designation"]),
        ReportingHead: stringOrNull(row["Reporting Head"]),
        ReportingHeadPhone: stringOrNull(row["Reporting Head Phone"]),
        AttendanceStatus: stringOrNull(row["Attendance Status"]),
        WorkingStatus: stringOrNull(row["Working Status"]),
        Device: stringOrNull(row["Device"]),
        Beat: stringOrNull(row["Beat"]),

        TC: numberOrNull(row["TC"]),
        PC: numberOrNull(row["PC"]),

        FirstVisitCheckinTime: stringOrNull(
            row["First Visit Checkin Time"]
        ),
        LastVisitEndTime: stringOrNull(row["Last Visit End Time"]),
        StartTime: stringOrNull(row["StartTime"]),
        EndTime: stringOrNull(row["EndTime"]),

        TotalClients: numberOrNull(row["Total Clients"]),
        NewClients: numberOrNull(row["New Clients"]),
        Version: stringOrNull(row["Version"]),

        TotalDistanceTravelled: numberOrNull(
            row["Total Distance Travelled"]
        ),
        VisitStayTime: stringOrNull(row["Visit Stay Time"]),
        FirstStartCounter: stringOrNull(row["First Start Counter"]),
        TotalDistanceTravelledByRoute: numberOrNull(
            row["Total Distance Travelled By Route"]
        ),

        FirstFieldActivityStartTime: stringOrNull(
            row["FirstFieldActivityStartTime"]
        ),

        NoOfFieldActivityPlanned,
        NoOfFieldActivityDone,
        NoofVisitsPlanned,
        UnplannedVisits: numberOrNull(row["UnplannedVisits"]),
        ActualVsPlanned: stringOrNull(row["ActualVsPlanned"]),
        RetailingTime: stringOrNull(row["RetailingTime"]),
        DealerVisit: numberOrNull(row["DealerVisit"]),
        LeadsVisit: numberOrNull(row["LeadsVisit"]),
        ActualVisits,
        TotalOL: numberOrNull(row["Total O/L"]),
        VisitedTown: stringOrNull(row["Visited Town"]),
        PJPRemarks: stringOrNull(row["PJPRemarks"]),
        PJPBeats: stringOrNull(row["PJPBeats"]),
        Diverson: stringOrNull(row["Diverson"]),
        PJPLastBeats: stringOrNull(row["PJPLastBeats"]),
        PJPFirstBeats: stringOrNull(row["PJPFirstBeats"]),
        Division: stringOrNull(row["Division"]),
    };
}

export async function importMassistSheet(buffer) {
    // Keep the import atomic: a bad row must not leave a partial import.
    const rows = parseMassistExcel(buffer);

    // Exclude non-working attendance rows before mapping/validation, writes,
    // duplicate detection, and report calculations.
    const eligibleRows = rows
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => isEligibleAttendanceStatus(row["Attendance Status"]));
    const prepared = eligibleRows.map(({ row, index }) => {
        try {
            return mapVisitRow(row);
        } catch (error) {
            throw new Error(`Excel row ${index + 2}: ${error.message}`);
        }
    });

    // Prevent ambiguous last-write-wins behavior for duplicate keys
    // within the same uploaded sheet.
    const seen = new Set();

    for (const row of prepared) {
        const key = `${row.EmpCode}:${row.Date.toISOString().slice(0, 10)}`;

        if (seen.has(key)) {
            throw new Error(`Duplicate employee/date in sheet: ${key}`);
        }

        seen.add(key);
    }

    const result = await prisma.$transaction(
        async (tx) => {
            let inserted = 0;
            let updated = 0;

            for (const row of prepared) {
                const existing = await tx.visits.findUnique({
                    where: {
                        EmpCode_Date_unique: {
                            EmpCode: row.EmpCode,
                            Date: row.Date,
                        },
                    },
                    select: { Id: true },
                });

                const { EmpCode, Date, ...data } = row;

                await tx.visits.upsert({
                    where: {
                        EmpCode_Date_unique: { EmpCode, Date },
                    },
                    create: { EmpCode, Date, ...data },
                    update: data,
                });

                if (existing) updated++;
                else inserted++;
            }

            return {
                inserted,
                updated,
                totalRows: prepared.length,
            };
        },
        {
            maxWait: 10000,
            timeout: 120000,
        }
    );
    const reports = calculateEmployeeReports(prepared);

    return { ...result, reports };
}
