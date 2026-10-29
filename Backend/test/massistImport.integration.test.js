import test from "node:test";
import assert from "node:assert/strict";
import XLSX from "xlsx";

const txState = {
    transactionCalls: 0,
    findUniqueCalls: [],
    upsertCalls: [],
};

const existingKeys = new Set(["101:2026-11-01"]);
const prismaMock = {
    Mapping: {
        async findMany({ where }) {
            prismaMock.mappingQueries.push(where.EmployeeCode.in);
            return where.EmployeeCode.in.map((EmployeeCode) => ({
                EmployeeCode,
                EmployeeName: `Employee ${EmployeeCode}`,
                EmployeeEmailID: `employee-${EmployeeCode}@example.test`,
                ReportingManagerEmailID: null,
                RSMEmailID: null,
            }));
        },
    },
    mappingQueries: [],
    async $transaction(callback) {
        txState.transactionCalls++;
        const tx = {
            visits: {
                async findUnique({ where }) {
                    txState.findUniqueCalls.push(where.EmpCode_Date_unique);
                    const { EmpCode, Date } = where.EmpCode_Date_unique;
                    const key = `${EmpCode}:${Date.toISOString().slice(0, 10)}`;
                    return existingKeys.has(key) ? { Id: 1n } : null;
                },
                async upsert(args) {
                    txState.upsertCalls.push(args);
                    return { Id: BigInt(txState.upsertCalls.length) };
                },
            },
        };
        return callback(tx);
    },
};

// Config/index.js uses this global override, allowing the real import service
// and controller to run without constructing or connecting a Prisma client.
globalThis.prisma = prismaMock;

const { importMassistSheet } = await import("../src/services/massistImportService.js");
const { uploadMassistReport } = await import("../src/Controllers/massistController.js");
const { default: transporter } = await import("../src/utils/mailer.js");

const HEADERS = [
    "Date",
    "Emp Code",
    "Employee Name",
    "Attendance Status",
    "NoofVisitsPlanned",
    "ActualVisits",
    "No Of Field Activity Planned",
    "No Of Field Activity Done",
];

