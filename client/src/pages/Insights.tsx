import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CATEGORY_EMOJIS } from "@shared/const";

const formatCurrency = (amount: number, symbol: string) => `${symbol}${amount.toFixed(2)}`;

export default function Insights() {
  const [activeTab, setActiveTab] = useState("weekly");
  const { getSymbol, convertAmount } = useCurrency();
  const utils = trpc.useUtils();

  const { data: insights, isLoading: insightsLoading } =
    trpc.insights.getPersonalizedInsights.useQuery({
      period: activeTab as "weekly" | "monthly" | "quarterly",
    });

  const { data: summaries, isLoading: summariesLoading } =
    trpc.insights.getSummaries.useQuery();

  const generateWeeklyMutation = trpc.insights.generateWeeklySummary.useMutation({
    onSuccess: () => {
      toast.success("Weekly summary generated!");
      utils.insights.getSummaries.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate summary");
    },
  });

  const generateMonthlySummary = trpc.insights.generateMonthlySummary.useMutation({
    onSuccess: () => {
      toast.success("Monthly summary generated!");
      utils.insights.getSummaries.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate summary");
    },
  });

  const generateQuarterlySummary = trpc.insights.generateQuarterlySummary.useMutation({
    onSuccess: () => {
      toast.success("Quarterly summary generated!");
      utils.insights.getSummaries.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate summary");
    },
  });

  const handleGenerateSummary = () => {
    if (activeTab === "weekly") {
      generateWeeklyMutation.mutate({});
    } else if (activeTab === "monthly") {
      generateMonthlySummary.mutate({});
    } else {
      generateQuarterlySummary.mutate({});
    }
  };

  const isGenerating =
    generateWeeklyMutation.isPending ||
    generateMonthlySummary.isPending ||
    generateQuarterlySummary.isPending;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights & Summaries</h1>
          <p className="text-muted-foreground mt-1">AI-powered spending analysis</p>
        </div>
        <Button
          onClick={handleGenerateSummary}
          disabled={isGenerating}
          size="sm"
          className="gap-2 whitespace-nowrap w-full sm:w-auto"
        >
          {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Generate Summary</span>
          <span className="sm:hidden">Generate</span>
        </Button>
      </div>

      {/* Personalized Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Personalized Insights
          </CardTitle>
          <CardDescription>AI-generated analysis of your spending patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            </TabsList>

            {["weekly", "monthly", "quarterly"].map((period) => (
              <TabsContent key={period} value={period} className="space-y-4 mt-4">
                {insightsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : insights ? (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Summary
                      </p>
                      <p className="text-blue-800 dark:text-blue-200">{insights.summary}</p>
                    </div>

                    {/* Trends */}
                    {insights.trends && insights.trends.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          Trends
                        </h4>
                        <div className="space-y-2">
                          {insights.trends.map((trend, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-200"
                            >
                              {trend}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {insights.recommendations && insights.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          Recommendations
                        </h4>
                        <div className="space-y-2">
                          {insights.recommendations.map((rec, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200"
                            >
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Areas */}
                    {insights.riskAreas && insights.riskAreas.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          Areas of Concern
                        </h4>
                        <div className="space-y-2">
                          {insights.riskAreas.map((risk, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200"
                            >
                              {risk}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No insights available yet. Add some expenses to get started!</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Generated Summaries History */}
      <Card>
        <CardHeader>
          <CardTitle>Summary History</CardTitle>
          <CardDescription>Previously generated summaries</CardDescription>
        </CardHeader>
        <CardContent>
          {summariesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : summaries && summaries.length > 0 ? (
            <div className="space-y-4">
              {summaries.map((summary) => (
                <div
                  key={summary.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge className="capitalize mb-2">{summary.period}</Badge>
                      <p className="text-sm text-muted-foreground">
                        {new Date(summary.startDate).toLocaleDateString()} —{" "}
                        {new Date(summary.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-semibold text-lg">
                      {formatCurrency(convertAmount(parseFloat(summary.totalSpent.toString())), getSymbol())}
                    </p>
                  </div>
                  <div className="mt-3 text-sm">
                    <Streamdown>{summary.content}</Streamdown>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No summaries generated yet. Click "Generate Summary" to create one!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
