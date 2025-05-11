import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export const protectAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Brak tokena" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET!) as {
      adminId: number;
    };
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
    });

    if (!admin) {
      res.status(403).json({ error: "Brak dostępu" });
      return;
    }

    (req as any).admin = admin;
    next();
  } catch {
    res.status(401).json({ error: "Nieprawidłowy token" });
    return;
  }
};
