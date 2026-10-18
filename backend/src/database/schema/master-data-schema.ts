import {
  mysqlTable,
  varchar,
  boolean,
  decimal,
  timestamp,
  uniqueIndex,
  text,
} from "drizzle-orm/mysql-core";
import { user } from "./auth-schema.js";

/**
 * 1. Cities (የከተሞች ዝርዝር)
 * Standardized Ethiopian cities for pickup, dropoff, and regional market rate pricing.
 * Multilingual: English, Amharic (አማርኛ), Afaan Oromoo.
 */
export const cities = mysqlTable("cities", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  nameAm: varchar("name_am", { length: 100 }).notNull(),
  nameOm: varchar("name_om", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }), // e.g. Oromia, Sidama, Addis Ababa
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * 2. Pricing Units (የዋጋ መለኪያዎች)
 * Units of measurement customized for Ethiopian logistics:
 * QTL (Quintal), TON (Ton), HD (Head Count), TRP (Flat Trip), ITM (Item/Carton), M3 (Cubic Meter).
 */
export const pricingUnits = mysqlTable("pricing_units", {
  id: varchar("id", { length: 36 }).primaryKey(),
  unitCode: varchar("unit_code", { length: 20 }).notNull().unique(), // e.g. QTL, TON, HD, TRP
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  nameAm: varchar("name_am", { length: 100 }).notNull(),
  nameOm: varchar("name_om", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * 3. Truck Types (የጭነት መኪና ዓይነቶች)
 * e.g., FSR, Sino Truck, Cattle Truck (የከብት መጫኛ), Isuzu, Trailer.
 * Bound to max capacity and unit_id for smart validation.
 */
export const truckTypes = mysqlTable("truck_types", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  nameAm: varchar("name_am", { length: 100 }).notNull(),
  nameOm: varchar("name_om", { length: 100 }).notNull(),
  maxCapacity: decimal("max_capacity", { precision: 10, scale: 2 }).notNull(),
  unitId: varchar("unit_id", { length: 36 })
    .notNull()
    .references(() => pricingUnits.id, { onDelete: "restrict" }),
  imageUrl: varchar("image_url", { length: 500 }),
  description: varchar("description", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * 4. Goods Types (የጭነት ዕቃ ዓይነቶች)
 * e.g., Teff, Livestock (Cows/Oxen), Coffee, Furniture, Cement.
 * Links to a default pricing unit (e.g. Teff -> QTL, Cows -> HD, Furniture -> TRP).
 */
export const goodsTypes = mysqlTable("goods_types", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  nameAm: varchar("name_am", { length: 100 }).notNull(),
  nameOm: varchar("name_om", { length: 100 }).notNull(),
  defaultUnitId: varchar("default_unit_id", { length: 36 })
    .notNull()
    .references(() => pricingUnits.id, { onDelete: "restrict" }),
  category: varchar("category", { length: 50 }).default("general"), // agricultural, livestock, construction, commercial
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * 5. Market Rates (የከተማ አስተዳዳሪ የገበያ ዋጋ መነሻ / Delala Benchmark Rates)
 * Town Manager / Admin pricing benchmark per route and unit.
 * Includes minRate & maxRate (and benchmark guidance) with a unique composite index.
 */
export const marketRates = mysqlTable(
  "market_rates",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    originCityId: varchar("origin_city_id", { length: 36 })
      .notNull()
      .references(() => cities.id, { onDelete: "cascade" }),
    destinationCityId: varchar("destination_city_id", { length: 36 })
      .notNull()
      .references(() => cities.id, { onDelete: "cascade" }),
    pricingUnitId: varchar("pricing_unit_id", { length: 36 })
      .notNull()
      .references(() => pricingUnits.id, { onDelete: "cascade" }),
    truckTypeId: varchar("truck_type_id", { length: 36 })
      .references(() => truckTypes.id, { onDelete: "set null" }),
    baseRate: decimal("base_rate", { precision: 12, scale: 2 }).default("0").notNull(),
    minRate: decimal("min_rate", { precision: 12, scale: 2 }).notNull(),
    maxRate: decimal("max_rate", { precision: 12, scale: 2 }).notNull(),
    marketCondition: varchar("market_condition", { length: 30 }).default("NORMAL").notNull(), // 'NORMAL' | 'HIGH_DEMAND' | 'POOR_ROAD'
    isFixedPrice: boolean("is_fixed_price").default(true).notNull(),
    notes: text("notes"),
    managerId: varchar("manager_id", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    routeUnitTruckIdx: uniqueIndex("route_unit_truck_idx").on(
      table.originCityId,
      table.destinationCityId,
      table.pricingUnitId,
      table.truckTypeId
    ),
  })
);
