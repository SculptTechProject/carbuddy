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

// Podsumowanie dashboardowe
router.get("/cars/:carId/summary", authenticate, getCarSummary);

export default router;
