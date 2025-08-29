import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["admin", "operator", "viewer"]);
export const vehicleTypeEnum = pgEnum("vehicle_type", ["truck", "carreta"]);
export const operationStatusEnum = pgEnum("operation_status", ["scheduled", "at_gate", "loading", "unloading", "completed"]);
export const logLevelEnum = pgEnum("log_level", ["info", "warn", "error", "debug"]);
export const logSourceEnum = pgEnum("log_source", ["server", "client"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("viewer"),
  permissions: text("permissions").array().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plate: text("plate").notNull().unique(),
  type: vehicleTypeEnum("type").notNull(),
  trailerPlate: text("trailer_plate"),
  capacity: integer("capacity"),
  transportCompany: text("transport_company"),
  primaryDriver: text("primary_driver"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const materials = pgTable("materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
  unit: text("unit").notNull().default("toneladas"),
  specificWeight: integer("specific_weight"),
  riskClass: text("risk_class"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const operations = pgTable("operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id).notNull(),
  materialId: varchar("material_id").references(() => materials.id).notNull(),
  status: operationStatusEnum("status").notNull().default("scheduled"),
  type: text("type").notNull(), // "loading" or "unloading"
  scheduledDate: timestamp("scheduled_date"),
  scheduledTime: text("scheduled_time"),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  destination: text("destination"),
  origin: text("origin"),
  dockNumber: text("dock_number"),
  progress: integer("progress").default(0),
  driver: text("driver").notNull(),
  transportCompany: text("transport_company").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const logs = pgTable("logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  level: logLevelEnum("level").notNull(),
  source: logSourceEnum("source").notNull(),
  message: text("message").notNull(),
  details: text("details"), // JSON string for additional context
  userId: varchar("user_id").references(() => users.id),
  requestId: text("request_id"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  stackTrace: text("stack_trace"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const operationsRelations = relations(operations, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [operations.vehicleId],
    references: [vehicles.id],
  }),
  material: one(materials, {
    fields: [operations.materialId],
    references: [materials.id],
  }),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  operations: many(operations),
}));

export const materialsRelations = relations(materials, ({ many }) => ({
  operations: many(operations),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
});

export const insertOperationSchema = createInsertSchema(operations, {
  scheduledDate: z.union([z.date(), z.string()]).transform((val) => {
    if (typeof val === "string") {
      return new Date(val);
    }
    return val;
  }).nullable().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;

export type InsertOperation = z.infer<typeof insertOperationSchema>;
export type Operation = typeof operations.$inferSelect;

export type OperationWithRelations = Operation & {
  vehicle: Vehicle;
  material: Material;
};

export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;
