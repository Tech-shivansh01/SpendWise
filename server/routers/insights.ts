import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createSummary,
  getExpensesByDateRange,
  getUserSummaries,
} from "../db";
import { generatePersonalizedInsights, generatePeriodSummary } from "../insights";
import { endOfDay, startOfDay, subDays, subMonths } from "date-fns";

export const insightsRouter = router({
  getSummaries: protectedProcedure.query(async ({ ctx }) => {
    return getUserSummaries(ctx.user.id);
  }),

  generateWeeklySummary: protectedProcedure
    .input(
      z
        .object({
          date: z
            .date()
            .or(z.string().transform((s) => new Date(s)))
            .optional(),
        })
        .optional()
    )
    .mutation(async ({ ctx, input }) => {
      const targetDate = input?.date
        ? input.date instanceof Date
          ? input.date
          : new Date(input.date)
        : new Date();
      const endDate = endOfDay(targetDate);
      const startDate = startOfDay(subDays(targetDate, 6));

      const expenses = await getExpensesByDateRange(ctx.user.id, startDate, endDate);

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

      const content = await generatePeriodSummary(expenses, "weekly");

      const summary = await createSummary({
        userId: ctx.user.id,
        period: "weekly",
        startDate,
        endDate,
        content,
        totalSpent: totalSpent.toString(),
        topCategory: topCategory || null,
      });

      return summary;
    }),

  generateMonthlySummary: protectedProcedure
    .input(
      z
        .object({
          date: z
            .date()
            .or(z.string().transform((s) => new Date(s)))
            .optional(),
        })
        .optional()
    )
    .mutation(async ({ ctx, input }) => {
      const targetDate = input?.date
        ? input.date instanceof Date
          ? input.date
          : new Date(input.date)
        : new Date();
      const endDate = endOfDay(targetDate);
      const startDate = startOfDay(subMonths(targetDate, 1));

      const expenses = await getExpensesByDateRange(ctx.user.id, startDate, endDate);

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

      const content = await generatePeriodSummary(expenses, "monthly");

      const summary = await createSummary({
        userId: ctx.user.id,
        period: "monthly",
        startDate,
        endDate,
        content,
        totalSpent: totalSpent.toString(),
        topCategory: topCategory || null,
      });

      return summary;
    }),

  generateQuarterlySummary: protectedProcedure
    .input(
      z
        .object({
          date: z
            .date()
            .or(z.string().transform((s) => new Date(s)))
            .optional(),
        })
        .optional()
    )
    .mutation(async ({ ctx, input }) => {
      const targetDate = input?.date
        ? input.date instanceof Date
          ? input.date
          : new Date(input.date)
        : new Date();
      const endDate = endOfDay(targetDate);
      const startDate = startOfDay(subMonths(targetDate, 3));

      const expenses = await getExpensesByDateRange(ctx.user.id, startDate, endDate);

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

      const content = await generatePeriodSummary(expenses, "quarterly");

      const summary = await createSummary({
        userId: ctx.user.id,
        period: "quarterly",
        startDate,
        endDate,
        content,
        totalSpent: totalSpent.toString(),
        topCategory: topCategory || null,
      });

      return summary;
    }),

  getPersonalizedInsights: protectedProcedure
    .input(
      z
        .object({
          period: z.enum(["weekly", "monthly", "quarterly"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const periodType = input?.period || "monthly";
      let startDate: Date;
      const endDate = new Date();

      if (periodType === "weekly") {
        startDate = startOfDay(subDays(endDate, 6));
      } else if (periodType === "quarterly") {
        startDate = startOfDay(subMonths(endDate, 3));
      } else {
        startDate = startOfDay(subMonths(endDate, 1));
      }

      const expenses = await getExpensesByDateRange(ctx.user.id, startDate, endDate);
      const insights = await generatePersonalizedInsights(expenses, periodType);

      return insights;
    }),

  getSpendingInsights: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const weeklyStart = startOfDay(subDays(now, 6));
    const monthlyStart = startOfDay(subMonths(now, 1));
    const quarterlyStart = startOfDay(subMonths(now, 3));

    const weeklyExpenses = await getExpensesByDateRange(
      ctx.user.id,
      weeklyStart,
      now
    );
    const monthlyExpenses = await getExpensesByDateRange(
      ctx.user.id,
      monthlyStart,
      now
    );
    const quarterlyExpenses = await getExpensesByDateRange(
      ctx.user.id,
      quarterlyStart,
      now
    );

    const calculateStats = (expenses: typeof weeklyExpenses) => {
      const total = expenses.reduce(
        (sum, exp) => sum + parseFloat(exp.amount.toString()),
        0
      );
      const byCategory: Record<string, number> = {};
      expenses.forEach((exp) => {
        const amount = parseFloat(exp.amount.toString());
        byCategory[exp.category] = (byCategory[exp.category] || 0) + amount;
      });
      return { total, byCategory };
    };

    const weekly = calculateStats(weeklyExpenses);
    const monthly = calculateStats(monthlyExpenses);
    const quarterly = calculateStats(quarterlyExpenses);

    return {
      weekly: {
        total: weekly.total,
        byCategory: weekly.byCategory,
      },
      monthly: {
        total: monthly.total,
        byCategory: monthly.byCategory,
      },
      quarterly: {
        total: quarterly.total,
        byCategory: quarterly.byCategory,
      },
    };
  }),
});
