import { invokeLLM } from "./_core/llm";
import { Expense } from "../drizzle/schema";

export interface SpendingAnalysis {
  summary: string;
  trends: string[];
  recommendations: string[];
  riskAreas: string[];
}

/**
 * Generate personalized spending insights using AI
 * Analyzes expense patterns and provides actionable recommendations
 */
export async function generatePersonalizedInsights(
  expenses: Expense[],
  period: string
): Promise<SpendingAnalysis> {
  if (expenses.length === 0) {
    return {
      summary: `No expenses recorded for this ${period}.`,
      trends: [],
      recommendations: ["Start tracking your expenses to get personalized insights."],
      riskAreas: [],
    };
  }

  const totalSpent = expenses.reduce((sum, exp) => {
    return sum + parseFloat(exp.amount.toString());
  }, 0);

  const byCategory: Record<string, { total: number; count: number }> = {};
  expenses.forEach((exp) => {
    const amount = parseFloat(exp.amount.toString());
    if (!byCategory[exp.category]) {
      byCategory[exp.category] = { total: 0, count: 0 };
    }
    byCategory[exp.category].total += amount;
    byCategory[exp.category].count += 1;
  });

  const avgPerExpense = totalSpent / expenses.length;
  const categoryBreakdown = Object.entries(byCategory)
    .map(
      ([cat, data]) =>
        `${cat}: $${data.total.toFixed(2)} (${data.count} transactions, avg $${(data.total / data.count).toFixed(2)})`
    )
    .join("\n");

  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 3)
    .map(([cat, data]) => `${cat} ($${data.total.toFixed(2)})`)
    .join(", ");

  const systemPrompt = `You are a personal finance advisor specializing in helping students manage their money effectively. 
Your role is to analyze spending patterns and provide actionable, personalized insights that are:
- Specific to the user's actual spending data
- Encouraging and non-judgmental
- Focused on practical improvements
- Realistic for a student budget

Format your response as JSON with the following structure:
{
  "summary": "A 2-3 sentence overview of their spending pattern",
  "trends": ["trend 1", "trend 2", "trend 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "riskAreas": ["risk area 1", "risk area 2"]
}`;

  const userPrompt = `Analyze this ${period} spending data and provide insights:

Total Spent: $${totalSpent.toFixed(2)}
Average per Transaction: $${avgPerExpense.toFixed(2)}
Top Categories: ${topCategories}

Detailed Breakdown:
${categoryBreakdown}

Recent Transactions:
${expenses
  .slice(0, 10)
  .map(
    (e) =>
      `- ${e.category}: $${parseFloat(e.amount.toString()).toFixed(2)} on ${e.date.toLocaleDateString()}${e.notes ? ` (${e.notes})` : ""}`
  )
  .join("\n")}

Provide personalized insights based on this data.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "spending_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "Overview of spending pattern",
              },
              trends: {
                type: "array",
                items: { type: "string" },
                description: "Key spending trends identified",
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
                description: "Actionable recommendations",
              },
              riskAreas: {
                type: "array",
                items: { type: "string" },
                description: "Areas of concern or high spending",
              },
            },
            required: ["summary", "trends", "recommendations", "riskAreas"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    const parsed =
      typeof content === "string" ? JSON.parse(content) : content;

    return {
      summary: parsed.summary || "Unable to generate summary",
      trends: Array.isArray(parsed.trends) ? parsed.trends : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      riskAreas: Array.isArray(parsed.riskAreas) ? parsed.riskAreas : [],
    };
  } catch (error) {
    console.error("Error generating insights:", error);
    // Fallback to basic analysis if LLM fails
    return {
      summary: `You spent $${totalSpent.toFixed(2)} this ${period}. Your top spending category is ${topCategories.split(",")[0]}.`,
      trends: [
        `Average transaction: $${avgPerExpense.toFixed(2)}`,
        `Total transactions: ${expenses.length}`,
        `Top category: ${topCategories.split(",")[0]}`,
      ],
      recommendations: [
        "Review your top spending categories to identify areas for savings",
        "Set category-based budgets to track spending more effectively",
        "Look for recurring expenses that could be reduced or eliminated",
      ],
      riskAreas: [],
    };
  }
}

/**
 * Generate a summary for a specific time period
 */
export async function generatePeriodSummary(
  expenses: Expense[],
  period: "weekly" | "monthly" | "quarterly"
): Promise<string> {
  if (expenses.length === 0) {
    return `No expenses recorded for this ${period}.`;
  }

  const totalSpent = expenses.reduce((sum, exp) => {
    return sum + parseFloat(exp.amount.toString());
  }, 0);

  const byCategory: Record<string, number> = {};
  expenses.forEach((exp) => {
    const amount = parseFloat(exp.amount.toString());
    byCategory[exp.category] = (byCategory[exp.category] || 0) + amount;
  });

  const categoryBreakdown = Object.entries(byCategory)
    .map(([cat, amount]) => `${cat}: $${amount.toFixed(2)}`)
    .join(", ");

  const periodLabel =
    period === "quarterly"
      ? "3-month"
      : period === "monthly"
        ? "monthly"
        : "weekly";

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a friendly personal finance advisor. Provide a concise, encouraging ${periodLabel} spending summary with actionable insights.`,
        },
        {
          role: "user",
          content: `Summarize my ${periodLabel} spending:
Total: $${totalSpent.toFixed(2)}
Breakdown: ${categoryBreakdown}
Transactions: ${expenses.length}

Provide a brief summary (2-4 sentences) with one key insight and one actionable tip.`,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    return typeof content === "string"
      ? content
      : JSON.stringify(content);
  } catch (error) {
    console.error("Error generating period summary:", error);
    return `You spent $${totalSpent.toFixed(2)} this ${period} across ${expenses.length} transactions. Main categories: ${categoryBreakdown}.`;
  }
}
