import { importMassistSheet } from "../services/massistImportService.js";
import { sendEmployeeReports } from "../services/massistEmailService.js";

export async function uploadMassistReport(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an Excel file.",
            });
        }

        // Step 1–3: Parse, validate, upsert, and calculate reports.
        const importResult = await importMassistSheet(req.file.buffer);

        // Return the completed import immediately. Sending reports can be slow
        // (SMTP calls are sequential), so it must not hold the upload request open.
        res.status(200).json({
            success: true,
            message: "Massist sheet imported. Employee reports are being sent in the background.",
            import: {
                totalRows: importResult.totalRows,
                inserted: importResult.inserted,
                updated: importResult.updated,
            },
            summary: {
                employeesProcessed: importResult.reports.length,
                totalRecords: importResult.reports.reduce(
                    (sum, report) => sum + report.totalRecords,
                    0
                ),
                totalVisitsPlanned: importResult.reports.reduce(
                    (sum, report) => sum + report.visitsPlanned,
                    0
                ),
                totalActualVisits: importResult.reports.reduce(
                    (sum, report) => sum + report.actualVisits,
                    0
                ),
                totalMarketingPlanned: importResult.reports.reduce(
                    (sum, report) => sum + report.marketingPlanned,
                    0
                ),
                totalMarketingDone: importResult.reports.reduce(
                    (sum, report) => sum + report.marketingDone,
                    0
                ),
                totalEligibleWorkingDays: importResult.reports.reduce(
                    (sum, report) => sum + report.eligibleWorkingDays,
                    0
                ),
                totalFullMjpAdherenceDays: importResult.reports.reduce(
                    (sum, report) => sum + report.fullMjpAdherenceDays,
                    0
                ),
            },
            emails: { status: "processing" },
        });

        // setImmediate(() => {
        //     sendEmployeeReports(importResult.reports)
        //         .then((emailResult) => {
        //             console.info("Massist employee reports completed:", {
        //                 attempted: emailResult.attempted,
        //                 sent: emailResult.sent,
        //                 skipped: emailResult.skipped.length,
        //                 failed: emailResult.failed.length,
        //             });
        //         })
        //         .catch((error) => {
        //             console.error("Massist employee report sending failed:", error);
        //         });
        // });
    } catch (error) {
        console.error("Massist import failed:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to process Massist sheet.",
        });
    }
}


