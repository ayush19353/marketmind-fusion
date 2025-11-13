import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Home, RefreshCw, CheckCircle2, Edit2 } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Mode = "guided" | "expert";

interface Hypothesis {
  id?: string;
  statement: string;
  method: string;
  methodTechnical: string;
  decisionRule: string;
  confidence: number;
}

const Hypothesis = () => {
  const [mode, setMode] = useState<Mode>("guided");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const projectId = location.state?.projectId;
  const productName = location.state?.productName || "Your product";
  const productDescription = location.state?.productDescription || "";

  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project found. Please start from product input.",
        variant: "destructive",
      });
      navigate("/product-input");
      return;
    }

    generateHypotheses();
  }, [projectId]);

  const generateHypotheses = async () => {
    try {
      setIsLoading(true);

      // Call generate-hypotheses edge function
      const { data, error } = await supabase.functions.invoke(
        'generate-hypotheses',
        {
          body: {
            productName,
            productDescription,
            mode
          }
        }
      );

      if (error) throw error;

      console.log('Generated hypotheses:', data);

      const generatedHypotheses = data.hypotheses || [];

      // Save hypotheses to database
      const hypothesesToInsert = generatedHypotheses.map((h: any, index: number) => ({
        project_id: projectId,
        statement: h.statement,
        method: h.method,
        method_technical: h.methodTechnical,
        decision_rule: h.decisionRule,
        confidence: h.confidence,
        order_index: index
      }));

      const { data: savedHypotheses, error: saveError } = await supabase
        .from('hypotheses')
        .insert(hypothesesToInsert)
        .select();

      if (saveError) throw saveError;

      setHypotheses(savedHypotheses.map(h => ({
        id: h.id,
        statement: h.statement,
        method: h.method,
        methodTechnical: h.method_technical,
        decisionRule: h.decision_rule,
        confidence: h.confidence
      })));

      toast({
        title: "Hypotheses generated!",
        description: "AI has created testable hypotheses for your research.",
      });

    } catch (error: any) {
      console.error('Error generating hypotheses:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate hypotheses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    
    try {
      // Delete existing hypotheses
      const { error: deleteError } = await supabase
        .from('hypotheses')
        .delete()
        .eq('project_id', projectId);

      if (deleteError) throw deleteError;

      // Generate new ones
      await generateHypotheses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate hypotheses.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleContinue = () => {
    navigate("/research-plan", {
      state: {
        projectId,
        productName,
        productDescription,
        hypotheses,
        mode
      }
    });
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
              <h1 className="text-xl font-bold text-foreground">Step 2: Hypothesis Generation</h1>
              <p className="text-sm text-muted-foreground">AI-generated testable hypotheses</p>
            </div>
          </div>
          <ModeToggle mode={mode} onModeChange={setMode} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Product Context */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="text-lg">Product Context</CardTitle>
              <CardDescription className="text-base">{productName}</CardDescription>
            </CardHeader>
          </Card>

          {/* AI Recommendation */}
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    AI Generated Hypotheses
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {mode === "guided"
                      ? "These hypotheses will guide your research and help you make data-driven decisions"
                      : "Testable hypotheses with recommended methodologies and decision criteria"}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRegenerate}
                  disabled={isRegenerating || isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                  Regenerate
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
                  <p className="text-muted-foreground">AI is generating hypotheses...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hypotheses Cards */}
          {!isLoading && (
            <div className="space-y-6">
              {hypotheses.map((hypothesis, index) => (
                <Card
                  key={hypothesis.id || index}
                  className="shadow-soft hover:shadow-medium transition-all duration-300 border-l-4 border-l-primary"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Hypothesis {index + 1}</Badge>
                          <Badge
                            variant="outline"
                            className="border-accent/50 text-accent"
                          >
                            {hypothesis.confidence}% Confidence
                          </Badge>
                        </div>
                        {editingId === index ? (
                          <Textarea
                            defaultValue={hypothesis.statement}
                            className="min-h-[80px]"
                          />
                        ) : (
                          <CardTitle className="text-lg leading-relaxed">
                            {hypothesis.statement}
                          </CardTitle>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setEditingId(editingId === index ? null : index)
                        }
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {mode === "guided" ? "How to Test" : "Methodology"}
                        </p>
                        <p className="text-base font-medium text-foreground">
                          {mode === "guided"
                            ? hypothesis.method
                            : hypothesis.methodTechnical}
                        </p>
                        {mode === "expert" && (
                          <p className="text-sm text-muted-foreground">
                            ({hypothesis.method})
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Decision Rule
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {hypothesis.decisionRule}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {!isLoading && hypotheses.length > 0 && (
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/product-input")}
              >
                Back to Product Input
              </Button>
              <Button
                variant="hero"
                size="lg"
                className="flex-1 group"
                onClick={handleContinue}
              >
                Continue to Research Plan
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Hypothesis;
