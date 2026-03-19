import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// export const weighbridgeUpdate = asyncHandler(async (req, res) => {

//     const {
//         ticketNo,
//         vehicleNo,
//         tagNo,
//         transporter,
//         gatePassNo,
//         tolerances,
//         grossWeight,
//         grossDate,
//         grossTime,
//         tareWeight,
//         tareDate,
//         tareTime,
//         shift
//     } = req.body;

//     let record = await prisma.weighbridge.findUnique({
//         where: { GatePassNo: gatePassNo }
//     });
//     console.log("Record", record);
//     console.log("tage", tagNo);

//     if (record && !tagNo) {
//         throw new ApiError(400, "TagNo required for first weighbridge entry")
//     }
//     /* STEP 1 — CREATE ENTRY */
//     const checkin = await prisma.driver_Checkin.findUnique({
//         where: { Zgp: gatePassNo }
//     });

//     if (!checkin) {
//         throw new ApiError(400, "Invalid GatePassNo");
//     }

//     if (!record) {
//         record = await prisma.weighbridge.create({
//             data: {
//                 TicketNo: ticketNo,
//                 VehicleNo: vehicleNo,
//                 TagNo: tagNo,
//                 Transporter: transporter,
//                 GatePassNo: gatePassNo,
//             }
//         });

//         return res.json(
//             new ApiResponse(200, record, "Vehicle entry created")
//         );
//     }
//     /* STEP 2 — UPDATE GROSS WEIGHT */

//     if (grossWeight && !record.GrossWeight) {

//         const updated = await prisma.weighbridge.update({
//             where: { TicketNo: ticketNo },
//             data: {
//                 GrossWeight: grossWeight,
//                 GrossDate: grossDate ? new Date(grossDate) : null,
//                 GrossTime: grossTime
//             }
//         });
//         return res.json(
//             new ApiResponse(200, updated, "Gross weight updated")
//         );
//     }

//     /* STEP 3 — UPDATE TARE WEIGHT */

//     if (tareWeight && !record.TareWeight) {

//         const netWeight = record.GrossWeight - tareWeight;

//         const duration =
//             record.GrossDate && tareDate
//                 ? Math.floor(
//                     (new Date(tareDate) - new Date(record.GrossDate)) /
//                     60000
//                 )
//                 : null;

//         const updated = await prisma.weighbridge.update({
//             where: { TicketNo: ticketNo },
//             data: {
//                 TareWeight: tareWeight,
//                 TareDate: tareDate ? new Date(tareDate) : null,
//                 TareTime: tareTime,
//                 NetWeight: netWeight,
//                 Tolerances: tolerances,
//                 Duration: duration,
//                 Shift: shift
//             }
//         });

//         return res.json(
//             new ApiResponse(200, updated, "Final weight updated")
//         );
//     }
//     return res.json(
//         new ApiResponse(200, record, "No update required")
//     );
// });

export const weighbridgeUpdate = asyncHandler(async (req, res) => {
    const {
        ticketNo,
        vehicleNo,
        tagNo,
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

    if (!ticketNo || !gatePassNo) {
        throw new ApiError(400, "ticketNo and gatePassNo are required");
    }

    const cleanTicketNo = String(ticketNo).trim();
    const cleanGatePass = String(gatePassNo).trim();

    // 🔥 CHECK DRIVER_CHECKIN
    const checkin = await prisma.driver_Checkin.findUnique({
        where: { Zgp: cleanGatePass }
    });

    if (!checkin) {
        throw new ApiError(400, "Invalid GatePassNo");
    }

    // 🔥 FIND RECORD
    let record = await prisma.weighbridge.findUnique({
        where: { GatePassNo: cleanGatePass }
    });

    /* ============================================================
       STEP 1 — ENTRY
    ============================================================ */
    if (!record) {

        if (!vehicleNo || !tagNo || !transporter) {
            throw new ApiError(400, "vehicleNo, tagNo, transporter required");
        }

        record = await prisma.weighbridge.create({
            data: {
                TicketNo: cleanTicketNo,
                VehicleNo: vehicleNo,
                TagNo: tagNo,
                Transporter: transporter,
                GatePassNo: cleanGatePass
            }
        });

        return res.json(new ApiResponse(200, record, "Entry created"));
    }

    /* ============================================================
       STEP 2 — TARE FIRST
    ============================================================ */
    if (tareWeight && !record.TareWeight) {

        if (isNaN(tareWeight) || Number(tareWeight) <= 0) {
            throw new ApiError(400, "Invalid tareWeight");
        }

        const updated = await prisma.weighbridge.update({
            where: { TicketNo: cleanTicketNo },
            data: {
                TareWeight: Number(tareWeight),
                TareDate: tareDate ? new Date(tareDate) : new Date(),
                TareTime: tareTime || null,
                Shift: shift || null
            }
        });

        return res.json(
            new ApiResponse(200, updated, "Tare weight updated")
        );
    }

    /* ============================================================
       STEP 3 — GROSS FINAL
    ============================================================ */
    if (grossWeight && !record.GrossWeight) {

        if (!record.TareWeight) {
            throw new ApiError(400, "Tare weight must be entered first");
        }

        if (isNaN(grossWeight) || Number(grossWeight) <= 0) {
            throw new ApiError(400, "Invalid grossWeight");
        }

        const netWeight = Number(grossWeight) - Number(record.TareWeight);

        if (netWeight < 0) {
            throw new ApiError(400, "Gross weight cannot be less than tare weight");
        }

        const duration =
            record.TareDate && grossDate
                ? Math.floor(
                    (new Date(grossDate) - new Date(record.TareDate)) / 60000
                )
                : null;

        const updated = await prisma.weighbridge.update({
            where: { TicketNo: cleanTicketNo },
            data: {
                GrossWeight: Number(grossWeight),
                GrossDate: grossDate ? new Date(grossDate) : new Date(),
                GrossTime: grossTime || null,
                NetWeight: netWeight,
                Tolerances: tolerances ? Number(tolerances) : null,
                Duration: duration
            }
        });

        return res.json(
            new ApiResponse(200, updated, "Final weight updated")
        );
    }

    return res.status(400).json(
        new ApiResponse(400, record, "No valid operation")
    );
});



