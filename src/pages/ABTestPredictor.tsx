import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, Target } from "lucide-react";

const ABTestPredictor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const projectId = location.state?.projectId || localStorage.getItem('currentProjectId');
  const productName = location.state?.productName || localStorage.getItem('productName');

  const [testName, setTestName] = useState("");
  const [variantAHeadline, setVariantAHeadline] = useState("");
  const [variantABody, setVariantABody] = useState("");
  const [variantACTA, setVariantACTA] = useState("");
  const [variantBHeadline, setVariantBHeadline] = useState("");
  const [variantBBody, setVariantBBody] = useState("");
  const [variantBCTA, setVariantBCTA] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [historicalData, setHistoricalData] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const handlePredict = async () => {
    if (!testName || !variantAHeadline || !variantBHeadline || !targetAudience) {
      toast({
        title: "Missing Information",
        description: "Please fill in test name, both variant headlines, and target audience.",
        variant: "destructive",
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "No Project Selected",
        description: "Please start from a project to use this feature.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    setIsPredicting(true);
    setPrediction(null);

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('predict-ab-test', {
        body: {
          testName,
          variantA: {
            headline: variantAHeadline,
            body: variantABody,
            cta: variantACTA,
          },
          variantB: {
            headline: variantBHeadline,
            body: variantBBody,
            cta: variantBCTA,
          },
          targetAudience,
          historicalData,
        }
      });

      if (functionError) throw functionError;

      const predictionData = functionData.prediction;
      setPrediction(predictionData);

      // Save to database
      const { error: dbError } = await supabase.from('ab_test_predictions').insert({
        project_id: projectId,
        test_name: testName,
        variant_a: {
          headline: variantAHeadline,
          body: variantABody,
          cta: variantACTA,
        },
        variant_b: {
          headline: variantBHeadline,
          body: variantBBody,
          cta: variantBCTA,
        },
        predicted_winner: predictionData.predicted_winner,
        confidence_score: predictionData.confidence_score,
        predicted_metrics: predictionData.predicted_metrics,
        recommendations: predictionData.recommendations,
      });

      if (dbError) throw dbError;

      toast({
        title: "Prediction Complete",
        description: "AI has analyzed your A/B test variants.",
      });

    } catch (error) {
      console.error('Error predicting A/B test:', error);
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "Failed to generate prediction",
        variant: "destructive",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">A/B Test Predictor</h1>
                {productName && <p className="text-sm text-muted-foreground">{productName}</p>}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predict Campaign Performance</CardTitle>
              <CardDescription>
                Use AI to predict which variant will perform better before running your test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="testName">Test Name</Label>
                <Input
                  id="testName"
                  placeholder="e.g., Homepage Hero A/B Test"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">A</span>
                    Variant A
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="variantAHeadline">Headline *</Label>
                    <Input
                      id="variantAHeadline"
                      placeholder="Enter headline for variant A"
                      value={variantAHeadline}
                      onChange={(e) => setVariantAHeadline(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variantABody">Body Text</Label>
                    <Textarea
                      id="variantABody"
                      placeholder="Enter body text for variant A"
                      value={variantABody}
                      onChange={(e) => setVariantABody(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variantACTA">Call to Action</Label>
                    <Input
                      id="variantACTA"
                      placeholder="e.g., Get Started"
                      value={variantACTA}
                      onChange={(e) => setVariantACTA(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">B</span>
                    Variant B
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="variantBHeadline">Headline *</Label>
                    <Input
                      id="variantBHeadline"
                      placeholder="Enter headline for variant B"
                      value={variantBHeadline}
                      onChange={(e) => setVariantBHeadline(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variantBBody">Body Text</Label>
                    <Textarea
                      id="variantBBody"
                      placeholder="Enter body text for variant B"
                      value={variantBBody}
                      onChange={(e) => setVariantBBody(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variantBCTA">Call to Action</Label>
                    <Input
                      id="variantBCTA"
                      placeholder="e.g., Start Free Trial"
                      value={variantBCTA}
                      onChange={(e) => setVariantBCTA(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience *</Label>
                <Textarea
                  id="targetAudience"
                  placeholder="Describe your target audience (demographics, pain points, behavior)"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="historicalData">Historical Performance Data (Optional)</Label>
                <Textarea
                  id="historicalData"
                  placeholder="Enter any historical A/B test results or performance metrics (e.g., 'Previous tests showed that emotional appeals performed 15% better')"
                  value={historicalData}
                  onChange={(e) => setHistoricalData(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handlePredict} 
                disabled={isPredicting}
                className="w-full"
                size="lg"
              >
                {isPredicting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Variants...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Predict Winner
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {prediction && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {prediction.predicted_winner === 'A' ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-blue-500" />
                  )}
                  Prediction Results
                </CardTitle>
                <CardDescription>
                  AI-powered performance prediction based on marketing best practices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/10 rounded-lg p-6 text-center">
                  <div className="text-6xl font-bold mb-2">
                    {prediction.predicted_winner}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    Predicted Winner
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-semibold">
                      {prediction.confidence_score}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Confidence Score
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Variant A Estimates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CTR:</span>
                        <span className="font-semibold">{prediction.predicted_metrics.variant_a.ctr_estimate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conversion:</span>
                        <span className="font-semibold">{prediction.predicted_metrics.variant_a.conversion_estimate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Engagement:</span>
                        <span className="font-semibold">{prediction.predicted_metrics.variant_a.engagement_score}/10</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Variant B Estimates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CTR:</span>
                        <span className="font-semibold">{prediction.predicted_metrics.variant_b.ctr_estimate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conversion:</span>
                        <span className="font-semibold">{prediction.predicted_metrics.variant_b.conversion_estimate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Engagement:</span>
                        <span className="font-semibold">{prediction.predicted_metrics.variant_b.engagement_score}/10</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {prediction.key_factors && prediction.key_factors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Key Success Factors</h4>
                    <ul className="space-y-2">
                      {prediction.key_factors.map((factor: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-3">Recommendations</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {prediction.recommendations}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => {
                      setPrediction(null);
                      setTestName("");
                      setVariantAHeadline("");
                      setVariantABody("");
                      setVariantACTA("");
                      setVariantBHeadline("");
                      setVariantBBody("");
                      setVariantBCTA("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Test Another Variant
                  </Button>
                  <Button 
                    onClick={() => navigate('/marketing-studio', { state: { projectId, productName } })}
                    className="flex-1"
                  >
                    Go to Marketing Studio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ABTestPredictor;
