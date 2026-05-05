import { Request, Response } from "express";
import {
  fetchHotels,
} from "../services/hotelService";

import { fetchSupplierA } from "@suppliers/supplierA";
import { fetchSupplierB } from "@suppliers/supplierB";

import { validateHotelQuery } from "../utils/validator";

export async function getHotels(req: Request, res: Response) {
  try {
    const validation = validateHotelQuery(req.query);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const { city, min, max } = validation.data;

    if (!city) {
      return res.status(400).json({ error: "city is required" });
    }

    const data = await fetchHotels(city, min, max);
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// supplier endpoints
export async function getSupplierAHotels(req: Request, res: Response) {
  const city = req.query.city as string;
  const data = await fetchSupplierA(city);
  res.json(data);
}

export async function getSupplierBHotels(req: Request, res: Response) {
  const city = req.query.city as string;
  const data = await fetchSupplierB(city);
  res.json(data);
}

// health
export async function healthCheck(_req: Request, res: Response) {
  try {
    await Promise.all([
      fetchSupplierA("delhi"),
      fetchSupplierB("delhi"),
    ]);

    res.json({
      status: "UP",
      supplierA: "UP",
      supplierB: "UP",
    });
  } catch {
    res.json({ status: "DEGRADED" });
  }
}