import { SupplierHotel } from "../../types/src/hotel";

export async function fetchSupplierA(city: string): Promise<SupplierHotel[]> {

  await new Promise(res => setTimeout(res, 200));

 const data = [
    {
      hotelId: "a1",
      name: "Holtin",
      price: 6000,
      city: "delhi",
      commissionPct: 10,
    },
    {
      hotelId: "a2",
      name: "Radison",
      price: 5900,
      city: "delhi",
      commissionPct: 13,
    },
  ];

  return data.filter(h => h.city.toLowerCase() === city.toLowerCase());
}