import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

/* 
  ^^^^^^^^^^^ Routes imports ^^^^^^^^^^^
*/
import authAdmin from "./routes/admin/auth.admin.routes";
import authUser from "./routes/auth/auth.user.routes";
import getUserData from "./routes/user/user.routes";
import carRoutes from "./routes/car/car.routes";
import pushRoutes from "./routes/push/push.routes";
/* 
  ^^^^^^^^^^^ Routes imports ^^^^^^^^^^^
*/

dotenv.config();

// Cron jobs
import "./cron/fluid.reminder";

const allowed = (process.env.CLIENT_URL ?? "http://localhost:3000")
  .split(",")
  .map((url) => url.trim());

const app = express();
app.use(
  cors({
    origin: allowed,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("CarBuddy API is working!");
});

/*
 ^ USER 
 ! PUSH NOTIFICATIONS
 */
app.use("/api/v1/push", pushRoutes);
/*
 & START ROUTES
*/
// Auth user
app.use("/api/v1", authUser);
app.use("/api/v1", getUserData);
app.use("/api/v1", carRoutes);
/* 
 & END ROUTES
*/

/*
 ! ADMIN
 & START ROUTES
*/
// Auth admin
app.use("/api/v1", authAdmin);
/* 
 & END ROUTES
*/

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
