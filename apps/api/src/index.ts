import express from "express";
import { getTemporalClient } from "./temporalClient";
import { saveHotels, getHotelsByPrice } from "../../../packages/redis/src/hotelRepo";
import { hotelWorkflow } from "../../../packages/workflows/src/hotelWorkflow";
import { fetchSupplierA } from "../../../packages/suppliers/src/supplierA";
import { fetchSupplierB } from "../../../packages/suppliers/src/supplierB";

const app = express();
const PORT = 3000;

app.get("/api/hotels", async (req, res) => {
  try {
    const city = req.query.city as string;
    const min = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const max = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

    if (!city) {
      return res.status(400).json({ error: "city is required" });
    }
   
    if (min !== undefined || max !== undefined) {
      const hotels = await getHotelsByPrice(city, min, max);
      return res.json(hotels);
    }

    const client = await getTemporalClient();

    const result = await client.workflow.execute(hotelWorkflow, {
      taskQueue: "hotel-task-queue",
      workflowId: `hotel-${city}-${Date.now()}`,
      args: [city],
    });

    // save to Redis
    await saveHotels(city, result);

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/supplierA/hotels", async (req, res) => {
  const city = req.query.city as string;
  const data = await fetchSupplierA(city);
  res.json(data);
});

app.get("/supplierB/hotels", async (req, res) => {
  const city = req.query.city as string;
  const data = await fetchSupplierB(city);
  res.json(data);
});

app.get("/health", async (_, res) => {
  try {
    await Promise.all([
      fetchSupplierA("delhi"),
      fetchSupplierB("delhi"),
    ]);

    res.json({ supplierA: "UP", supplierB: "UP" });
  } catch {
    res.json({ status: "DEGRADED" });
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});