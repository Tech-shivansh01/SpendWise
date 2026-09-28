import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { EXPENSE_CATEGORIES, CATEGORY_EMOJIS } from "@shared/const";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useParams } from "wouter";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

const expenseSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  category: z.enum(EXPENSE_CATEGORIES as any),
  date: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: "Invalid date",
  }),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function EditExpense() {
  const params = useParams();
  const expenseId = params.id ? parseInt(params.id, 10) : null;
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { getSymbol, convertToBaseAmount } = useCurrency();

  const utils = trpc.useUtils();
  const { data: expense, isLoading: expenseLoading } = trpc.expenses.getById.useQuery(
    { id: expenseId || 0 },
    { enabled: !!expenseId }
  );

  const updateMutation = trpc.expenses.update.useMutation({
    onSuccess: () => {
      toast.success("Expense updated successfully!");
      utils.expenses.list.invalidate();
      utils.expenses.getStats.invalidate();
      utils.insights.getSpendingInsights.invalidate();
      setLocation("/expenses");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update expense");
    },
  });

  const deleteMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      utils.expenses.list.invalidate();
      utils.expenses.getStats.invalidate();
      utils.insights.getSpendingInsights.invalidate();
      setLocation("/expenses");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete expense");
    },
  });

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: expense ? parseFloat(expense.amount.toString()).toFixed(2) : "",
      category: expense?.category || "Food",
      date: expense ? new Date(expense.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      notes: expense?.notes || "",
    },
  });

  if (expenseLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Expense not found</p>
          <Button onClick={() => setLocation("/expenses")} variant="outline">
            Back to Expenses
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = (data: ExpenseFormData) => {
    if (!expenseId) return;
    // Convert to base currency (USD) before storing
    const baseAmount = convertToBaseAmount(parseFloat(data.amount));
    updateMutation.mutate({
      id: expenseId,
      amount: baseAmount,
      category: data.category,
      date: new Date(data.date),
      notes: data.notes || undefined,
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/expenses")}
          className="h-10 w-10"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Expense</h1>
          <p className="text-muted-foreground mt-1">Update expense details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>Modify the expense information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {getSymbol()}
                          </span>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-7"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((category: string) => (
                            <SelectItem key={category} value={category}>
                              {CATEGORY_EMOJIS[category]} {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add any additional details..."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/expenses")}
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                  className="gap-2 ml-auto"
                >
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (expenseId) {
                  deleteMutation.mutate({ id: expenseId });
                }
              }}
              disabled={deleteMutation.isPending}
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
