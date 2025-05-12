import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    premium: boolean;
    Cars: Array<any>;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        premium: true,
        Car: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "Access denied" });
      return;
    }

    req.user = {
      ...user,
      id: Number(user.id), // Convert id to number
      Cars: user.Car,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
