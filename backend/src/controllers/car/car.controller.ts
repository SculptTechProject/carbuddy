import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middleware/user.authenticate";

const DAY_MS = 86_400_000;

// 1. Utworzenie nowego auta
export const createCar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = req.user!.id;

    if (!req.user!.premium) {
      const cnt = await prisma.car.count({ where: { ownerId } });
      if (cnt >= 3) {
        res.status(409).json({ code: "CAR_LIMIT", message: "Limit 3 aut" });
        return;
      }
    }

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

export const postCarExpenses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const carId = req.params.carId;
    const userId = req.user!.id;

    // Verify car exists and belongs to user
    const car = await prisma.car.findUnique({
      where: {
        id: carId,
        ownerId: userId,
      },
    });
    if (!car) {
      res.status(404).json({ message: "Samochód nie znaleziony." });
      return;
    }

    const { date, category, amount, description } = req.body;

    // Create expense using Prisma
    const expense = await prisma.expense.create({
      data: {
        carId,
        date: new Date(date),
        category,
        amount: Number(amount),
        description,
      },
    });

    res.status(201).json({ expense });
    return;
  } catch (err) {
    next(err);
  }
};

export const postCarRepairs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const carId = req.params.carId;
    const userId = req.user!.id;

    // 1. Upewnij się, że auto należy do zalogowanego usera
    const car = await prisma.car.findUnique({
      where: { id: carId, ownerId: userId },
    });
    if (!car) {
      res.status(404).json({ message: "Samochód nie znaleziony." });
      return;
    }

    // 2. Wyciągnij dane z body
    const { date, type, description, cost, workshop, notes, kilometers } =
      req.body;
    if (
      !date ||
      !type ||
      cost == null ||
      !workshop ||
      !notes ||
      kilometers == null
    ) {
      res.status(400).json({
        message:
          "Brakuje wymaganych pól: date, type, cost, workshop, note, kilometers.",
      });
      return;
    }

    // 3. Stwórz wpis w tabeli repair
    const repair = await prisma.repair.create({
      data: {
        carId,
        date: new Date(date),
        type,
        description,
        cost: Number(cost),
        workshop,
        notes,
        kilometers: Number(kilometers),
      },
    });

    // 4. Zwróć 201 + stworzony obiekt
    res.status(201).json({ repair });
  } catch (err) {
    next(err);
  }
};

export const getRepairById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const repairId = req.params.repairId;

    const repair = await prisma.repair.findUnique({
      where: { id: repairId },
      include: {
        car: {
          select: {
            make: true,
            model: true,
            registration: true,
          },
        },
      },
    });

    if (!repair) {
      res.status(404).json({ message: "Naprawa nie została znaleziona." });
      return;
    }

    // Można dodać sprawdzenie, czy repair.car.ownerId === req.user!.id (dla bezpieczeństwa)
    res.json(repair);
  } catch (err) {
    next(err);
  }
};

export const getPlannedRepairs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const carId = req.params.carId;
    const planned = await prisma.plannedRepair.findMany({
      where: { carId },
      orderBy: { date: "asc" },
    });
    res.json(planned);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/cars/:carId/planned-repairs/:repairId
