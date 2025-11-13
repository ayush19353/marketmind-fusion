import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Home, Sparkles, FileQuestion, MessageSquare, CheckSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Instruments = () => {
  const navigate = useNavigate();
  const [instrumentType, setInstrumentType] = useState("survey");
  const [questionCount, setQuestionCount] = useState("10");

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Instrument Designer</h1>
              <p className="text-sm text-muted-foreground">Generate surveys & interview guides</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Powered by GenAI
          </Badge>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Design Research Instruments</CardTitle>
              <CardDescription className="text-base">
                AI creates validated survey questions and interview guides based on your hypotheses
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs value={instrumentType} onValueChange={setInstrumentType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="survey">
                <FileQuestion className="h-4 w-4 mr-2" />
                Survey
              </TabsTrigger>
              <TabsTrigger value="interview">
                <MessageSquare className="h-4 w-4 mr-2" />
                Interview Guide
              </TabsTrigger>
              <TabsTrigger value="screener">
                <CheckSquare className="h-4 w-4 mr-2" />
                Screener
              </TabsTrigger>
            </TabsList>

            <TabsContent value="survey" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Survey Generator</CardTitle>
                  <CardDescription>
                    Generate validated survey questions with branching logic and skip patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Number of Questions</label>
                    <Select value={questionCount} onValueChange={setQuestionCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 questions (Quick pulse)</SelectItem>
                        <SelectItem value="10">10 questions (Standard)</SelectItem>
                        <SelectItem value="15">15 questions (In-depth)</SelectItem>
                        <SelectItem value="20">20 questions (Comprehensive)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Survey Goals (Optional)</label>
                    <Textarea
                      placeholder="E.g., Validate pricing, test messaging, measure brand awareness..."
                      rows={3}
                    />
                  </div>

                  <Button size="lg" className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Survey Questions
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Preview: AI-Generated Survey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <p className="font-medium mb-2">1. How likely are you to recommend this product to a friend? (NPS)</p>
                    <p className="text-sm text-muted-foreground">Scale: 0-10</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <p className="font-medium mb-2">2. Which features are most important to you?</p>
                    <p className="text-sm text-muted-foreground">Multiple choice: Price, Quality, Speed, Support</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <p className="font-medium mb-2">3. What problem does this solve for you?</p>
                    <p className="text-sm text-muted-foreground">Open-ended text</p>
                  </div>
                  <p className="text-sm text-muted-foreground italic">+ 7 more AI-generated questions</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Interview Guide Generator</CardTitle>
                  <CardDescription>
                    Create structured interview guides with follow-up probes and time allocations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Interview Duration</label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button size="lg" className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Interview Guide
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Preview: AI-Generated Interview Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Opening (5 min)</p>
                      <Badge variant="outline">Ice breaker</Badge>
                    </div>
                    <p className="text-sm">Tell me about your current workflow when [using similar products]...</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Core Questions (20 min)</p>
                      <Badge variant="outline">Deep dive</Badge>
                    </div>
                    <p className="text-sm">Walk me through the last time you experienced [problem]...</p>
                    <p className="text-xs text-muted-foreground mt-2">Probes: How did that make you feel? What did you try?</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Closing (5 min)</p>
                      <Badge variant="outline">Wrap-up</Badge>
                    </div>
                    <p className="text-sm">If you could change one thing about [category], what would it be?</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="screener" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Screener Generator</CardTitle>
                  <CardDescription>
                    Create qualification screeners to identify your ideal research participants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Criteria</label>
                    <Textarea
                      placeholder="E.g., Age 25-45, uses social media daily, has purchased similar products..."
                      rows={4}
                    />
                  </div>

                  <Button size="lg" className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Screener Questions
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/research-plan")}>
              Back to Research Plan
            </Button>
            <Button className="flex-1" onClick={() => navigate("/data-insights")}>
              Continue to Data Collection
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Instruments;
