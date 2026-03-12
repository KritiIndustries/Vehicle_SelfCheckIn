import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const weighbridgeUpdate = asyncHandler(async (req, res) => {
    const {
        ticketNo,
        vehicleNo,
        tagNo,
        material,
        transporter,
        gatePassNo,
        tolerances,
        grossWeight,
        grossDate,
        grossTime,
        tareWeight,
        tareDate,
        tareTime,
        shift
    } = req.body;

    let record = await prisma.weighbridge.findUnique({
        where: { GatePassNo: gatePassNo }
    });
    if (!record && !tagNo) {
        throw new ApiError(400, "TagNo required for first weighbridge entry")
    }
    /* STEP 1 — CREATE ENTRY */

    if (!record) {

        record = await prisma.weighbridge.create({
            data: {
                TicketNo: ticketNo,
                VehicleNo: vehicleNo,
                TagNo: tagNo,
                Material: material,
                Transporter: transporter,
                GatePassNo: gatePassNo,
                Tolerances: tolerances
            }
        });

        return res.json(
            new ApiResponse(200, record, "Vehicle entry created")
        );
    }

    /* STEP 2 — UPDATE GROSS WEIGHT */

    if (grossWeight && !record.GrossWeight) {

        const updated = await prisma.weighbridge.update({
            where: { TicketNo: ticketNo },
            data: {
                GrossWeight: grossWeight,
                GrossDate: grossDate ? new Date(grossDate) : null,
                GrossTime: grossTime
            }
        });

        return res.json(
            new ApiResponse(200, updated, "Gross weight updated")
        );
    }

    /* STEP 3 — UPDATE TARE WEIGHT */

    if (tareWeight && !record.TareWeight) {

        const netWeight = record.GrossWeight - tareWeight;

        const duration =
            record.GrossDate && tareDate
                ? Math.floor(
                    (new Date(tareDate) - new Date(record.GrossDate)) /
                    60000
                )
                : null;

        const updated = await prisma.weighbridge.update({
            where: { TicketNo: ticketNo },
            data: {
                TareWeight: tareWeight,
                TareDate: tareDate ? new Date(tareDate) : null,
                TareTime: tareTime,
                NetWeight: netWeight,
                Duration: duration,
                Shift: shift
            }
        });

        return res.json(
            new ApiResponse(200, updated, "Final weight updated")
        );
    }
    return res.json(
        new ApiResponse(200, record, "No update required")
    );
});