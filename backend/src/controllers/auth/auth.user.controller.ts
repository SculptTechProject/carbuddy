import { Request, Response, NextFunction, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../../middleware/user.authenticate";
import { prisma } from "../../lib/prisma";
import { generateToken } from "../../middleware/generateToken.user.utils";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/*
 * POST /api/v1/user/login
 * Login the user and return a JWT token
 */
export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const { token, expiresAt } = generateToken(user.id);

    await prisma.userToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
};

/*
 * POST /api/v1/user/logout
 * Logout the user by deleting the token from the database
 */
export const userLogout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, JWT_SECRET) as any;
    await prisma.userToken.deleteMany({
      where: { userId: decodedToken.userId },
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

/*
 * POST /api/v1/user/register
 * Register a new user
 */
export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password, firstName, lastName, phoneNumber } = req.body;
  if (!email || !password || !firstName || !lastName || !phoneNumber) {
    res.status(400).json({
      error: "You need to pass all requirements!",
    });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (existingUser) {
      res.status(400).json({ error: "User already exists!" });
      return;
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: { email, password: passwordHash, firstName, lastName, phoneNumber },
    });
    res.status(201).json({ message: "User created", user: newUser });
    return;
  } catch (error) {
    console.error(error);
    next(error);
  }
};
