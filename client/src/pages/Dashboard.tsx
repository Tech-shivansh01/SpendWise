import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Plus, TrendingUp, Wallet, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useMemo } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CATEGORY_EMOJIS } from "@shared/const";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const formatCurrency = (amount: number, symbol: string) => `${symbol}${amount.toFixed(2)}`;

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { getSymbol, convertAmount } = useCurrency();
  const { data: stats, isLoading: statsLoading } = trpc.expenses.getStats.useQuery();
  const { data: insights, isLoading: insightsLoading } = trpc.insights.getSpendingInsights.useQuery();

  const chartData = useMemo(() => {
    if (!stats?.byCategory) return [];
    return Object.entries(stats.byCategory).map(([category, amount]) => {
      const convertedAmount = convertAmount(parseFloat(amount.toString()));
      return {
        name: `${CATEGORY_EMOJIS[category] || "📦"} ${category}`,
        value: convertedAmount,
      };
    });
  }, [stats?.byCategory, convertAmount]);

  const trendData = useMemo(() => {
    if (!stats?.recentExpenses || stats.recentExpenses.length === 0) return [];
    const dateMap = new Map<string, number>();
    let cumulative = 0;
    stats.recentExpenses
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((expense) => {
        const dateStr = new Date(expense.date).toLocaleDateString();
        const amount = parseFloat(expense.amount.toString());
        cumulative += convertAmount(amount);
        dateMap.set(dateStr, cumulative);
      });
    return Array.from(dateMap, ([date, total]) => ({
      date,
      total: parseFloat(total.toFixed(2)),
    }));
  }, [stats?.recentExpenses, convertAmount]);

  const isLoading = statsLoading || insightsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track and analyze your spending</p>
        </div>
        <Button onClick={() => setLocation("/add-expense")} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words line-clamp-1">{formatCurrency(convertAmount(stats?.totalSpent || 0), getSymbol())}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.expenseCount || 0} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words line-clamp-1">{stats?.topCategory ? CATEGORY_EMOJIS[stats.topCategory] : "—"} {stats?.topCategory || "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.topCategory && stats.byCategory[stats.topCategory] ? formatCurrency(convertAmount(parseFloat(stats.byCategory[stats.topCategory].toString())), getSymbol()) : formatCurrency(0, getSymbol())}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words line-clamp-1">
              {formatCurrency(stats?.expenseCount ? convertAmount(stats.totalSpent / stats.expenseCount) : 0, getSymbol())}
            </div>
            <p className="text-xs text-muted-foreground mt-1">per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Distribution of your expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${getSymbol()}${(value as number).toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
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

        {/* Category Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Totals</CardTitle>
            <CardDescription>Amount spent per category</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
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

      {/* Spending Trends Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends Over Time</CardTitle>
          <CardDescription>Cumulative spending progression</CardDescription>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(typeof value === 'number' ? value : parseFloat(value), getSymbol())} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No expense data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Periods Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Summary</CardTitle>
          <CardDescription>Your spending across different periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">This Week</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(convertAmount(insights?.weekly.total ? parseFloat(insights.weekly.total.toString()) : 0), getSymbol())}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">This Month</span>
                <Wallet className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(convertAmount(insights?.monthly.total ? parseFloat(insights.monthly.total.toString()) : 0), getSymbol())}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">This Quarter</span>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(convertAmount(insights?.quarterly.total ? parseFloat(insights.quarterly.total.toString()) : 0), getSymbol())}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLocation("/expenses")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {stats?.recentExpenses && stats.recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {stats.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{CATEGORY_EMOJIS[expense.category] || "📦"} {expense.category}</p>
                    <p className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(convertAmount(parseFloat(expense.amount.toString())), getSymbol())}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No expenses yet. Start tracking your spending!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
