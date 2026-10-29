import {
  generateVerticalHeadReports,
  resolveReportingPeriod,
  sendVerticalHeadReports,
} from "../services/verticalHeadReportService.js";

export async function triggerVerticalHeadReports(req, res) {
  try {
    const payload = req.body || {};
    const period = await resolveReportingPeriod(
      payload.reportingPeriod || payload.period
    );
    const reportingPeriod = period.label;
    const mappings = Array.isArray(payload.mappings) ? payload.mappings : undefined;
    const reports = Array.isArray(payload.reports) ? payload.reports : undefined;

    const groups = await generateVerticalHeadReports({
      mappings,
      reports,
      reportingPeriod,
    });
    console.log("Groups generated for Vertical Head and RSM reports:", groups);

    const emailResult = await sendVerticalHeadReports(groups);

    return res.status(200).json({
      success: true,
      message: "Vertical Head and RSM reports processed.",
      reportingPeriod,
      groups: groups.length,
      attempted: emailResult.attempted,
      sent: emailResult.sent,
      skipped: emailResult.skipped,
      failed: emailResult.failed,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to process Vertical Head and RSM reports.",
    });
  }
}
