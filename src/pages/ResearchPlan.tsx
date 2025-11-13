import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Home, Download, Users, Calendar, DollarSign, Target, TrendingUp } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Mode = "guided" | "expert";

const ResearchPlan = () => {
  const [mode, setMode] = useState<Mode>("guided");
  const navigate = useNavigate();

  const planData = {
    targetAudience: {
      title: "Target Audience",
      demographics: "Ages 18-30, Urban areas, Health-conscious consumers",
      psychographics: "Value wellness, sustainability, and authenticity",
      size: "2,000,000+ potential consumers",
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
      techniques: [
        { name: "Online Survey", plain: "Quick opinion check", responses: 300 },
        { name: "Focus Groups", plain: "Group reactions", sessions: 4 },
        { name: "In-depth Interviews", plain: "Deep interviews", interviews: 15 },
      ],
    },
    timeline: {
      total: "3-4 weeks",
      phases: [
        { phase: "Setup & Recruitment", duration: "3-5 days" },
        { phase: "Data Collection", duration: "10-14 days" },
        { phase: "Analysis", duration: "5-7 days" },
        { phase: "Report Generation", duration: "2-3 days" },
      ],
    },
    budget: {
      estimated: "$3,500 - $5,000",
      breakdown: [
        { item: "Participant Incentives", cost: "$1,200 - $1,800" },
        { item: "Platform & Tools", cost: "$800 - $1,200" },
        { item: "Data Collection", cost: "$1,000 - $1,500" },
        { item: "Analysis & Reporting", cost: "$500 - $500" },
      ],
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

          {/* Target Audience */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {planData.targetAudience.title}
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
              <div className="pt-2">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  <Users className="h-4 w-4 mr-2" />
                  {planData.targetAudience.size} market size
                </Badge>
              </div>
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
              {planData.methodology.techniques.map((technique, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {mode === "guided" ? technique.plain : technique.name}
                    </p>
                    {mode === "expert" && (
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

          {/* Timeline */}
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
              {planData.timeline.phases.map((phase, index) => (
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

          {/* Budget */}
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
              {planData.budget.breakdown.map((item, index) => (
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

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/hypothesis")}
            >
              Back to Hypotheses
            </Button>
            <Button
              variant="hero"
              size="lg"
              className="flex-1 group"
              onClick={() => navigate("/dashboard")}
            >
              Approve & Continue
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResearchPlan;
