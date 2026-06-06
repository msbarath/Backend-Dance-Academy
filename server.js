const express      = require("express");
const mongoose     = require("mongoose");
const cors         = require("cors");
const helmet       = require("helmet");
const cookieParser = require("cookie-parser");
const bcrypt       = require("bcryptjs");
const rateLimit    = require("express-rate-limit");
const { doubleCsrf } = require("csrf-csrf");

require("dotenv").config();

const userRoutes       = require("./Routes/UserRoutes");
const threadRoutes     = require("./Routes/ThreadRoutes");
const courseRoutes     = require("./Routes/CourseRoutes");
const studentRoutes    = require("./Routes/StudentRoutes");
const attendanceRoutes = require("./Routes/AttendanceRoutes");
const feeRoutes        = require("./Routes/FeeRoutes");
const eventRoutes      = require("./Routes/EventRoutes");
const contactRoutes    = require("./Routes/ContactRoutes");
const User             = require("./Models/UserModel");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(o => o.trim())
    : ["http://localhost:3000"];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS: origin '${origin}' not allowed`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
    exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));
app.options("{*any}", cors(corsOptions));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many auth attempts, please try again later." },
});

app.use("/api", globalLimiter);
app.use("/api/user/login",          authLimiter);
app.use("/api/user/signup",         authLimiter);
app.use("/api/user/reset-password", authLimiter);

const isProd = process.env.NODE_ENV === "production";

if (!process.env.CSRF_SECRET || !process.env.COOKIE_SECRET || !process.env.JWT_SECRET) {
    console.error("FATAL: Missing required environment variables (CSRF_SECRET, COOKIE_SECRET, JWT_SECRET)");
    process.exit(1);
}

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET,
    cookieName: isProd ? "__Host-psifi.x-csrf-token" : "psifi.x-csrf-token",
    cookieOptions: {
        sameSite: isProd ? "none" : "lax",
        secure:   isProd,
        signed:   true,
        httpOnly: true,
        path:     "/",
    },
});

app.get("/",              (req, res) => res.json({ message: "Dance Academy API is running" }));
app.get("/api/health",    (req, res) => res.json({ status: "ok" }));
app.get("/api/db-status", (req, res) => {
    const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
    const state  = mongoose.connection.readyState;
    res.json({ db: states[state] || "unknown", readyState: state });
});
app.get("/api/csrf-token", (req, res) => {
    const token = generateCsrfToken(req, res);
    res.json({ csrfToken: token });
});

app.use("/api/user",       doubleCsrfProtection, userRoutes);
app.use("/api/threads",    threadRoutes);
app.use("/api/courses",    courseRoutes);
app.use("/api/students",   studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees",       feeRoutes);
app.use("/api/events",     eventRoutes);
app.use("/api/contact",    contactRoutes);

app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).json({ message: "Invalid CSRF token. Please refresh and try again." });
    }
    if (err.message && err.message.startsWith("CORS:")) {
        return res.status(403).json({ message: err.message });
    }
    console.error("Unhandled error:", err.message || err);
    res.status(500).json({ message: "Internal server error" });
});

async function seedAdmin() {
    try {
        const exists = await User.findOne({ email: process.env.ADMIN_EMAIL || "admin@gmail.com" });
        if (!exists) {
            await User.create({
                firstname: "Admin",
                lastname:  "User",
                email:     process.env.ADMIN_EMAIL    || "admin@gmail.com",
                phone:     "9000000000",
                password:  await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 12),
                role:      "admin",
            });
        }
    } catch (err) {
        console.error("Seed admin error:", err.message);
    }
}

const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URL) {
    console.error("FATAL: MONGODB_URL environment variable is not set");
    process.exit(1);
}

mongoose.set("strictQuery", false);
mongoose
    .connect(process.env.MONGODB_URL, {
        maxPoolSize:             10,
        minPoolSize:              2,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS:          45000,
    })
    .then(async () => {
        await seedAdmin();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    });

async function gracefulShutdown(signal) {
    console.log(`${signal} received. Closing server...`);
    await mongoose.connection.close();
    process.exit(0);
}

process.on("SIGINT",  () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});
