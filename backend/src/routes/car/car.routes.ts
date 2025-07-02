import { Router } from "express";
import {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
  getCarRepairs,
  getCarExpenses,
  getCarSummary,
  postCarExpenses,
  postCarRepairs,
  getRepairById,
  getPlannedRepairs,
  patchPlannedRepair,
  deletePlannedRepair,
  patchCarExpense,
  deleteCarExpense,
  patchRepairById,
  deleteCarRepair,
  getFluidPlan,
  upsertFluidPlan,
  confirmCheck,
  deleteFluidPlan,
} from "../../controllers/car/car.controller";
import { authenticate } from "../../middleware/user.authenticate";

const router = Router();

// CRUD samochodów
router.post("/cars", authenticate, createCar);
router.get("/cars", authenticate, getCars);
router.get("/cars/:carId", authenticate, getCarById);
router.put("/cars/:carId", authenticate, updateCar);
router.delete("/cars/:carId", authenticate, deleteCar);

// Naprawy
router.get("/cars/:carId/repairs", authenticate, getCarRepairs);
router.post("/cars/:carId/repairs", authenticate, postCarRepairs);
router.get("/repairs/:repairId", authenticate, getRepairById);
router.patch("/cars/:carId/repairs/:repairId", authenticate, patchRepairById);
router.delete("/cars/:carId/repairs/:repairId", authenticate, deleteCarRepair);

// Wydatki
router.get("/cars/:carId/expenses", authenticate, getCarExpenses);
router.post("/cars/:carId/expenses", authenticate, postCarExpenses);

// Planowane wydatki
router.get("/cars/:carId/planned-repairs", authenticate, getPlannedRepairs);
router.patch(
  "/cars/:carId/planned-repairs/:id",
  authenticate,
  patchPlannedRepair
);
router.delete(
  "/cars/:carId/planned-repairs/:id",
  authenticate,
  deletePlannedRepair
);

// Edycja wydatków
router.get("/cars/:carId/expenses", authenticate, getCarExpenses);
router.post("/cars/:carId/expenses", authenticate, postCarExpenses);
router.patch("/cars/:carId/expenses/:expenseId", authenticate, patchCarExpense);
router.delete(
  "/cars/:carId/expenses/:expenseId",
  authenticate,
  deleteCarExpense
);

// Płyny kontrolne
router.get("/cars/:carId/fluid-check", authenticate, getFluidPlan);
router.post("/cars/:carId/fluid-check", authenticate, upsertFluidPlan);
router.patch("/cars/:carId/fluid-check", authenticate, confirmCheck);
router.delete("/cars/:carId/fluid-check", authenticate, deleteFluidPlan);

// Podsumowanie dashboardowe
router.get("/cars/:carId/summary", authenticate, getCarSummary);

export default router;
