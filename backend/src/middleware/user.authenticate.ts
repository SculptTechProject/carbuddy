import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    premium: boolean;
    cars: Array<{
      id: string;
      vin: string;
      make: string;
      model: string;
      year: number;
      kilometers: number | null;
      color: string | null;
      createdAt: Date;
      ownerId: string;
    }>;
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
    const { userId } = jwt.verify(token, JWT_SECRET) as { userId: string };

    // pobieramy usera razem z powiązanymi Car
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        premium: true,
        cars: {
          select: {
            id: true,
            vin: true,
            make: true,
            model: true,
            year: true,
            kilometers: true,
            color: true,
            createdAt: true,
            ownerId: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: "Access denied" });
      return;
    }

    if (!token) {
      res.status(401).json({ error: "LIPA JEST" });
    }

    // przypisujemy do req.user, zmieniając nazwę pola Car → cars
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      premium: user.premium,
      cars: user.cars,
    };

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
