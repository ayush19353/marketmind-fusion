import { Brain, Target, LineChart, Zap, TestTube, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI Hypothesis Generation",
    description: "Automatically create testable, data-driven marketing hypotheses based on your product concept.",
    gradient: "from-primary to-primary-glow",
  },
  {
    icon: Target,
    title: "Smart Research Planning",
    description: "Complete research blueprints with target audiences, sample sizes, and methodology recommendations.",
    gradient: "from-secondary to-primary",
  },
  {
    icon: LineChart,
    title: "Advanced Analytics",
    description: "Cluster analysis, regression, conjoint analysis, and more — all automated and visualized.",
    gradient: "from-accent to-primary",
  },
  {
    icon: Zap,
    title: "Real-Time Insights",
    description: "Live dashboards track research progress and surface insights as data comes in.",
    gradient: "from-primary to-accent",
  },
  {
    icon: TestTube,
    title: "A/B Testing Engine",
    description: "Validate creative ideas and campaign hypotheses before scaling with integrated testing.",
    gradient: "from-secondary to-accent",
  },
  {
    icon: TrendingUp,
    title: "Campaign Optimization",
    description: "SEO strategy, ROI prediction, and performance simulation to maximize marketing impact.",
    gradient: "from-accent to-secondary",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Complete Research Ecosystem
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to transform product ideas into market-winning strategies
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-medium group"
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
