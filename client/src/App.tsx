import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { CurrencyProvider, useCurrency } from "./contexts/CurrencyContext";
import { Button } from "./components/ui/button";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import EditExpense from "./pages/EditExpense";
import Expenses from "./pages/Expenses";
import Categories from "./pages/Categories";
import Insights from "./pages/Insights";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={() => (
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      )} />
      <Route path={"/add-expense"} component={() => (
        <DashboardLayout>
          <AddExpense />
        </DashboardLayout>
      )} />
      <Route path={"/edit-expense/:id"} component={() => (
        <DashboardLayout>
          <EditExpense />
        </DashboardLayout>
      )} />
      <Route path={"/expenses"} component={() => (
        <DashboardLayout>
          <Expenses />
        </DashboardLayout>
      )} />
      <Route path={"/categories"} component={() => (
        <DashboardLayout>
          <Categories />
        </DashboardLayout>
      )} />
      <Route path={"/insights"} component={() => (
        <DashboardLayout>
          <Insights />
        </DashboardLayout>
      )} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Header component that uses both theme and currency hooks
// Header component moved to DashboardLayout for proper integration

function App() {
  return (
    <ErrorBoundary>
      <CurrencyProvider>
        <ThemeProvider defaultTheme="light" switchable>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </CurrencyProvider>
    </ErrorBoundary>
  );
}

export default App;
