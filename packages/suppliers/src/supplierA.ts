import { SupplierHotel } from "../../types/src/hotel";

export async function fetchSupplierA(city: string): Promise<SupplierHotel[]> {
  // simulate latency
  await new Promise(res => setTimeout(res, 200));

  return [
    {
      hotelId: "a1",
      name: "Holtin",
      price: 6000,
      city,
      commissionPct: 10,
    },
    {
      hotelId: "a2",
      name: "Radison",
      price: 5900,
      city,
      commissionPct: 13,
    },
  ];
}