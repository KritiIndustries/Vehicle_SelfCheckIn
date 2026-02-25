import express from "express";
import guardRoutes from "./Routes/guard.routes.js";
import adminRoutes from "./Routes/admin.routes.js";
import driverRoutes from "./Routes/driver.routes.js";
import authRoutes from "./Routes/auth.routes.js";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/api/guard", guardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/auth", authRoutes);

// Importing Routes

export { app };