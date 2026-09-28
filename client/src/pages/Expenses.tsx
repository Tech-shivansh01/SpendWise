import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Search, ArrowUpDown } from "lucide-react";
import { EXPENSE_CATEGORIES, CATEGORY_EMOJIS } from "@shared/const";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Expenses() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
  const { getSymbol, convertAmount } = useCurrency();

  const { data: expenses, isLoading } = trpc.expenses.list.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      utils.expenses.list.invalidate();
      utils.expenses.getStats.invalidate();
      utils.insights.getSpendingInsights.invalidate();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete expense");
    },
  });

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];

    let filtered = expenses.filter((expense) => {
      const matchesSearch =
        expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || expense.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "date-asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "amount-desc") {
        return parseFloat(b.amount.toString()) - parseFloat(a.amount.toString());
      } else if (sortBy === "amount-asc") {
        return parseFloat(a.amount.toString()) - parseFloat(b.amount.toString());
      }
      return 0;
    });

    return sorted;
  }, [expenses, searchTerm, selectedCategory, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground mt-1">Manage your expense records</p>
        </div>
        <Button onClick={() => setLocation("/add-expense")} size="sm" className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by notes or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_EMOJIS[cat]} {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredExpenses.length} Expense{filteredExpenses.length !== 1 ? "s" : ""}
          </CardTitle>
          <CardDescription>
            {selectedCategory !== "all" && `Showing ${selectedCategory} expenses`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length > 0 ? (
            <div className="space-y-2">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* First row: Category and Amount */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <p className="font-medium truncate">
                        {CATEGORY_EMOJIS[expense.category]} {expense.category}
                      </p>
                    </div>
                    <p className="font-semibold text-sm sm:text-base flex-shrink-0">
                      {getSymbol()}{convertAmount(parseFloat(expense.amount.toString())).toFixed(2)}
                    </p>
                  </div>

                  {/* Second row: Date and Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation(`/edit-expense/${expense.id}`)}
                        className="h-7 w-7 sm:h-8 sm:w-8"
                      >
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(expense.id)}
                        className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Notes - if present */}
                  {expense.notes && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 ml-4">
                      {expense.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No expenses found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId !== null) {
                  deleteMutation.mutate({ id: deleteId });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
