import { SupplierHotel } from "../../types/src/hotel";

export async function fetchSupplierB(city: string): Promise<SupplierHotel[]> {
  
    await new Promise(res => setTimeout(res, 300));

  const data = [
    {
      hotelId: "b1",
      name: "Holtin",
      price: 5340, // cheaper -> should win
      city: 'mumbai',
      commissionPct: 20,
    },
    {
      hotelId: "b2",
      name: "Oberoi",
      price: 7200,
      city: 'mumbai',
      commissionPct: 25,
    },
  ];
  return data.filter(h => h.city.toLowerCase() === city.toLowerCase());
}