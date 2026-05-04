import { SupplierHotel, Hotel } from "../../types/src/hotel";

export function mergeHotels(
  a: SupplierHotel[],
  b: SupplierHotel[]
): Hotel[] {
  const map = new Map<string, Hotel>();

  const process = (hotel: SupplierHotel, supplier: string) => {
    const key = hotel.name.toLowerCase();

    const existing = map.get(key);

    const current: Hotel = {
      name: hotel.name,
      price: hotel.price,
      supplier,
      commissionPct: hotel.commissionPct,
    };

    if (!existing || hotel.price < existing.price) {
      map.set(key, current);
    }
  };

  a.forEach(h => process(h, "Supplier A"));
  b.forEach(h => process(h, "Supplier B"));

  return Array.from(map.values());
}