export const patchPlannedRepair = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { carId, repairId } = req.params;
    const userId = req.user!.id;
    const { date, type, description } = req.body;

    // 1. Pobierz naprawę razem z autem (żeby sprawdzić ownerId)
    const existing = await prisma.plannedRepair.findUnique({
      where: { id: repairId },
      include: { car: { select: { id: true, ownerId: true } } },
    });
    if (
      !existing ||
      existing.carId !== carId ||
      existing.car.ownerId !== userId
    ) {
      res.status(404).json({ message: "Nie znaleziono zaplanowanej naprawy." });
      return;
    }

    // 2. Zbuduj obiekt update tylko z przekazanych pól
    const data: any = {};
    if (date) data.date = new Date(date);
    if (type !== undefined) data.type = type;
    if (description !== undefined) data.description = description;

    // 3. Wykonaj update
    const updated = await prisma.plannedRepair.update({
      where: { id: repairId },
      data,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/cars/:carId/planned-repairs/:repairId
export const deletePlannedRepair = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { carId, repairId } = req.params;
    const userId = req.user!.id;

    // Sprawdzenie, czy naprawa i auto istnieją i należą do usera
    const existing = await prisma.plannedRepair.findUnique({
      where: { id: repairId },
      include: { car: { select: { id: true, ownerId: true } } },
    });
    if (
      !existing ||
      existing.carId !== carId ||
      existing.car.ownerId !== userId
    ) {
      res.status(404).json({ message: "Nie znaleziono zaplanowanej naprawy." });
      return;
    }

    // Usuń wpis
    await prisma.plannedRepair.delete({ where: { id: repairId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const deleteCarExpense = async (
  req: Request<{ carId: string; expenseId: string }>,
  res: Response,
  next: NextFunction
) => {
  const { carId, expenseId } = req.params;
  try {
    await prisma.expense.delete({
      where: { id: expenseId },
    });
    res.status(204).send();
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Nie udało się usunąć wydatku." });
    return;
  }
};

export const patchCarExpense = async (
  req: Request<{ carId: string; expenseId: string }>,
  res: Response,
  next: NextFunction
) => {
  const { expenseId } = req.params;
  const { date, category, amount, description } = req.body;

  try {
    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        date: new Date(date),
        category,
        amount,
        description,
      },
    });
    res.json(updated);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Nie udało się zaktualizować wydatku." });
    return;
  }
};

export const patchRepairById = async (
  req: Request<{ carId: string; repairId: string }>,
  res: Response,
  next: NextFunction
) => {
  const { repairId } = req.params;
  const { date, type, description, cost, workshop, notes, kilometers } =
    req.body;
  try {
    const updated = await prisma.repair.update({
      where: { id: repairId },
      data: {
        date: new Date(date),
        type,
        description,
        cost,
        workshop,
        notes,
        kilometers: Number(kilometers),
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCarRepair = async (
  req: Request<{ carId: string; repairId: string }>,
  res: Response,
  next: NextFunction
) => {
  const { repairId } = req.params;
  try {
    await prisma.repair.delete({ where: { id: repairId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------------------------- */
/* GET /cars/:carId/fluid-check – pobierz plan                                */
/* -------------------------------------------------------------------------- */
export const getFluidPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { carId } = req.params as { carId: string };

  const plan = await prisma.fluidCheckPlan.findUnique({ where: { carId } });
  if (!plan) {
    res.sendStatus(404);
    return;
  }
  res.json(plan);
};

/* -------------------------------------------------------------------------- */
/* POST /cars/:carId/fluid-check – utwórz lub zaktualizuj plan                */
/* -------------------------------------------------------------------------- */
export const upsertFluidPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { carId } = req.params as { carId: string };
  const { intervalDay = 14, enabled = true } = req.body as {
    intervalDay?: number;
    enabled?: boolean;
  };

  const now = new Date();
  const next = new Date(now.getTime() + intervalDay * DAY_MS);

  const plan = await prisma.fluidCheckPlan.upsert({
    where: { carId }, // klucz unikalny
    update: { intervalDay, enabled, nextCheck: next },
    create: { carId, intervalDay, enabled, lastCheck: now, nextCheck: next },
  });

  res.json(plan);
};

/* -------------------------------------------------------------------------- */
/* PATCH /cars/:carId/fluid-check – użytkownik kliknął „Sprawdzono”           */
/* -------------------------------------------------------------------------- */
export const confirmCheck = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { carId } = req.params as { carId: string };

  const plan = await prisma.fluidCheckPlan.findUnique({ where: { carId } });
  if (!plan) {
    res.status(404).json({ message: "Plan not found" });
    return;
  }

  const now = new Date();
  const next = new Date(now.getTime() + plan.intervalDay * DAY_MS);

  const updated = await prisma.fluidCheckPlan.update({
    where: { carId },
    data: { lastCheck: now, nextCheck: next },
  });

  res.json(updated);
};

/* -------------------------------------------------------------------------- */
/* DELETE /cars/:carId/fluid-check – usuń plan                                */
/* -------------------------------------------------------------------------- */
export const deleteFluidPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { carId } = req.params as { carId: string };

  await prisma.fluidCheckPlan.delete({ where: { carId } });
  res.sendStatus(204);
};
