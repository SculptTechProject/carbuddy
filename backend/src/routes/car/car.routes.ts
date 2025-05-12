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
router.get("/cars/:carId/expenses", authenticate, getCarExpenses);

// Podsumowanie dashboardowe
router.get("/cars/:carId/summary", authenticate, getCarSummary);

export default router;
