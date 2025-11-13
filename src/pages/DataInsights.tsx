import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Sparkles, Users, TrendingUp, Target, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const DataInsights = () => {
  const navigate = useNavigate();

  const mockResponses = [
    { segment: "Early Adopters", count: 234, sentiment: "Positive", score: 85 },
    { segment: "Price Conscious", count: 156, sentiment: "Neutral", score: 62 },
    { segment: "Feature Seekers", count: 189, sentiment: "Positive", score: 78 },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Data Collection & Insights</h1>
              <p className="text-sm text-muted-foreground">Real-time response analysis</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI-Powered Analytics
          </Badge>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Live Data Collection Dashboard</CardTitle>
              <CardDescription className="text-base">
                AI analyzes responses in real-time and identifies patterns automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-3xl font-bold text-primary">579</div>
                  <p className="text-sm text-muted-foreground mt-1">Total Responses</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-3xl font-bold text-secondary">73%</div>
                  <p className="text-sm text-muted-foreground mt-1">Completion Rate</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-3xl font-bold text-accent">4.2</div>
                  <p className="text-sm text-muted-foreground mt-1">Avg. NPS Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  AI-Detected Segments
                </CardTitle>
                <CardDescription>Automatic audience clustering</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockResponses.map((segment, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{segment.segment}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={segment.sentiment === "Positive" ? "default" : "secondary"}>
                          {segment.sentiment}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{segment.count} responses</span>
                      </div>
                    </div>
                    <Progress value={segment.score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Key Insights
                </CardTitle>
                <CardDescription>AI-generated findings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border border-border rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Price sensitivity varies by segment</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Early adopters willing to pay 40% premium for advanced features
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Strong brand association detected</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        67% associate product with "innovation" and "reliability"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Mobile-first preference</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        82% of target audience prefers mobile app over desktop
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Actionable next steps based on data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <p className="font-medium">Increase sample size</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Target 200 more responses from "Feature Seekers" segment for statistical significance
                  </p>
                </div>
                <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <p className="font-medium">Refine targeting</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Early adopters show 3x higher conversion potential - prioritize this segment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/instruments")}>
              Back to Instruments
            </Button>
            <Button className="flex-1" onClick={() => navigate("/analysis")}>
              Continue to Deep Analysis
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataInsights;
