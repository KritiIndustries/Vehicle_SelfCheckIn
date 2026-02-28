// middleware/ipRestriction.middleware.js

const allowedIps = [
    "122.180.10.25",
    "122.180.10.26",
];

const ipRestrictionMiddleware = (req, res, next) => {
    const ip =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress;

    if (!allowedIps.includes(ip)) {
        return res.status(403).json({
            success: false,
            message: "Access allowed only from plant network",
        });
    }

    next();
};

export default ipRestrictionMiddleware;