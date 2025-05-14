import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/user.authenticate";
import { prisma } from "../../lib/prisma";

export const getUserData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cars: {
          include: {
            Expense: { orderBy: { date: "desc" } },
            Repair: { orderBy: { date: "desc" } },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const upcomingRepairs =
      user?.cars.flatMap((car) =>
        car.Repair.filter((r) => new Date(r.date) > new Date()).map((r) => ({
          ...r,
          carLabel: `${car.make} ${car.model}`,
        }))
      ) || [];

    // teraz user.cars[i].expenses to tablica wydatków
    res.status(200).json({
      user: {
        ...user,
        upcomingServices: upcomingRepairs,
      },
    });
  } catch (err) {
    next(err);
  }
};
