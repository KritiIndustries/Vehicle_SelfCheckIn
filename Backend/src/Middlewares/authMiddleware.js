// middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import prisma from "../Config/index.js"; // adjust path to your prisma instance

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Token missing.",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET not defined in .env");
            return res.status(500).json({
                success: false,
                message: "Server configuration error",
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        // Attach user to request
        const user = await prisma.guard_Master.findUnique({
            where: { Guard_Id: decoded.id },
        });

        if (!user || !user.Active) {
            return res.status(401).json({
                success: false,
                message: "User not found or inactive",
            });
        }

        req.user = {
            id: user.Guard_Id,
            name: user.Name,
            mobile: user.Mobile,
            role: "GUARD",
        };

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};

export default authMiddleware;