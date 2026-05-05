import { Router } from "express";
import {
  getHotels,
  getSupplierAHotels,
  getSupplierBHotels,
  healthCheck,
} from "../controllers/hotelController";

const router = Router();

router.get("/hotels", getHotels);

router.get("/supplierA/hotels", getSupplierAHotels);
router.get("/supplierB/hotels", getSupplierBHotels);

router.get("/health", healthCheck);

export default router;