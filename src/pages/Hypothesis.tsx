import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Home, RefreshCw, CheckCircle2, Edit2 } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type Mode = "guided" | "expert";

interface Hypothesis {
  id: number;
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
  const product = location.state?.product || "Your product";

  const [hypotheses] = useState<Hypothesis[]>([
    {
      id: 1,
      statement: "Gen Z consumers perceive herbal drinks as healthier than synthetic energy drinks",
      method: "Quick opinion check",
      methodTechnical: "Cross-sectional Survey",
      decisionRule: "If >65% agree, proceed with health messaging strategy",
      confidence: 92,
    },
    {
      id: 2,
      statement: "Natural ingredients increase willingness to pay premium prices among target audience",
      method: "Price preference test",
      methodTechnical: "Conjoint Analysis",
      decisionRule: "If premium segment >40%, launch at higher price point",
      confidence: 88,
    },
    {
      id: 3,
      statement: "Social media endorsements drive brand credibility for health products in this category",
      method: "Group reactions",
      methodTechnical: "Focus Group Discussion",
      decisionRule: "If >70% respond positively to influencer concepts, allocate budget to partnerships",
      confidence: 85,
    },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);

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
              <CardDescription className="text-base">{product}</CardDescription>
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
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Hypotheses Cards */}
          <div className="space-y-6">
            {hypotheses.map((hypothesis) => (
              <Card
                key={hypothesis.id}
                className="shadow-soft hover:shadow-medium transition-all duration-300 border-l-4 border-l-primary"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Hypothesis {hypothesis.id}</Badge>
                        <Badge
                          variant="outline"
                          className="border-accent/50 text-accent"
                        >
                          {hypothesis.confidence}% Confidence
                        </Badge>
                      </div>
                      {editingId === hypothesis.id ? (
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
                        setEditingId(editingId === hypothesis.id ? null : hypothesis.id)
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

          {/* Action Buttons */}
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
              onClick={() => navigate("/research-plan")}
            >
              Continue to Research Plan
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hypothesis;
