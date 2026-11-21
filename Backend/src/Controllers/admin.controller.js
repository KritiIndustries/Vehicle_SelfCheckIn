import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import XLSX from "xlsx";
import pool from "../db.js";

export const exportDriverCheckInExcel = asyncHandler(async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Validate required parameters
        if (!startDate || !endDate) {
            return res.status(400).send(`
    <h2 h2 > Driver Check - In Excel Export</h2 >
                <p>Please provide both start date and end date.</p>

                <form method="GET" action="/api/admin/export/excel">
                    <label>Start Date:</label>
                    <input type="date" name="startDate" required />
                    <br/><br/>

                    <label>End Date:</label>
                    <input type="date" name="endDate" required />
                    <br/><br/>

                    <button type="submit">Download Excel</button>
                </form>
`);
        }

        // Validate YYYY-MM-DD format and actual calendar dates
        const isValidDate = (value) => {
            if (
                typeof value !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(value)
            ) {
                return false;
            }

            const date = new Date(`${value}T00:00:00.000Z`);

            return (
                !Number.isNaN(date.getTime()) &&
                date.toISOString().slice(0, 10) === value
            );
        };

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return res.status(400).send(
                "Invalid date. Use YYYY-MM-DD format."
            );
        }

        if (startDate > endDate) {
            return res.status(400).send(
                "Start date cannot be later than end date."
            );
        }

        // IST date range converted to UTC timestamps
        const startTimestamp = new Date(
            `${startDate}T00:00:00+05:30`
        );

        const endTimestampExclusive = new Date(
            new Date(`${endDate}T00:00:00+05:30`).getTime()
            + 24 * 60 * 60 * 1000
        );

        // Fetch records from DRIVER_CHECKIN
        const [rows] = await pool.execute(
            `
SELECT *
    FROM DRIVER_CHECKIN
                WHERE Created_At >= ?
    AND Created_At < ?
        ORDER BY Id DESC
            `,
            [
                startTimestamp,
                endTimestampExclusive
            ]
        );

        // Convert MySQL date values into IST
        const formatISTDateTime = (value) => {
            if (!value) return "";

            const date = new Date(value);

            return date.toLocaleString("en-GB", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });
        };

        // Expiry dates: DD/MM/YYYY only
        const formatDateOnly = (value) => {
            if (!value) return "";

            const date = new Date(value);

            return date.toLocaleDateString("en-GB", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
        };

        const excelData = rows.map((item) => ({
            Do_No: item.Do_No,
            Vehicle_No: item.Vehicle_No,
            Driver_Name: item.Driver_Name,
            Mobile: item.Mobile,
            License_Number: item.License_Number,
            Licence_Expiry_Date: formatDateOnly(
                item.Licence_Expiry_Date
            ),

            Insurance_Number: item.Insurance_Number,

            Insurance_Expiry_Date: formatDateOnly(
                item.Insurance_Expiry_Date
            ),

            Chassis_Number: item.Chassis_Number,

            Rc_Expiry_Date: formatDateOnly(
                item.Rc_Expiry_Date
            ),

            Fitness_Expiry_Date: formatDateOnly(
                item.Fitness_Expiry_Date
            ),

            Status: item.Status,
            Zgp: item.Zgp,

            ReportIn_Time: formatISTDateTime(
                item.ReportIn_Time
            ),
            Created_At: formatISTDateTime(
                item.Created_At
            ),
        }));

        // Create Excel worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Driver CheckIn"
        );

        // Generate Excel buffer
        const buffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx"
        });

        const filename =
            `Driver_CheckIn_${startDate}_to_${endDate}.xlsx`;

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );

        res.type(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        return res.send(buffer);

    } catch (err) {
        console.error("Driver CheckIn Excel Export Error:", err);

        return res.status(500).json(
            new ApiError(500, "Driver Check-In Excel export failed")
        );
    }
});
