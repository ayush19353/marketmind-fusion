import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Home, ChevronRight, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Mode = "guided" | "expert";

const steps = [
  { id: "product", label: "Product Input", path: "/product-input" },
  { id: "hypothesis", label: "Hypotheses", path: "/hypothesis" },
  { id: "plan", label: "Research Plan", path: "/research-plan" },
  { id: "instruments", label: "Instruments", path: "#", disabled: true },
  { id: "collection", label: "Data Collection", path: "#", disabled: true },
  { id: "analysis", label: "Analysis", path: "#", disabled: true },
  { id: "report", label: "Report", path: "#", disabled: true },
  { id: "optimization", label: "Optimization Hub", path: "#", disabled: true },
];

const Dashboard = () => {
  const [mode, setMode] = useState<Mode>("guided");
  const [userEmail, setUserEmail] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Research Dashboard</h1>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle mode={mode} onModeChange={setMode} />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Section */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to Your Research Hub</CardTitle>
              <CardDescription className="text-base">
                {mode === "guided" 
                  ? "Follow our step-by-step process to conduct complete marketing research — no expertise needed."
                  : "Access advanced research tools and technical controls for comprehensive analysis."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" size="lg" onClick={() => navigate("/product-input")}>
                Start New Research Project
              </Button>
            </CardContent>
          </Card>

          {/* Research Workflow */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Research Workflow</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {steps.map((step, index) => (
                <Card
                  key={step.id}
                  className={`group transition-all duration-300 ${
                    step.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-medium hover:border-primary/50 cursor-pointer"
                  }`}
                  onClick={() => !step.disabled && navigate(step.path)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <CardTitle className="text-lg">{step.label}</CardTitle>
                      </div>
                      {!step.disabled && (
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                  </CardHeader>
                  {step.disabled && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Coming soon</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">10+</div>
                  <div className="text-sm text-muted-foreground">Analysis Methods</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-secondary">AI-Powered</div>
                  <div className="text-sm text-muted-foreground">Automation</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-accent">Real-Time</div>
                  <div className="text-sm text-muted-foreground">Insights</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">End-to-End</div>
                  <div className="text-sm text-muted-foreground">Optimization</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
