import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

/* 
  ^^^^^^^^^^^ Routes imports ^^^^^^^^^^^
*/
import authAdmin from "./routes/admin/auth.admin.routes";
import authUser from "./routes/auth/auth.user.routes";
/* 
  ^^^^^^^^^^^ Routes imports ^^^^^^^^^^^
*/

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("CarBuddy API is working!");
});

/*
 ^ USER 
 & START ROUTES
*/
// Auth user
app.use("/api/v1", authUser);
/* 
 & START ROUTES
*/

/*
 ! ADMIN
 & START ROUTES
*/
// Auth admin
app.use("/api/v1", authAdmin);
/* 
 & START ROUTES
*/

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
