import { Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middleware/user.authenticate";

// 1. Utworzenie nowego auta
export const createCar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = req.user!.id; // masz dzięki authenticate
    const {
      vin,
      make,
      model,
      year,
      engine,
      power,
      kilometers,
      registration,
      purchaseDate,
      fuelType,
      color,
    } = req.body;

    const car = await prisma.car.create({
      data: {
        vin,
        make,
        model,
        year: Number(year),
        engine,
        power: power ? Number(power) : undefined,
        kilometers: kilometers ? Number(kilometers) : undefined,
        registration,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        fuelType,
        color,
        owner: { connect: { id: ownerId } },
      },
    });

    res.status(201).json({ car });
  } catch (err) {
    next(err);
  }
};

// 2. Lista wszystkich aut użytkownika
export const getCars = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = req.query.ownerId as string;
    const cars = await prisma.car.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
    res.json(cars);
  } catch (err) {
    next(err);
  }
};

// 3. Szczegóły jednego auta
export const getCarById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const carId = req.params.carId;
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      res.status(404).json({ error: "Car not found" });
      return;
    }
    res.json(car);
  } catch (err) {
    next(err);
  }
};

// 4. Aktualizacja auta
export const updateCar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const carId = req.params.carId;
    const data = req.body;
    const car = await prisma.car.update({
      where: { id: carId },
      data,
    });
    res.json(car);
  } catch (err) {
    next(err);
  }
};

// 5. Usunięcie auta
export const deleteCar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const carId = req.params.carId;
    await prisma.car.delete({ where: { id: carId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// 6. Lista napraw dla auta
export const getCarRepairs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const carId = req.params.carId;
    const repairs = await prisma.repair.findMany({
      where: { carId },
      orderBy: { date: "desc" },
    });
    res.json(repairs);
  } catch (err) {
    next(err);
  }
};

// 7. Lista wydatków dla auta
export const getCarExpenses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const carId = req.params.carId;
    const expenses = await prisma.expense.findMany({
      where: { carId },
      orderBy: { date: "desc" },
    });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
};

// 8. Podsumowanie dashboardu dla auta
export const getCarSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const carId = req.params.carId;

    // 8.1 Suma wydatków
    const { _sum } = await prisma.expense.aggregate({
      where: { carId },
      _sum: { amount: true },
    });

    // 8.2 Liczba napraw
    const repairsCount = await prisma.repair.count({ where: { carId } });

    // 8.3 Ostatnia naprawa / data
    const lastRepair = await prisma.repair.findFirst({
      where: { carId },
      orderBy: { date: "desc" },
    });

    res.json({
      totalSpent: _sum.amount ?? 0,
      repairsCount,
      lastRepairDate: lastRepair?.date || null,
    });
  } catch (err) {
    next(err);
  }
};
