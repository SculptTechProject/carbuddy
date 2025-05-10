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

const router = Router();

// CRUD samochodów
router.post("/cars", createCar);
router.get("/cars", getCars);
router.get("/cars/:carId", getCarById);
router.put("/cars/:carId", updateCar);
router.delete("/cars/:carId", deleteCar);

// Naprawy i wydatki
router.get("/cars/:carId/repairs", getCarRepairs);
router.get("/cars/:carId/expenses", getCarExpenses);

// Podsumowanie dashboardowe
router.get("/cars/:carId/summary", getCarSummary);

export default router;
