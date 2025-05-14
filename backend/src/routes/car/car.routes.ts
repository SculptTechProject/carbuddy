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
} from "../../controllers/car/car.controller";
import { authenticate } from "../../middleware/user.authenticate";

const router = Router();

// CRUD samochodów
router.post("/cars", authenticate, createCar);
router.get("/cars", authenticate, getCars);
router.get("/cars/:carId", authenticate, getCarById);
router.put("/cars/:carId", authenticate, updateCar);
router.delete("/cars/:carId", authenticate, deleteCar);

// Naprawy i wydatki
router.get("/cars/:carId/repairs", authenticate, getCarRepairs);
router.post("/cars/:carId/repairs", authenticate, postCarRepairs);
router.get("/repairs/:repairId", authenticate, getRepairById);

router.get("/cars/:carId/expenses", authenticate, getCarExpenses);
router.post("/cars/:carId/expenses", authenticate, postCarExpenses);

router.get("/cars/:carId/planned-repairs", authenticate, getPlannedRepairs);

// Podsumowanie dashboardowe
router.get("/cars/:carId/summary", authenticate, getCarSummary);

export default router;
