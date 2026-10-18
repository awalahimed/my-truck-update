import { z } from 'zod';

// ==========================================
// 1. CITIES SCHEMAS
// ==========================================
export const createCitySchema = z.object({
  nameEn: z.string().min(2, 'English name is required'),
  nameAm: z.string().min(2, 'Amharic name is required'),
  nameOm: z.string().min(2, 'Afaan Oromoo name is required'),
  region: z.string().optional(),
});

export const updateCitySchema = z.object({
  id: z.string().min(1, 'City ID is required'),
  nameEn: z.string().min(2).optional(),
  nameAm: z.string().min(2).optional(),
  nameOm: z.string().min(2).optional(),
  region: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ==========================================
// 2. PRICING UNITS SCHEMAS
// ==========================================
export const createPricingUnitSchema = z.object({
  unitCode: z.string().min(2, 'Unit code is required (e.g., QTL, TON, HD, TRP)').toUpperCase(),
  nameEn: z.string().min(2, 'English name is required'),
  nameAm: z.string().min(2, 'Amharic name is required'),
  nameOm: z.string().min(2, 'Afaan Oromoo name is required'),
  description: z.string().optional(),
});

export const updatePricingUnitSchema = z.object({
  id: z.string().min(1, 'Unit ID is required'),
  unitCode: z.string().min(2).toUpperCase().optional(),
  nameEn: z.string().min(2).optional(),
  nameAm: z.string().min(2).optional(),
  nameOm: z.string().min(2).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ==========================================
// 3. TRUCK TYPES SCHEMAS
// ==========================================
export const createTruckTypeSchema = z.object({
  nameEn: z.string().min(2, 'English name is required'),
  nameAm: z.string().min(2, 'Amharic name is required'),
  nameOm: z.string().min(2, 'Afaan Oromoo name is required'),
  maxCapacity: z.coerce.string().min(1, 'Max capacity is required'),
  unitId: z.string().min(1, 'Unit ID is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
});

export const updateTruckTypeSchema = z.object({
  id: z.string().min(1, 'Truck ID is required'),
  nameEn: z.string().min(2).optional(),
  nameAm: z.string().min(2).optional(),
  nameOm: z.string().min(2).optional(),
  maxCapacity: z.coerce.string().optional(),
  unitId: z.string().min(1).optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ==========================================
// 4. GOODS TYPES SCHEMAS
// ==========================================
export const createGoodsTypeSchema = z.object({
  nameEn: z.string().min(2, 'English name is required'),
  nameAm: z.string().min(2, 'Amharic name is required'),
  nameOm: z.string().min(2, 'Afaan Oromoo name is required'),
  defaultUnitId: z.string().min(1, 'Default unit ID is required'),
  category: z.string().default('general'),
});

export const updateGoodsTypeSchema = z.object({
  id: z.string().min(1, 'Goods ID is required'),
  nameEn: z.string().min(2).optional(),
  nameAm: z.string().min(2).optional(),
  nameOm: z.string().min(2).optional(),
  defaultUnitId: z.string().min(1).optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ==========================================
// 5. MARKET RATES SCHEMAS (Delala Benchmarks)
// ==========================================
export const createMarketRateSchema = z.object({
  originCityId: z.string().min(1, 'Origin city is required'),
  destinationCityId: z.string().min(1, 'Destination city is required'),
  pricingUnitId: z.string().min(1, 'Pricing unit is required'),
  truckTypeId: z.string().optional().nullable(),
  minRate: z.coerce.string().min(1, 'Min rate is required'),
  maxRate: z.coerce.string().min(1, 'Max rate is required'),
});

export const updateMarketRateSchema = z.object({
  id: z.string().min(1, 'Market rate ID is required'),
  truckTypeId: z.string().optional().nullable(),
  minRate: z.coerce.string().optional(),
  maxRate: z.coerce.string().optional(),
  isActive: z.boolean().optional(),
});

// ==========================================
// 6. SHARED TOGGLE / DEACTIVATE SCHEMA
// ==========================================
export const toggleActiveSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  isActive: z.boolean().optional(), // if omitted, toggles current value
});

// ==========================================
// 7. PRICING ESTIMATE SCHEMAS
// ==========================================
export const getEstimateSchema = z.object({
  originCityId: z.string().min(1, 'Origin city is required'),
  destinationCityId: z.string().min(1, 'Destination city is required'),
  pricingUnitId: z.string().min(1, 'Pricing unit is required'),
  truckTypeId: z.string().optional().nullable(),
  quantity: z.number().positive('Quantity must be greater than 0'),
});

