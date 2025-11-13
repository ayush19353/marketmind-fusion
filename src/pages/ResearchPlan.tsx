import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Home, Download, Users, Calendar, DollarSign, Target, TrendingUp, Sparkles } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Mode = "guided" | "expert";

const ResearchPlan = () => {
  const [mode, setMode] = useState<Mode>("guided");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const projectId = location.state?.projectId;
  const [productName, setProductName] = useState<string>(location.state?.productName || "Your product");
  const [productDescription, setProductDescription] = useState<string>(location.state?.productDescription || "");
  const [hypotheses, setHypotheses] = useState<any[]>(location.state?.hypotheses || []);

  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useEffect(() => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Missing project data. Please start from the dashboard.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    let cancelled = false;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setIsGeneratingPlan(false);

        let resolvedProductName = location.state?.productName || productName;
        let resolvedProductDescription = location.state?.productDescription || productDescription;

        if (!resolvedProductDescription || resolvedProductName === "Your product") {
          const { data: projectDetails, error: projectError } = await supabase
            .from('research_projects')
            .select('product_name, product_description, mode')
            .eq('id', projectId)
            .single();

          if (projectError && projectError.code !== 'PGRST116') {
            throw projectError;
          }

          if (projectDetails) {
            resolvedProductName = projectDetails.product_name || resolvedProductName;
            resolvedProductDescription = projectDetails.product_description || resolvedProductDescription;

            if (!cancelled) {
              setProductName(resolvedProductName || "Your product");
              setProductDescription(resolvedProductDescription || "");
              if (projectDetails.mode) {
                setMode((currentMode) => {
                  const nextMode = projectDetails.mode as Mode | null;
                  if (!nextMode) return currentMode;
                  return nextMode === currentMode ? currentMode : nextMode;
                });
              }
            }
          }
        }

        let resolvedHypotheses = location.state?.hypotheses || hypotheses;

        if (!resolvedHypotheses.length) {
          const { data: hypothesisRows, error: hypothesisError } = await supabase
            .from('hypotheses')
            .select('statement, method, method_technical, decision_rule, confidence')
            .eq('project_id', projectId)
            .order('order_index');

          if (hypothesisError) {
            throw hypothesisError;
          }

          resolvedHypotheses = (hypothesisRows || []).map((row) => ({
            statement: row.statement,
            method: row.method,
            methodTechnical: row.method_technical,
            decisionRule: row.decision_rule,
            confidence: row.confidence,
          }));
        }

        if (!resolvedHypotheses.length) {
          toast({
            title: "Missing hypotheses",
            description: "We couldn't find existing hypotheses for this project.",
            variant: "destructive",
          });

          setIsLoading(false);
          navigate("/hypothesis", {
            state: {
              projectId,
              productName: resolvedProductName,
              productDescription: resolvedProductDescription,
              mode,
            },
          });
          return;
        }

        if (!cancelled) {
          setHypotheses(resolvedHypotheses);
          setProductName(resolvedProductName || "Your product");
          setProductDescription(resolvedProductDescription || "");
        }

        if (!resolvedProductDescription) {
          toast({
            title: "Missing product details",
            description: "We need the product description to build the research plan.",
            variant: "destructive",
          });
          setIsLoading(false);
          navigate("/product-input");
          return;
        }

        const { data: existingPlan, error: planError } = await supabase
          .from('research_plans')
          .select('target_audience, sample, methodology, timeline, budget')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (planError) {
          throw planError;
        }

        if (existingPlan) {
          if (!cancelled) {
            setPlan({
              targetAudience: existingPlan.target_audience,
              sample: existingPlan.sample,
              methodology: existingPlan.methodology,
              timeline: existingPlan.timeline,
              budget: existingPlan.budget,
            });
            setIsLoading(false);
            setIsGeneratingPlan(false);
          }
          return;
        }

        await generateResearchPlan({
          activeHypotheses: resolvedHypotheses,
          productName: resolvedProductName,
          productDescription: resolvedProductDescription,
        });
      } catch (error: any) {
        console.error('Error initializing research plan:', error);
        if (!cancelled) {
          toast({
            title: "Error",
            description: error.message || "Failed to load research plan. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const generateResearchPlan = async ({
    activeHypotheses,
    productName,
    productDescription,
  }: {
    activeHypotheses: any[];
    productName: string;
    productDescription: string;
  }) => {
    try {
      setIsGeneratingPlan(true);
      setIsLoading(true);

      // Call generate-research-plan edge function
      const { data, error } = await supabase.functions.invoke(
        'generate-research-plan',
        {
          body: {
            productName,
            productDescription,
            hypotheses: activeHypotheses,
            mode
          }
        }
      );

      if (error) throw error;

      console.log('Generated plan:', data);

      const generatedPlan = data.plan;

      // Save plan to database
      const { data: savedPlan, error: saveError } = await supabase
        .from('research_plans')
        .insert({
          project_id: projectId,
          target_audience: generatedPlan.targetAudience || {},
          sample: generatedPlan.sample || {},
          methodology: generatedPlan.methodology || {},
          timeline: generatedPlan.timeline || {},
          budget: generatedPlan.budget || {}
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setPlan(generatedPlan);

      // Update project status
      await supabase
        .from('research_projects')
        .update({ status: 'completed' })
        .eq('id', projectId);

      toast({
        title: "Research plan complete!",
        description: "AI has created your comprehensive research strategy.",
      });

    } catch (error: any) {
      console.error('Error generating plan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate research plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPlan(false);
      setIsLoading(false);
    }
  };

  const planData = plan || {
    targetAudience: {
      title: "Target Audience",
      demographics: "Loading...",
      psychographics: "Loading...",
      size: "Loading...",
    },
    sample: {
      size: 385,
      type: "Stratified random sampling",
      typePlain: "Smart mix of representative groups",
      confidence: 95,
      margin: 5,
    },
    methodology: {
      primary: "Mixed-methods approach",
      techniques: [],
    },
    timeline: {
      total: "3-4 weeks",
      phases: [],
    },
    budget: {
      estimated: "$3,500 - $5,000",
      breakdown: [],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Step 3: Research Plan</h1>
              <p className="text-sm text-muted-foreground">Complete research blueprint</p>
            </div>
          </div>
          <ModeToggle mode={mode} onModeChange={setMode} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* AI Summary */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-medium">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">AI-Generated Research Plan</CardTitle>
                  <CardDescription className="text-base">
                    {mode === "guided"
                      ? "Your complete research roadmap — ready to execute"
                      : "Comprehensive methodology with statistical parameters and sampling strategy"}
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Plan
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    {isGeneratingPlan
                      ? "AI is generating your research plan..."
                      : "Loading your saved research plan..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plan Content */}
          {!isLoading && plan && (
            <>
              {/* Target Audience */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {planData.targetAudience.title || "Target Audience"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {mode === "guided" ? "Who We'll Talk To" : "Demographics"}
                      </p>
                      <p className="text-base text-foreground">{planData.targetAudience.demographics}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {mode === "guided" ? "What They Care About" : "Psychographics"}
                      </p>
                      <p className="text-base text-foreground">{planData.targetAudience.psychographics}</p>
                    </div>
                  </div>
                  {planData.targetAudience.size && (
                    <div className="pt-2">
                      <Badge variant="secondary" className="text-base px-4 py-2">
                        <Users className="h-4 w-4 mr-2" />
                        {planData.targetAudience.size} market size
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

          {/* Sample Size */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                {mode === "guided" ? "How Many Responses" : "Sample Design"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Sample Size</p>
                  <p className="text-3xl font-bold text-foreground">{planData.sample.size}</p>
                  <p className="text-sm text-muted-foreground">participants needed</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Confidence Level</p>
                  <p className="text-3xl font-bold text-primary">{planData.sample.confidence}%</p>
                  <Progress value={planData.sample.confidence} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Margin of Error</p>
                  <p className="text-3xl font-bold text-secondary">±{planData.sample.margin}%</p>
                  <p className="text-sm text-muted-foreground">accuracy range</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">Sampling Method</p>
                <p className="text-base text-foreground">
                  {mode === "guided" ? planData.sample.typePlain : planData.sample.type}
                </p>
              </div>
            </CardContent>
          </Card>

              {/* Methodology */}
              {planData.methodology?.techniques && planData.methodology.techniques.length > 0 && (
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>
                      {mode === "guided" ? "How We'll Collect Information" : "Research Methodology"}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {planData.methodology.primary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {planData.methodology.techniques.map((technique: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {mode === "guided" ? technique.plain : technique.name}
                          </p>
                          {mode === "expert" && technique.plain && (
                            <p className="text-sm text-muted-foreground">({technique.plain})</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-base px-4 py-2">
                          {technique.responses
                            ? `${technique.responses} responses`
                            : technique.sessions
                            ? `${technique.sessions} sessions`
                            : `${technique.interviews} interviews`}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              {planData.timeline?.phases && planData.timeline.phases.length > 0 && (
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-secondary" />
                      Timeline
                    </CardTitle>
                    <CardDescription className="text-base">
                      Estimated duration: {planData.timeline.total}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {planData.timeline.phases.map((phase: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <p className="font-medium text-foreground">{phase.phase}</p>
                        </div>
                        <Badge variant="secondary">{phase.duration}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Budget */}
              {planData.budget?.breakdown && planData.budget.breakdown.length > 0 && (
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-accent" />
                      Estimated Budget
                    </CardTitle>
                    <CardDescription className="text-base">
                      Total: {planData.budget.estimated}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {planData.budget.breakdown.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                      >
                        <p className="text-foreground">{item.item}</p>
                        <p className="font-medium text-foreground">{item.cost}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Action Buttons */}
          {!isLoading && plan && (
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/hypothesis", { state: { projectId } })}
              >
                Back to Hypotheses
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => navigate("/marketing-studio", { 
                  state: { 
                    projectId,
                    productName,
                    productDescription
                  }
                })}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Open AI Marketing Studio
              </Button>
              <Button
                variant="hero"
                size="lg"
                className="flex-1 group"
                onClick={() => navigate("/dashboard")}
              >
                Complete & Return to Dashboard
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResearchPlan;
