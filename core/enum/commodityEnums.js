/**
 * Commodity Type Enums
 * Defines all possible commodity types in the system
 */
export const CommodityType = {
  GOLD: "gold",
  SILVER: "silver",
};

/**
 * Unit Enums
 * Defines all possible units of measurement
 */
export const Unit = {
  GRAM: "gram",
  OUNCE: "ounce",
  KILOGRAM: "kilogram",
};

/**
 * Karat Enums
 * Defines all possible karat values for gold
 */
export const Karat = {
  FOURTEEN: 14,
  SIXTEEN: 16,
  EIGHTEEN: 18,
  TWENTY_TWO: 22,
  TWENTY_FOUR: 24,
};

/**
 * Get commodity type enum values as array
 * Useful for Mongoose schema enum validation
 */
export const CommodityTypeValues = Object.values(CommodityType);

/**
 * Get unit enum values as array
 * Useful for Mongoose schema enum validation
 */
export const UnitValues = Object.values(Unit);

/**
 * Get karat enum values as array
 * Useful for Mongoose schema enum validation
 */
export const KaratValues = Object.values(Karat);

