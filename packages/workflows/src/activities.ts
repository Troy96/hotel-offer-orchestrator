import { fetchSupplierA } from "../../suppliers/src/supplierA";
import { fetchSupplierB } from "../../suppliers/src/supplierB";
import { SupplierHotel } from "../../types/src/hotel";

export async function getSupplierAHotels(city: string): Promise<SupplierHotel[]> {
  try {
    return await fetchSupplierA(city);
  } catch (err) {
    console.error("Supplier A failed", err);
    return [];
  }
}

export async function getSupplierBHotels(city: string): Promise<SupplierHotel[]> {
  try {
    return await fetchSupplierB(city);
  } catch (err) {
    console.error("Supplier B failed", err);
    return [];
  }
}