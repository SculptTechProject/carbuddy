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
      engine?: string | null;
      power?: number | null;
      kilometers?: number | null;
      registration?: string | null;
      purchaseDate?: Date | null;
      fuelType?: string | null;
      color?: string | null;
      createdAt: Date;
      ownerId: string;
      // jeśli masz również Repair i Expense w relacji, możesz je tu dodać:
      Repair?: Array<{
        id: string;
        date: Date;
        type: string;
        description?: string | null;
        cost: number;
        carId: string;
      }>;
      Expense?: Array<{
        id: string;
        date: Date;
        category: string;
        amount: number;
        description?: string | null;
        carId: string;
      }>;
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
            engine: true,
            power: true,
            kilometers: true,
            registration: true,
            purchaseDate: true,
            fuelType: true,
            color: true,
            createdAt: true,
            ownerId: true,
            // jeśli chcesz od razu Repair/Expense:
            Repair: {
              select: {
                id: true,
                date: true,
                type: true,
                description: true,
                cost: true,
                carId: true,
              },
            },
            Expense: {
              select: {
                id: true,
                date: true,
                category: true,
                amount: true,
                description: true,
                carId: true,
              },
            },
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
