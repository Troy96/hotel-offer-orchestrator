import { getTemporalClient } from "../temporalClient";
import {
  saveHotels,
  getHotelsByPrice,
} from "@redis/hotelRepo";
import { redis } from "@redis/client";
import { hotelWorkflow } from "@workflows/hotelWorkflow";

export async function fetchHotels(
    city: string,
    min?: number,
    max?: number
) {
    const redisKey = `hotels:${city}`;
    const cacheExists = await redis.exists(redisKey);

    if (min !== undefined || max !== undefined) {
        if (!cacheExists) return [];
        return await getHotelsByPrice(city, min, max);
    }

    if (cacheExists) {
        return await getHotelsByPrice(city);
    }

    const client = await getTemporalClient();

    const result = await client.workflow.execute(hotelWorkflow, {
        taskQueue: "hotel-task-queue",
        workflowId: `hotel-${city}-${Date.now()}`,
        args: [city],
    });

    await saveHotels(city, result);

    return result;
}