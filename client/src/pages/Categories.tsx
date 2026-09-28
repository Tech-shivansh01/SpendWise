import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CATEGORY_EMOJIS } from "@shared/const";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const formatCurrency = (amount: number, symbol: string) => `${symbol}${amount.toFixed(2)}`;

export default function Categories() {
  const { getSymbol, convertAmount } = useCurrency();
  const { data: stats, isLoading } = trpc.expenses.getStats.useQuery();

  const categoryData = useMemo(() => {
    if (!stats?.byCategory) return [];
    return Object.entries(stats.byCategory).map(([category, amount]) => {
      const convertedAmount = convertAmount(parseFloat(amount.toString()));
      const convertedTotal = convertAmount(stats.totalSpent);
      return {
        name: `${CATEGORY_EMOJIS[category]} ${category}`,
        value: convertedAmount,
        percentage: convertedTotal > 0 ? ((convertedAmount / convertedTotal) * 100).toFixed(1) : "0",
      };
    });
  }, [stats?.byCategory, stats?.totalSpent, convertAmount]);

  const sortedByAmount = [...categoryData].sort((a, b) => b.value - a.value);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Category Breakdown</h1>
        <p className="text-muted-foreground mt-1">Detailed analysis of spending by category</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
            <CardDescription>Percentage of total spending</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(typeof value === 'number' ? value : parseFloat(value), getSymbol())} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
            <CardDescription>Amount spent per category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(typeof value === 'number' ? value : parseFloat(value), getSymbol())} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Category List */}
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Complete breakdown of all categories</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedByAmount.length > 0 ? (
            <div className="space-y-3">
              {sortedByAmount.map((category, index) => (
                <div
                  key={category.name}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-semibold">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.percentage}% of total</p>
                      </div>
                    </div>
                    <p className="font-bold text-lg">{formatCurrency(category.value, getSymbol())}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${category.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No expenses recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {sortedByAmount.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Highest Category</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{sortedByAmount[0]?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(sortedByAmount[0]?.value || 0, getSymbol())} ({sortedByAmount[0]?.percentage}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lowest Category</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{sortedByAmount[sortedByAmount.length - 1]?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(sortedByAmount[sortedByAmount.length - 1]?.value || 0, getSymbol())} ({sortedByAmount[sortedByAmount.length - 1]?.percentage}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{sortedByAmount.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Total categories with expenses
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
