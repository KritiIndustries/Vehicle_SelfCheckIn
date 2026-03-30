import express from "express";
import swaggerUi from "swagger-ui-express";
import path from "path";
import YAML from "yamljs";
import { fileURLToPath } from "url";
import guardRoutes from "./Routes/guard.routes.js";
import adminRoutes from "./Routes/admin.routes.js";
import driverRoutes from "./Routes/driver.routes.js";
import authRoutes from "./Routes/auth.routes.js";
import { weighbridgeUpdate } from "./Controllers/weighbridge.controller.js";
import cors from "cors";
import { basicAuth } from "./Middlewares/basicAuth.js";

const app = express();

app.use(cors({
    origin: [
        process.env.CORS_ORIGIN,
        "https://kvrs.kritiindia.com",
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:5000",          // ✅ ADD THIS
        "https://editor.swagger.io"
    ],
    // credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = YAML.load(
    path.join(__dirname, "../docs/openapi.yaml")
);

// ✅ preflight

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("trust proxy", true);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/uploads", express.static("uploads"));
app.use("/api/guard", guardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/weighbridge', basicAuth, weighbridgeUpdate);

// Importing Routes

export { app };