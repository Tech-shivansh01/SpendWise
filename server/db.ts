import { and, between, desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { Expense, ExpenseCategory, InsertExpense, InsertSummary, InsertUser, Summary, expenses, summaries, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Expense queries
export async function createExpense(expense: InsertExpense): Promise<Expense> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(expenses).values(expense);
  const created = await db.select().from(expenses).where(eq(expenses.id, Number(result[0].insertId))).limit(1);
  return created[0]!;
}

export async function getUserExpenses(userId: number): Promise<Expense[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(desc(expenses.date));
}

export async function getExpenseById(id: number, userId: number): Promise<Expense | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId))).limit(1);
  return result[0];
}

export async function updateExpense(id: number, userId: number, updates: Partial<InsertExpense>): Promise<Expense> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(expenses).set(updates).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  const updated = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
  return updated[0]!;
}

export async function deleteExpense(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
}

export async function getExpensesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Expense[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(expenses).where(
    and(eq(expenses.userId, userId), between(expenses.date, startDate, endDate))
  ).orderBy(desc(expenses.date));
}

export async function getExpensesByCategory(userId: number, category: ExpenseCategory): Promise<Expense[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(expenses).where(
    and(eq(expenses.userId, userId), eq(expenses.category, category))
  ).orderBy(desc(expenses.date));
}

// Summary queries
export async function createSummary(summary: InsertSummary): Promise<Summary> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(summaries).values(summary);
  const created = await db.select().from(summaries).where(eq(summaries.id, Number(result[0].insertId))).limit(1);
  return created[0]!;
}

export async function getUserSummaries(userId: number): Promise<Summary[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(summaries).where(eq(summaries.userId, userId)).orderBy(desc(summaries.createdAt));
}

export async function getSummaryByPeriod(userId: number, period: "weekly" | "monthly" | "quarterly", startDate: Date): Promise<Summary | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(summaries).where(
    and(eq(summaries.userId, userId), eq(summaries.period, period), gte(summaries.startDate, startDate))
  ).limit(1);
  return result[0];
}
