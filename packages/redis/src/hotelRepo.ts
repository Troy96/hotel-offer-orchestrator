import { redis } from "./client";
import { Hotel } from "../../types/src/hotel";

export async function saveHotels(city: string, hotels: Hotel[]) {
  const key = `hotels:${city}`;

  // clear old data (important)
  await redis.del(key);

  const pipeline = redis.pipeline();

  hotels.forEach(h => {
    pipeline.zadd(key, h.price, JSON.stringify(h));
  });

  //TTL 
  pipeline.expire(key, 300); // 5 mins

  await pipeline.exec();
}

export async function getHotelsByPrice(
  city: string,
  min?: number,
  max?: number
): Promise<Hotel[]> {
  const key = `hotels:${city}`;

  const minScore = min ?? 0;
  const maxScore = max ?? "+inf";

  const results = await redis.zrangebyscore(key, minScore, maxScore);

  return results.map(r => JSON.parse(r));
}