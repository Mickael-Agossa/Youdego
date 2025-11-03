import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/user.routes.js";
import { loggerMiddleware } from "./middlewares/logger.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(loggerMiddleware);
app.use(cors({ origin: process.env.APP_URL, credentials: true }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

app.use("/api/users", userRoutes);

export default app;
