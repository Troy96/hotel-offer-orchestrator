import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities";
import { mergeHotels } from "../../core/src/mergeHotels";
import { Hotel } from "../../types/src/hotel";

const { getSupplierAHotels, getSupplierBHotels } = proxyActivities<typeof activities>({
  startToCloseTimeout: "5 seconds",
});

export async function hotelWorkflow(city: string): Promise<Hotel[]> {
  // parallel execution
  const [aHotels, bHotels] = await Promise.all([
    getSupplierAHotels(city),
    getSupplierBHotels(city),
  ]);

  const merged = mergeHotels(aHotels, bHotels);

  return merged;
}