function excelBuffer(rows) {
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EmployeeLocation");
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

function validRows() {
    return [
        {
            Date: "01-11-2026",
            "Emp Code": 101,
            "Employee Name": "Employee 101",
            "Attendance Status": " P ",
            NoofVisitsPlanned: 3,
            ActualVisits: 3,
            "No Of Field Activity Planned": 1,
            "No Of Field Activity Done": 1,
        },
        {
            Date: "02-11-2026",
            "Emp Code": 101,
            "Employee Name": "Employee 101",
            "Attendance Status": "P System off",
            NoofVisitsPlanned: 0,
            ActualVisits: 0,
            "No Of Field Activity Planned": 0,
            "No Of Field Activity Done": 0,
        },
        {
            Date: "03-11-2026",
            "Emp Code": "not-an-employee",
            "Employee Name": "Excluded A row",
            "Attendance Status": "A",
            NoofVisitsPlanned: "invalid-number",
            ActualVisits: 0,
            "No Of Field Activity Planned": 0,
            "No Of Field Activity Done": 0,
        },
        {
            Date: "not-a-date",
            "Emp Code": "not-an-employee",
            "Employee Name": "Excluded blank-status row",
            "Attendance Status": null,
            NoofVisitsPlanned: null,
            ActualVisits: null,
            "No Of Field Activity Planned": null,
            "No Of Field Activity Done": null,
        },
        {
            Date: "01-11-2026",
            "Emp Code": 202,
            "Employee Name": "Employee 202",
            "Attendance Status": "P",
            NoofVisitsPlanned: null,
            ActualVisits: null,
            "No Of Field Activity Planned": null,
            "No Of Field Activity Done": null,
        },
        {
            Date: "02-11-2026",
            "Emp Code": 202,
            "Employee Name": "Employee 202",
            "Attendance Status": "P",
            NoofVisitsPlanned: 1,
            ActualVisits: 1,
            "No Of Field Activity Planned": 1,
            "No Of Field Activity Done": 1,
        },
    ];
}

function resetDatabaseCalls() {
    txState.transactionCalls = 0;
    txState.findUniqueCalls = [];
    txState.upsertCalls = [];
    prismaMock.mappingQueries = [];
}

function responseMock() {
    return {
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
}

test("Excel import filters attendance, upserts eligible rows, and reports unique eligible days", async () => {
    resetDatabaseCalls();
    const result = await importMassistSheet(excelBuffer(validRows()));

    assert.deepEqual(
        txState.upsertCalls.map(({ create }) => [create.EmpCode, create.AttendanceStatus]),
        [[101, "P"], [101, "P System off"], [202, "P"], [202, "P"]],
    );
    assert.equal(result.totalRows, 4);
    assert.equal(result.inserted, 3);
    assert.equal(result.updated, 1);
    assert.equal(result.reports.length, 2);

    const employee101 = result.reports.find((report) => report.EmpCode === 101);
    const employee202 = result.reports.find((report) => report.EmpCode === 202);
    assert.equal(employee101.eligibleWorkingDays, 2);
    assert.equal(employee101.fullMjpAdherenceDays, 1);
    assert.equal(employee101.mjpAdherencePct, 50);
    assert.deepEqual(employee101.dailyRecords.map((day) => day.dailyMjpAdherencePct), [100, null]);
    assert.equal(employee202.eligibleWorkingDays, 2);
    assert.equal(employee202.fullMjpAdherenceDays, 1);
    assert.equal(employee202.mjpAdherencePct, 50);
    assert.deepEqual(employee202.dailyRecords.map((day) => day.dailyMjpAdherencePct), [null, 100]);

    const missingNumericUpsert = txState.upsertCalls.find(({ create }) => create.EmpCode === 202);
    assert.equal(missingNumericUpsert.create.NoofVisitsPlanned, null);
    assert.equal(missingNumericUpsert.create.ActualVisits, null);
});

test("duplicate eligible employee/date rows reject before any transaction or write", async () => {
    resetDatabaseCalls();
    const rows = validRows();
    rows.push({ ...rows[0], "Employee Name": "Duplicate row" });

    await assert.rejects(
        importMassistSheet(excelBuffer(rows)),
        /Duplicate employee\/date in sheet: 101:2026-11-01/,
    );
    assert.equal(txState.transactionCalls, 0);
    assert.equal(txState.upsertCalls.length, 0);
});

test("upload controller preserves existing response fields, reports MJP day totals, and schedules background email", async () => {
    resetDatabaseCalls();
    const scheduled = [];
    const originalSetImmediate = globalThis.setImmediate;
    const originalSendMail = transporter.sendMail;
    const sentMessages = [];
    globalThis.setImmediate = (callback) => {
        scheduled.push(callback);
        return 1;
    };
    transporter.sendMail = async (message) => {
        sentMessages.push(message);
        return { messageId: `mock-${sentMessages.length}` };
    };

    try {
        const response = responseMock();
        await uploadMassistReport({ file: { buffer: excelBuffer(validRows()) } }, response);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body.import, { totalRows: 4, inserted: 3, updated: 1 });
        assert.deepEqual(response.body.summary, {
            employeesProcessed: 2,
            totalRecords: 4,
            totalVisitsPlanned: 4,
            totalActualVisits: 4,
            totalMarketingPlanned: 2,
            totalMarketingDone: 2,
            totalEligibleWorkingDays: 4,
            totalFullMjpAdherenceDays: 2,
        });
        assert.equal(response.body.emails.status, "processing");
        assert.equal(scheduled.length, 1);

        // Run the scheduled job with mocked Mapping and SMTP dependencies.
        scheduled[0]();
        for (let attempt = 0; attempt < 5 && sentMessages.length < 2; attempt++) {
            await new Promise((resolve) => originalSetImmediate(resolve));
        }

        assert.deepEqual(prismaMock.mappingQueries.at(-1), [101, 202]);
        assert.equal(sentMessages.length, 2);
        const email101 = sentMessages.find((message) => message.to === "employee-101@example.test");
        const email202 = sentMessages.find((message) => message.to === "employee-202@example.test");
        assert.ok(email101);
        assert.ok(email202);
        for (const message of [email101, email202]) {
            assert.match(message.html, /50\.00%/);
            assert.match(message.text, /Employee adherence: 50\.00%/);
            assert.match(message.html, /1 days at 100% of 2 eligible working days/);
            assert.match(message.text, /100% days: 1 of 2 eligible working days/);
        }
        assert.match(email101.html, /01-11-2026[\s\S]*?100\.00%/);
        assert.match(email101.text, /01-11-2026 \| P \| 100\.00%/);
        assert.match(email101.html, /02-11-2026[\s\S]*?N\/A/);
        assert.match(email101.text, /02-11-2026 \| P System off \| N\/A/);
        assert.match(email202.html, /01-11-2026[\s\S]*?N\/A/);
        assert.match(email202.text, /01-11-2026 \| P \| N\/A/);
        assert.match(email202.html, /02-11-2026[\s\S]*?100\.00%/);
        assert.match(email202.text, /02-11-2026 \| P \| 100\.00%/);
    } finally {
        globalThis.setImmediate = originalSetImmediate;
        transporter.sendMail = originalSendMail;
    }
});

test("empty, no-eligible, and invalid-date workbooks are handled without unintended writes", async () => {
    resetDatabaseCalls();
    const emptyWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
        emptyWorkbook,
        XLSX.utils.aoa_to_sheet([HEADERS]),
        "EmployeeLocation",
    );
    const emptyBuffer = XLSX.write(emptyWorkbook, { type: "buffer", bookType: "xlsx" });
    await assert.rejects(importMassistSheet(emptyBuffer), /Excel sheet contains no data/);
    assert.equal(txState.transactionCalls, 0);

    const noEligible = await importMassistSheet(excelBuffer([
        {
            Date: "not-a-date",
            "Emp Code": "invalid",
            "Attendance Status": "A",
        },
    ]));
    assert.deepEqual(noEligible, { inserted: 0, updated: 0, totalRows: 0, reports: [] });
    assert.equal(txState.upsertCalls.length, 0);

    resetDatabaseCalls();
    await assert.rejects(
        importMassistSheet(excelBuffer([{
            Date: "not-a-date",
            "Emp Code": 101,
            "Attendance Status": "P",
        }])),
        /Excel row 2: Invalid date: not-a-date/,
    );
    assert.equal(txState.transactionCalls, 0);
    assert.equal(txState.upsertCalls.length, 0);
});
