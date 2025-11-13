import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Home, Lightbulb, Sparkles } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Mode = "guided" | "expert";

const ProductInput = () => {
  const [mode, setMode] = useState<Mode>("guided");
  const [product, setProduct] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!product.trim()) {
      toast({
        title: "Product description required",
        description: "Please enter your product or concept idea.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Call analyze-product edge function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-product',
        { body: { productDescription: product } }
      );

      if (analysisError) throw analysisError;

      console.log('Analysis result:', analysisData);

      // Extract product name from analysis or use first part of description
      const productName = analysisData.analysis?.suggestedName || 
        product.split(/[.!?]/)[0].substring(0, 100) || 
        "Research Project";

      // Save project to database
      const { data: projectData, error: projectError } = await supabase
        .from('research_projects')
        .insert({
          user_id: user.id,
          product_name: productName,
          product_description: product,
          mode: mode,
          status: 'in_progress'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      toast({
        title: "Analysis complete!",
        description: "AI has analyzed your product. Generating hypotheses...",
      });

      // Navigate to hypothesis generation with project data
      navigate("/hypothesis", { 
        state: { 
          projectId: projectData.id,
          productName: productName,
          productDescription: product,
          mode: mode 
        } 
      });

    } catch (error: any) {
      console.error('Error analyzing product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
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
              <h1 className="text-xl font-bold text-foreground">Step 1: Product Input</h1>
              <p className="text-sm text-muted-foreground">Tell us about your product or concept</p>
            </div>
          </div>
          <ModeToggle mode={mode} onModeChange={setMode} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Instructions Card */}
          <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg">
                  {mode === "guided" ? "Let's Start Simple" : "Product Specification"}
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                {mode === "guided"
                  ? "Describe your product idea in plain language. The AI will understand the context and identify your market category automatically."
                  : "Provide detailed product specifications including target market, unique value proposition, and competitive positioning."}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Input Card */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {mode === "guided" ? "What's Your Product Idea?" : "Product Description"}
              </CardTitle>
              <CardDescription>
                {mode === "guided"
                  ? 'Example: "Herbal energy drink for Gen Z consumers who want natural ingredients"'
                  : "Include product category, target demographics, key features, and market positioning"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={
                  mode === "guided"
                    ? "Enter your product or concept idea here..."
                    : "Enter detailed product specification, target market analysis, and competitive landscape..."
                }
                className="min-h-[200px] text-base resize-none"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />

              {mode === "expert" && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-medium">AI will analyze:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Product category and market classification</li>
                    <li>Target audience demographics and psychographics</li>
                    <li>Current consumer trends and market context</li>
                    <li>Competitive positioning opportunities</li>
                  </ul>
                </div>
              )}

              <Button
                variant="hero"
                size="lg"
                className="w-full group"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    Analyze & Continue
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Example Cards */}
          {mode === "guided" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Need inspiration? Try these examples:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Eco-friendly meal kit subscription for busy professionals",
                  "AI-powered fitness app for seniors with health tracking",
                  "Premium handcrafted chocolate for gift occasions",
                  "Smart home security system for apartment dwellers",
                ].map((example, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-medium hover:border-primary/50 transition-all group"
                    onClick={() => setProduct(example)}
                  >
                    <CardContent className="pt-6">
                      <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {example}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductInput;
