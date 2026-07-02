import "dotenv/config";
import "express-async-errors";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import authRouter from "./src/routes/auth.ts";
import todosRouter from "./src/routes/todos.ts";
import pkg from 'express';
// const app = pkg();
import express from "express";
const app = express();
app.use(logger("dev"));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/todos", todosRouter);
app.use((err, _req, res, _next) => {
    console.error(err);
    res
        .status(err.status ?? 500)
        .json({ message: err.message ?? "Internal server error" });
});
const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
export default app;
