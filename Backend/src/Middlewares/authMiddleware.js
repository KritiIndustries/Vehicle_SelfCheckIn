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
                message: "Session Timed Out. Please login again.",
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

export const exportAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="Driver Check-In Export"'
        );

        return res.status(401).send("Authentication required");
    }

    try {
        const base64Credentials = authHeader.split(" ")[1];

        const credentials = Buffer
            .from(base64Credentials, "base64")
            .toString("utf-8");

        const separatorIndex = credentials.indexOf(":");

        if (separatorIndex === -1) {
            return res.status(401).send("Invalid credentials");
        }

        const username = credentials.substring(0, separatorIndex);
        const password = credentials.substring(separatorIndex + 1);

        const validUsername = "logistic";
        const validPassword = "Logistic@123";

        if (
            !validUsername ||
            !validPassword ||
            username !== validUsername ||
            password !== validPassword
        ) {
            res.setHeader(
                "WWW-Authenticate",
                'Basic realm="Driver Check-In Export"'
            );

            return res.status(401).send("Invalid username or password");
        }

        next();

    } catch (error) {
        return res.status(401).send("Invalid authentication");
    }
};


export default authMiddleware;