import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Sparkles, Brain, Network, TrendingUp, Users } from "lucide-react";

const Analysis = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Deep Analysis</h1>
              <p className="text-sm text-muted-foreground">Advanced analytics & segmentation</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Brain className="h-4 w-4" />
            Deep Learning AI
          </Badge>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-2xl">AI-Powered Deep Analysis</CardTitle>
              <CardDescription className="text-base">
                Advanced statistical analysis, clustering, and predictive modeling
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="clustering" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="clustering">Clustering</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="correlation">Correlation</TabsTrigger>
              <TabsTrigger value="prediction">Prediction</TabsTrigger>
            </TabsList>

            <TabsContent value="clustering" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-primary" />
                    AI Customer Clustering
                  </CardTitle>
                  <CardDescription>Unsupervised learning identifies natural customer groups</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border-2 border-primary rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Cluster 1: Innovators</h4>
                        <Badge>32%</Badge>
                      </div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• High tech adoption</li>
                        <li>• Price insensitive</li>
                        <li>• Early adopters</li>
                        <li>• Social media active</li>
                      </ul>
                      <p className="text-xs text-primary mt-3 font-medium">Best fit for premium tier</p>
                    </div>
                    <div className="p-4 border-2 border-secondary rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Cluster 2: Pragmatists</h4>
                        <Badge variant="secondary">45%</Badge>
                      </div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Value focused</li>
                        <li>• Research-driven</li>
                        <li>• ROI conscious</li>
                        <li>• Peer influenced</li>
                      </ul>
                      <p className="text-xs text-secondary mt-3 font-medium">Target with case studies</p>
                    </div>
                    <div className="p-4 border-2 border-accent rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Cluster 3: Traditionalists</h4>
                        <Badge variant="outline">23%</Badge>
                      </div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Risk averse</li>
                        <li>• Brand loyal</li>
                        <li>• Slow adopters</li>
                        <li>• Support focused</li>
                      </ul>
                      <p className="text-xs text-accent mt-3 font-medium">Emphasize reliability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Sentiment Analysis
                  </CardTitle>
                  <CardDescription>Natural language processing of open-ended responses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Positive Themes</h4>
                      <ul className="text-sm space-y-1">
                        <li>✓ "Innovative solution" (mentioned 127 times)</li>
                        <li>✓ "Easy to use" (mentioned 98 times)</li>
                        <li>✓ "Great value" (mentioned 89 times)</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Concerns</h4>
                      <ul className="text-sm space-y-1">
                        <li>⚠ "Learning curve" (mentioned 45 times)</li>
                        <li>⚠ "Missing features" (mentioned 32 times)</li>
                        <li>⚠ "Price point" (mentioned 28 times)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                    <p className="font-medium mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI Recommendation:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Address "learning curve" concerns with better onboarding. Consider interactive tutorials or video guides.
                      Positive sentiment around innovation and ease of use should be emphasized in marketing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="correlation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    AI Correlation Analysis
                  </CardTitle>
                  <CardDescription>Identifies which factors drive purchase intent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Ease of Use → Purchase Intent</p>
                      <Badge>r = 0.84</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Strong positive correlation - prioritize UX in marketing</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Price Sensitivity → Feature Requests</p>
                      <Badge variant="secondary">r = 0.67</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Moderate correlation - value-focused users want more features</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Brand Awareness → NPS Score</p>
                      <Badge variant="outline">r = 0.43</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Moderate correlation - brand building impacts satisfaction</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prediction" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Predictive Models
                  </CardTitle>
                  <CardDescription>Machine learning predicts conversion probability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                      <h4 className="font-semibold mb-2">Conversion Prediction Model</h4>
                      <div className="grid md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Model Accuracy</p>
                          <p className="text-2xl font-bold text-primary">87.3%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Top Predictive Factor</p>
                          <p className="text-lg font-semibold">Prior product usage</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h4 className="font-medium mb-3">Predicted Conversion by Segment</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Innovators</span>
                          <span className="font-semibold text-green-600">72% likely to convert</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Pragmatists</span>
                          <span className="font-semibold">48% likely to convert</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Traditionalists</span>
                          <span className="font-semibold text-orange-600">21% likely to convert</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/data-insights")}>
              Back to Data Collection
            </Button>
            <Button className="flex-1" onClick={() => navigate("/report")}>
              Generate Executive Report
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
