import test from "node:test";
import assert from "node:assert/strict";
import {
    calculateDailyMjpAdherence,
    calculateEmployeeReports,
    filterEligibleAttendanceRows,
} from "../src/utils/massistCalculations.js";

function day(overrides = {}) {
    return {
        EmpCode: 101,
        EmployeeName: "Test Employee",
        Date: new Date("2026-10-01T00:00:00.000Z"),
        AttendanceStatus: "P",
        NoOfFieldActivityPlanned: 2,
        NoOfFieldActivityDone: 1,
        NoofVisitsPlanned: 2,
        ActualVisits: 1,
        ...overrides,
    };
}

test("attendance filter accepts P and P System off case-insensitively with whitespace", () => {
    const rows = [
        { "Attendance Status": " P " },
        { "Attendance Status": "p system off" },
        { "Attendance Status": " A " },
    ];
    assert.deepEqual(filterEligibleAttendanceRows(rows), rows.slice(0, 2));
});

test("ineligible attendance is excluded from employee totals and daily reports", () => {
    const reports = calculateEmployeeReports([
        day(),
        day({ Date: new Date("2026-10-02T00:00:00.000Z"), AttendanceStatus: "A", ActualVisits: 100 }),
    ]);
    assert.equal(reports[0].totalRecords, 1);
    assert.equal(reports[0].eligibleWorkingDays, 1);
    assert.equal(reports[0].dailyRecords.length, 1);
});

test("daily adherence handles below, exactly, and above 100 percent", () => {
    assert.equal(calculateDailyMjpAdherence(day()), 50);
    assert.equal(calculateDailyMjpAdherence(day({ NoOfFieldActivityDone: 2, ActualVisits: 2 })), 100);
    assert.equal(calculateDailyMjpAdherence(day({ NoOfFieldActivityDone: 4, ActualVisits: 3 })), 100);
});

test("zero or negative planned total has undefined adherence", () => {
    assert.equal(calculateDailyMjpAdherence(day({ NoOfFieldActivityPlanned: 0, NoofVisitsPlanned: 0 })), null);
    assert.equal(calculateDailyMjpAdherence(day({ NoOfFieldActivityPlanned: -1, NoofVisitsPlanned: 0 })), null);
});

test("null, blank, missing, and invalid numeric values are safely treated as zero", () => {
    assert.equal(calculateDailyMjpAdherence(day({
        NoOfFieldActivityPlanned: null,
        NoofVisitsPlanned: "",
        NoOfFieldActivityDone: undefined,
        ActualVisits: "not a number",
    })), null);
    assert.equal(calculateDailyMjpAdherence(day({
        NoOfFieldActivityPlanned: 2,
        NoofVisitsPlanned: 0,
        NoOfFieldActivityDone: 1,
        ActualVisits: null,
    })), 50);
});

test("employee adherence counts eligible days, zero-plan days in denominator, and deduplicates employee/date", () => {
    const date2 = new Date("2026-10-02T00:00:00.000Z");
    const date3 = new Date("2026-10-03T00:00:00.000Z");
    const reports = calculateEmployeeReports([
        day({ NoOfFieldActivityDone: 2, ActualVisits: 2 }),
        day({ NoOfFieldActivityDone: 0, ActualVisits: 0 }), // same date: database upsert's final row wins
        day({ Date: date2, AttendanceStatus: " P System off ", NoOfFieldActivityPlanned: 0, NoofVisitsPlanned: 0 }),
        day({ Date: date3, NoOfFieldActivityDone: 2, ActualVisits: 2 }),
    ]);
    assert.equal(reports[0].eligibleWorkingDays, 3);
    assert.equal(reports[0].fullMjpAdherenceDays, 1);
    assert.equal(reports[0].mjpAdherencePct, 33.33);
    assert.equal(reports[0].dailyRecords.length, 3);
    assert.equal(reports[0].dailyRecords[0].dailyMjpAdherencePct, 0);
    assert.equal(reports[0].dailyRecords[1].dailyMjpAdherencePct, null);
});
