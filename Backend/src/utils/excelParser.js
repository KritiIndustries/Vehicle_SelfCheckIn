import XLSX from "xlsx";

const REQUIRED_COLUMNS = [
    "Date",
    "Emp Code",
    "NoofVisitsPlanned",
    "ActualVisits",
    "No Of Field Activity Planned",
    "No Of Field Activity Done",
];

export function parseMassistExcel(buffer) {
    const workbook = XLSX.read(buffer, {
        type: "buffer",
        cellDates: true,
    });

    const sheetName = workbook.SheetNames.includes("EmployeeLocation")
        ? "EmployeeLocation"
        : workbook.SheetNames[0];

    if (!sheetName) {
        throw new Error("Excel workbook contains no worksheets");
    }

    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: null,
        raw: true,
    });

    if (!rows.length) {
        throw new Error("Excel sheet contains no data");
    }

    const actualColumns = Object.keys(rows[0]);

    const missingColumns = REQUIRED_COLUMNS.filter(
        (column) => !actualColumns.includes(column)
    );

    if (missingColumns.length) {
        throw new Error(
            `Missing required columns: ${missingColumns.join(", ")}`
        );
    }

    return rows;
}