import { SupplierHotel } from "../../types/src/hotel";

export async function fetchSupplierB(city: string): Promise<SupplierHotel[]> {
  await new Promise(res => setTimeout(res, 300));

  return [
    {
      hotelId: "b1",
      name: "Holtin",
      price: 5340, // cheaper → should win
      city,
      commissionPct: 20,
    },
    {
      hotelId: "b2",
      name: "Oberoi",
      price: 7200,
      city,
      commissionPct: 25,
    },
  ];
}