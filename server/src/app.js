import express from "express";
import cors from "cors";

import router from "./routes/index.routes.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://aqua-track-tan.vercel.app",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an Origin header
            // such as Postman or server-to-server requests.
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true
    })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;