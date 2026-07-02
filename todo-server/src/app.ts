import "dotenv/config";
import "express-async-errors";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import authRouter from "./routes/auth.js";
import todosRouter from "./routes/todos.js";

const app = express();

app.use(logger("dev"));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/todos", todosRouter);

app.use(
  (
    err: Error & { status?: number },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error(err);
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal server error" });
  },
);

const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);

export default app;
