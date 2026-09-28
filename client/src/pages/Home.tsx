import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { ArrowRight, BarChart3, Sparkles, TrendingUp, Wallet, Zap } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">SmartExpense</span>
          </div>
          <Button onClick={() => (window.location.href = getLoginUrl())} size="lg">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Smart Expense Tracking
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track your spending, get personalized insights, and make smarter financial decisions with AI-powered analysis.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              size="lg"
              className="gap-2 h-12 px-8"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">Everything you need to manage your finances</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Easy Tracking</CardTitle>
                <CardDescription>Record expenses in seconds with our intuitive interface</CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Visual Analytics</CardTitle>
                <CardDescription>Beautiful charts and graphs to visualize your spending</CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Get personalized recommendations powered by AI</CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Smart Summaries</CardTitle>
                <CardDescription>Weekly, monthly, and quarterly AI-generated summaries</CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle>Real-time Tracking</CardTitle>
                <CardDescription>Instant updates and notifications for all transactions</CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle>Budget Management</CardTitle>
                <CardDescription>Organize expenses by category and track budgets</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to take control of your finances?</h2>
          <p className="text-lg mb-8 opacity-90">
            Start tracking your expenses and get AI-powered insights today.
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            size="lg"
            variant="secondary"
            className="gap-2 h-12 px-8"
          >
            Sign Up Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 SmartExpense AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
