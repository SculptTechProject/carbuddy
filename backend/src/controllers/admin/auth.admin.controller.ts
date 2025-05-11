import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    res.status(401).json({ error: "Nieprawidłowe dane logowania" });
    return;
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    res.status(401).json({ error: "Nieprawidłowe dane logowania" });
    return;
  }

  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_ADMIN_SECRET!, {
    expiresIn: "7d",
  });

  res.json({ token });
};
