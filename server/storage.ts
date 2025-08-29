import { 
  users, vehicles, materials, operations,
  type User, type InsertUser,
  type Vehicle, type InsertVehicle,
  type Material, type InsertMaterial,
  type Operation, type InsertOperation,
  type OperationWithRelations
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like } from "drizzle-orm";

export interface IStorage {
  // Users
  getUsers(id: string): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPermissions(id: string, permissions: string[]): Promise<User>;

  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehicleByPlate(plate: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;

  // Materials
  getMaterials(): Promise<Material[]>;
  getMaterial(id: string): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: string, material: Partial<InsertMaterial>): Promise<Material>;
  deleteMaterial(id: string): Promise<void>;

  // Operations
  getOperations(): Promise<OperationWithRelations[]>;
  getOperation(id: string): Promise<OperationWithRelations | undefined>;
  getOperationsByStatus(status: string): Promise<OperationWithRelations[]>;
  createOperation(operation: InsertOperation): Promise<Operation>;
  updateOperation(id: string, operation: Partial<InsertOperation>): Promise<Operation>;
  deleteOperation(id: string): Promise<void>;
  
  // Dashboard stats
  getStats(): Promise<{
    scheduled: number;
    atGate: number;
    loading: number;
    unloading: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUsers(): Promise<User[] | undefined>{
      const user = await db.select().from(users);
      return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPermissions(id: string, permissions: string[]): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ permissions })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getVehicleByPlate(plate: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.plate, plate));
    return vehicle || undefined;
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values(insertVehicle)
      .returning();
    return vehicle;
  }

  async updateVehicle(id: string, updateVehicle: Partial<InsertVehicle>): Promise<Vehicle> {
    const [vehicle] = await db
      .update(vehicles)
      .set(updateVehicle)
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle;
  }

  async deleteVehicle(id: string): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  async getMaterials(): Promise<Material[]> {
    return await db.select().from(materials).orderBy(desc(materials.createdAt));
  }

  async getMaterial(id: string): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material || undefined;
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const [material] = await db
      .insert(materials)
      .values(insertMaterial)
      .returning();
    return material;
  }

  async updateMaterial(id: string, updateMaterial: Partial<InsertMaterial>): Promise<Material> {
    const [material] = await db
      .update(materials)
      .set(updateMaterial)
      .where(eq(materials.id, id))
      .returning();
    return material;
  }

  async deleteMaterial(id: string): Promise<void> {
    await db.delete(materials).where(eq(materials.id, id));
  }

  async getOperations(): Promise<OperationWithRelations[]> {
    return await db
      .select()
      .from(operations)
      .leftJoin(vehicles, eq(operations.vehicleId, vehicles.id))
      .leftJoin(materials, eq(operations.materialId, materials.id))
      .orderBy(desc(operations.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.operations,
          vehicle: row.vehicles!,
          material: row.materials!,
        }))
      );
  }

  async getOperation(id: string): Promise<OperationWithRelations | undefined> {
    const [row] = await db
      .select()
      .from(operations)
      .leftJoin(vehicles, eq(operations.vehicleId, vehicles.id))
      .leftJoin(materials, eq(operations.materialId, materials.id))
      .where(eq(operations.id, id));
    
    if (!row) return undefined;
    
    return {
      ...row.operations,
      vehicle: row.vehicles!,
      material: row.materials!,
    };
  }

  async getOperationsByStatus(status: string): Promise<OperationWithRelations[]> {
    return await db
      .select()
      .from(operations)
      .leftJoin(vehicles, eq(operations.vehicleId, vehicles.id))
      .leftJoin(materials, eq(operations.materialId, materials.id))
      .where(eq(operations.status, status as any))
      .orderBy(desc(operations.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.operations,
          vehicle: row.vehicles!,
          material: row.materials!,
        }))
      );
  }

  async createOperation(insertOperation: InsertOperation): Promise<Operation> {
    const [operation] = await db
      .insert(operations)
      .values(insertOperation)
      .returning();
    return operation;
  }

  async updateOperation(id: string, updateOperation: Partial<InsertOperation>): Promise<Operation> {
    const [operation] = await db
      .update(operations)
      .set({ ...updateOperation, updatedAt: new Date() })
      .where(eq(operations.id, id))
      .returning();
    return operation;
  }

  async deleteOperation(id: string): Promise<void> {
    await db.delete(operations).where(eq(operations.id, id));
  }

  async getStats(): Promise<{
    scheduled: number;
    atGate: number;
    loading: number;
    unloading: number;
  }> {
    const scheduled = await db
      .select()
      .from(operations)
      .where(eq(operations.status, "scheduled"));
    
    const atGate = await db
      .select()
      .from(operations)
      .where(eq(operations.status, "at_gate"));
    
    const loading = await db
      .select()
      .from(operations)
      .where(eq(operations.status, "loading"));
    
    const unloading = await db
      .select()
      .from(operations)
      .where(eq(operations.status, "unloading"));

    return {
      scheduled: scheduled.length,
      atGate: atGate.length,
      loading: loading.length,
      unloading: unloading.length,
    };
  }
}

export const storage = new DatabaseStorage();
