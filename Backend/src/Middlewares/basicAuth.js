// middleware/basicAuth.js

export const basicAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        return res.status(401).json({
            success: false,
            message: "Authorization header missing"
        });
    }

    // Decode Base64
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");

    const [username, password] = credentials.split(":");

    // 🔐 Validate credentials
    if (username !== "prdadmin" || password !== "kriti@555") {
        return res.status(401).json({
            success: false,
            message: "Invalid username or password"
        });
    }

    next();
};