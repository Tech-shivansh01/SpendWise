import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  getExpensesByCategory,
  getExpensesByDateRange,
  getUserExpenses,
  updateExpense,
} from "../db";
import { EXPENSE_CATEGORIES } from "../../drizzle/schema";

const expenseInput = z.object({
  amount: z.string().or(z.number()).transform((v) => {
    const num = typeof v === "string" ? parseFloat(v) : v;
    if (isNaN(num)) throw new Error("Invalid amount");
    return num;
  }),
  category: z.enum(EXPENSE_CATEGORIES),
  date: z.date().or(z.string().transform((s) => new Date(s))),
  notes: z.string().optional(),
});

export const expensesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserExpenses(ctx.user.id);
  }),

  create: protectedProcedure
    .input(expenseInput)
    .mutation(async ({ ctx, input }) => {
      return createExpense({
        userId: ctx.user.id,
        amount: input.amount.toString(),
        category: input.category,
        date: input.date instanceof Date ? input.date : new Date(input.date),
        notes: input.notes || null,
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return getExpenseById(input.id, ctx.user.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        ...expenseInput.partial().shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const updateData: Record<string, unknown> = {};

      if (updates.amount !== undefined) {
        updateData.amount = updates.amount.toString();
      }
      if (updates.category !== undefined) {
        updateData.category = updates.category;
      }
      if (updates.date !== undefined) {
        updateData.date =
          updates.date instanceof Date ? updates.date : new Date(updates.date);
      }
      if (updates.notes !== undefined) {
        updateData.notes = updates.notes || null;
      }

      return updateExpense(id, ctx.user.id, updateData as any);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteExpense(input.id, ctx.user.id);
      return { success: true };
    }),

  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date().or(z.string().transform((s) => new Date(s))),
        endDate: z.date().or(z.string().transform((s) => new Date(s))),
      })
    )
    .query(async ({ ctx, input }) => {
      const start =
        input.startDate instanceof Date
          ? input.startDate
          : new Date(input.startDate);
      const end =
        input.endDate instanceof Date ? input.endDate : new Date(input.endDate);
      return getExpensesByDateRange(ctx.user.id, start, end);
    }),

  getByCategory: protectedProcedure
    .input(z.object({ category: z.enum(EXPENSE_CATEGORIES) }))
    .query(async ({ ctx, input }) => {
      return getExpensesByCategory(ctx.user.id, input.category);
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const expenses = await getUserExpenses(ctx.user.id);

    const totalSpent = expenses.reduce((sum, exp) => {
      return sum + parseFloat(exp.amount.toString());
    }, 0);

    const byCategory: Record<string, number> = {};
    expenses.forEach((exp) => {
      const amount = parseFloat(exp.amount.toString());
      byCategory[exp.category] = (byCategory[exp.category] || 0) + amount;
    });

    const topCategory = Object.entries(byCategory).sort(([, a], [, b]) =>
      b - a
    )[0]?.[0];

    return {
      totalSpent,
      expenseCount: expenses.length,
      byCategory,
      topCategory,
      recentExpenses: expenses.slice(0, 5),
    };
  }),
});
