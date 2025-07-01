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
/* 
  ^^^^^^^^^^^ Routes imports ^^^^^^^^^^^
*/

dotenv.config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
