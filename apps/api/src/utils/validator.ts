type HotelQuery = {
  city: string;
  min?: number;
  max?: number;
};

type ValidationResult =
  | { success: true; data: HotelQuery }
  | { success: false; error: string };

export function validateHotelQuery(query: any): ValidationResult {
  const city = query.city?.toLowerCase();

  if (!city || typeof city !== "string") {
    return { success: false, error: "city is required" };
  }

  let min: number | undefined;
  let max: number | undefined;

  if (query.minPrice !== undefined) {
    min = Number(query.minPrice);
    if (isNaN(min)) {
      return { success: false, error: "minPrice must be a number" };
    }
  }

  if (query.maxPrice !== undefined) {
    max = Number(query.maxPrice);
    if (isNaN(max)) {
      return { success: false, error: "maxPrice must be a number" };
    }
  }

  if (min !== undefined && max !== undefined && min > max) {
    return {
      success: false,
      error: "minPrice cannot be greater than maxPrice",
    };
  }

  return {
    success: true,
    data: { city, min, max },
  };
}