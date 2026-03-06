import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./env";
import { authMiddleware } from "./auth/middleware";
import { router } from "./routes";

const app = express();
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(authMiddleware);
app.use(router);

app.listen(env.PORT, () => console.log(`[api] http://localhost:${env.PORT}`));
