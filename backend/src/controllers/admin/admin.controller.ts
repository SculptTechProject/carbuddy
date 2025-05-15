import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const getUsers = async (_: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      banned: true,
      createdAt: true,
    },
  });
  res.json(users);
};

export const banUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Nieprawidłowe ID użytkownika" });
    return;
  }

  await prisma.user.update({
    where: { id: userId.toString() },
    data: { banned: true },
  });

  res.json({ message: `Użytkownik ${userId} został zbanowany.` });
};
