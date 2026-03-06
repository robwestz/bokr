import express from "express";
import next from "next";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { logger } from "./services/api/dist/logger.js";
import { securityEnv } from "./services/api/dist/env.js";
import { authMiddleware } from "./services/api/dist/auth/middleware.js";
import { router as apiRouter } from "./services/api/dist/routes.js";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 3000);

const nextApp = next({ dev, dir: "apps/web" });
const handle = nextApp.getRequestHandler();

await nextApp.prepare();

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Security + logs
app.use(helmet());
app.use(pinoHttp({ logger }));

// Body + cookies for API endpoints
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Rate limiting (coarse). Same settings as API.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: securityEnv.RATE_LIMIT_AUTH_PER_15M, standardHeaders: "draft-7" });
const bookLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: securityEnv.RATE_LIMIT_BOOK_PER_15M, standardHeaders: "draft-7" });

app.use("/auth", authLimiter);
app.use("/restaurants/:slug/reservations", bookLimiter);

// Auth middleware populates req.user/roles for admin routes
app.use(authMiddleware);

// API routes first (paths like /auth/*, /restaurants/*, /admin/*)
app.use(apiRouter);

// Next handles everything else
app.all("*", (req, res) => handle(req, res));

app.listen(port, () => logger.info({ event: "web_listen", port }, "Web+API server listening"));
