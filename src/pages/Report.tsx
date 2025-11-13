import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Sparkles, Download, Share2, FileText, TrendingUp, Target, Lightbulb } from "lucide-react";

const Report = () => {
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
              <h1 className="text-xl font-bold text-foreground">AI Executive Report</h1>
              <p className="text-sm text-muted-foreground">Comprehensive insights & recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Research Insights Report</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Profluence - LinkedIn for Influencers
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI-Generated
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-3 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-primary">579</div>
                  <p className="text-xs text-muted-foreground mt-1">Survey Responses</p>
                </div>
                <div className="text-center p-3 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-secondary">30</div>
                  <p className="text-xs text-muted-foreground mt-1">In-Depth Interviews</p>
                </div>
                <div className="text-center p-3 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-accent">95%</div>
                  <p className="text-xs text-muted-foreground mt-1">Statistical Confidence</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">
                Our comprehensive research into the creator economy platform reveals strong market validation. 
                <strong className="text-foreground"> Emerging influencers (comics, TikTokers) show 72% conversion intent</strong>, 
                with early adopters willing to pay premium pricing for brand-matching features.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Key insight: The market is ready for a professional networking layer specifically built for creators. 
                Traditional platforms like LinkedIn don't address creator-specific needs around portfolio showcasing, 
                brand deals, and collaboration discovery.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Key Findings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border-l-4 border-primary bg-primary/5 rounded">
                <h4 className="font-semibold mb-2">✓ Strong Market Validation</h4>
                <p className="text-sm text-muted-foreground">
                  72% of surveyed creators expressed high interest in a dedicated professional network. 
                  Current solutions (LinkedIn, Linktree) rated poorly for creator-specific needs.
                </p>
              </div>
              <div className="p-4 border-l-4 border-secondary bg-secondary/5 rounded">
                <h4 className="font-semibold mb-2">✓ Premium Pricing Validated</h4>
                <p className="text-sm text-muted-foreground">
                  Early adopters willing to pay $29-49/month for advanced features (brand matching, analytics, portfolio tools). 
                  Price sensitivity lower than expected.
                </p>
              </div>
              <div className="p-4 border-l-4 border-accent bg-accent/5 rounded">
                <h4 className="font-semibold mb-2">✓ Video-First Discovery Critical</h4>
                <p className="text-sm text-muted-foreground">
                  Short-form video feed increases engagement by 35% vs profile-only. 
                  Creators want to showcase work, not just list credentials.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Target Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Primary: Emerging Creators</h4>
                    <Badge>45% of market</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    1k-100k followers, seeking monetization and growth. High engagement, tech-savvy, collaboration-focused.
                  </p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Secondary: Brand Marketers</h4>
                    <Badge variant="secondary">30% of market</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Agencies and brands seeking vetted creator partnerships. Value discovery tools and performance metrics.
                  </p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Tertiary: Talent Managers</h4>
                    <Badge variant="outline">25% of market</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Managing multiple creator clients. Need portfolio tools and contract management features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                AI Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-card rounded-lg border border-border">
                <h4 className="font-semibold mb-1">1. Launch with Premium Tier</h4>
                <p className="text-sm text-muted-foreground">
                  Data supports premium pricing strategy. Launch at $39/mo with brand-matching and analytics. 
                  Add freemium tier later to capture broader market.
                </p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border">
                <h4 className="font-semibold mb-1">2. Prioritize Video Discovery Feed</h4>
                <p className="text-sm text-muted-foreground">
                  Build short-form video showcase as core feature. 35% engagement lift validates this as differentiator 
                  vs traditional professional networks.
                </p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border">
                <h4 className="font-semibold mb-1">3. Focus Marketing on Comedy & Short-Form Creators</h4>
                <p className="text-sm text-muted-foreground">
                  Highest conversion intent and lowest churn. These segments show 3x higher engagement than general creators. 
                  Expand to other verticals post-PMF.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/analysis")}>
              Back to Analysis
            </Button>
            <Button className="flex-1" onClick={() => navigate("/marketing-studio")}>
              <Sparkles className="h-4 w-4 mr-2" />
              Open Marketing Studio
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Report;
