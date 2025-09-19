import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";
import { envVars } from "./app/config/env";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ride-booking-frontend-gamma.vercel.app",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to my backend verse!",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
