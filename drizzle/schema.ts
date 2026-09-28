import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Expense categories
 */
export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Utilities",
  "Health",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/**
 * Expenses table - stores individual expense records
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Keep four decimal places because INR inputs are converted to USD before storage.
  // Example: ₹100 / 83 = $1.204819..., which must not be rounded to $1.20.
  amount: decimal("amount", { precision: 10, scale: 4 }).notNull(),
  category: mysqlEnum("category", EXPENSE_CATEGORIES).notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * AI Summaries table - stores generated summaries for different periods
 */
export const summaries = mysqlTable("summaries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  period: mysqlEnum("period", ["weekly", "monthly", "quarterly"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  content: text("content").notNull(),
  totalSpent: decimal("totalSpent", { precision: 10, scale: 4 }).notNull(),
  topCategory: varchar("topCategory", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Summary = typeof summaries.$inferSelect;
export type InsertSummary = typeof summaries.$inferInsert;
