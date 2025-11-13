import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Home, Sparkles, Users, TrendingUp, Image as ImageIcon, Loader2, Copy, Download, Mail } from "lucide-react";

const MarketingStudio = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { projectId, productName, productDescription } = location.state || {};
  
  const [activeTab, setActiveTab] = useState("copy");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Marketing Copy State
  const [contentType, setContentType] = useState("ad_copy");
  const [copyVariants, setCopyVariants] = useState<any[]>([]);
  
  // Persona State
  const [personas, setPersonas] = useState<any[]>([]);
  
  // Competitive Analysis State
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState("");
  
  // Campaign Image State
  const [imageType, setImageType] = useState("hero");
  const [imageStyle, setImageStyle] = useState("modern");
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);

  useEffect(() => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project selected. Redirecting to dashboard...",
        variant: "destructive",
      });
      setTimeout(() => navigate("/dashboard"), 2000);
    } else {
      fetchExistingContent();
    }
  }, [projectId]);

  const fetchExistingContent = async () => {
    try {
      // Fetch existing marketing content
      const { data: copyData } = await supabase
        .from('marketing_content')
        .select('*')
        .eq('project_id', projectId);
      
      if (copyData) setCopyVariants(copyData);

      // Fetch existing personas
      const { data: personaData } = await supabase
        .from('customer_personas')
        .select('*')
        .eq('project_id', projectId);
      
      if (personaData) setPersonas(personaData);

      // Fetch competitive analysis
      const { data: competitiveData } = await supabase
        .from('competitive_analysis')
        .select('*')
        .eq('project_id', projectId);
      
      if (competitiveData) setCompetitiveAnalysis(competitiveData);

      // Fetch campaign images
      const { data: imageData } = await supabase
        .from('campaign_images')
        .select('*')
        .eq('project_id', projectId);
      
      if (imageData) setGeneratedImages(imageData);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const generateMarketingCopy = async () => {
    setIsGenerating(true);
    try {
      // Fetch research plan for target audience data
      const { data: planData } = await supabase
        .from('research_plans')
        .select('target_audience')
        .eq('project_id', projectId)
        .single();

      const targetAudienceData = planData?.target_audience as any;
      const targetAudience = targetAudienceData?.demographics || "general audience";

      const { data, error } = await supabase.functions.invoke('generate-marketing-copy', {
        body: { productName, productDescription, targetAudience, contentType, variantCount: 3 }
      });

      if (error) throw error;

      // Save to database
      const variants = data.variants.map((v: any) => ({
        project_id: projectId,
        content_type: contentType,
        variant_name: v.variant_name,
        headline: v.headline,
        body_text: v.body_text,
        cta: v.cta
      }));

      const { error: insertError } = await supabase
        .from('marketing_content')
        .insert(variants);

      if (insertError) throw insertError;

      toast({
        title: "Marketing copy generated!",
        description: `Created ${data.variants.length} variants`,
      });

      fetchExistingContent();
    } catch (error: any) {
      console.error('Error generating copy:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePersonas = async () => {
    setIsGenerating(true);
    try {
      const { data: planData } = await supabase
        .from('research_plans')
        .select('*')
        .eq('project_id', projectId)
        .single();

      const { data, error } = await supabase.functions.invoke('generate-personas', {
        body: { 
          productName, 
          productDescription, 
          researchData: planData,
          personaCount: 3 
        }
      });

      if (error) throw error;

      // Save to database with proper defaults for all fields
      const personaRecords = data.personas.map((p: any) => ({
        project_id: projectId,
        name: p.name,
        age_range: p.age_range || 'Not specified',
        demographics: p.demographics || {},
        psychographics: p.psychographics || {},
        pain_points: p.pain_points || [],
        goals: p.goals || [],
        preferred_channels: p.preferred_channels || [],
        buying_behavior: p.buying_behavior || {}
      }));

      const { error: insertError } = await supabase
        .from('customer_personas')
        .insert(personaRecords);

      if (insertError) throw insertError;

      toast({
        title: "Personas generated!",
        description: `Created ${data.personas.length} customer personas`,
      });

      fetchExistingContent();
    } catch (error: any) {
      console.error('Error generating personas:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCompetitiveAnalysis = async () => {
    setIsGenerating(true);
    try {
      const competitorList = competitors.split(',').map(c => c.trim()).filter(c => c);

      const { data, error } = await supabase.functions.invoke('generate-competitive-analysis', {
        body: { productName, productDescription, competitors: competitorList }
      });

      if (error) throw error;

      // Save to database
      const analysisRecords = data.analyses.map((a: any) => ({
        project_id: projectId,
        competitor_name: a.competitor_name,
        strengths: a.strengths,
        weaknesses: a.weaknesses,
        opportunities: a.opportunities,
        threats: a.threats,
        positioning: a.positioning,
        recommendations: a.recommendations
      }));

      const { error: insertError } = await supabase
        .from('competitive_analysis')
        .insert(analysisRecords);

      if (insertError) throw insertError;

      toast({
        title: "Competitive analysis complete!",
        description: `Analyzed ${data.analyses.length} competitors`,
      });

      fetchExistingContent();
    } catch (error: any) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCampaignImage = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-campaign-image', {
        body: { productName, imageType, style: imageStyle }
      });

      if (error) throw error;

      // Save to database
      const { error: insertError } = await supabase
        .from('campaign_images')
        .insert({
          project_id: projectId,
          image_type: imageType,
          prompt: data.prompt,
          image_data: data.imageData,
          dimensions: "1024x1024"
        });

      if (insertError) throw insertError;

      toast({
        title: "Campaign image generated!",
        description: "Professional marketing image ready to use",
      });

      fetchExistingContent();
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Marketing Studio</h1>
              <p className="text-sm text-muted-foreground">{productName}</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Powered by GenAI
          </Badge>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Transform Research into Results</CardTitle>
              <CardDescription className="text-base">
                Generate AI-powered marketing assets from your research insights: copy, personas, competitive intelligence, and campaign visuals.
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="copy">Marketing Copy</TabsTrigger>
              <TabsTrigger value="personas">Personas</TabsTrigger>
              <TabsTrigger value="competitive">Competitive Intel</TabsTrigger>
              <TabsTrigger value="images">Campaign Images</TabsTrigger>
            </TabsList>

            {/* Marketing Copy Tab */}
            <TabsContent value="copy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Copy Generator</CardTitle>
                  <CardDescription>
                    Generate conversion-optimized copy for ads, emails, landing pages, and more
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Content Type</label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ad_copy">Ad Copy (Google/Facebook)</SelectItem>
                        <SelectItem value="email">Email Campaign</SelectItem>
                        <SelectItem value="landing_page">Landing Page</SelectItem>
                        <SelectItem value="social_post">Social Media Post</SelectItem>
                        <SelectItem value="blog_post">Blog Post</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={generateMarketingCopy} 
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Copy...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate 3 Variants
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
                {copyVariants.map((variant, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{variant.variant_name}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(`${variant.headline}\n\n${variant.body_text}\n\n${variant.cta}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Badge variant="outline">{variant.content_type.replace('_', ' ')}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Headline</p>
                        <p className="font-semibold">{variant.headline}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Body</p>
                        <p className="text-sm">{variant.body_text}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">CTA</p>
                        <p className="text-sm font-medium text-primary">{variant.cta}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Personas Tab */}
            <TabsContent value="personas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Persona Builder</CardTitle>
                  <CardDescription>
                    Create detailed customer personas based on your research data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={generatePersonas} 
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Building Personas...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Generate 3 Personas
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
                {personas.map((persona, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle>{persona.name}</CardTitle>
                      <CardDescription>{persona.age_range}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Pain Points</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {persona.pain_points.slice(0, 3).map((p: string, i: number) => (
                            <li key={i}>• {p}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Goals</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {persona.goals.slice(0, 3).map((g: string, i: number) => (
                            <li key={i}>• {g}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Channels</p>
                        <div className="flex flex-wrap gap-1">
                          {persona.preferred_channels.map((c: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Competitive Analysis Tab */}
            <TabsContent value="competitive" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Competitive Intelligence</CardTitle>
                  <CardDescription>
                    AI-powered competitive analysis with strategic recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Competitors (comma-separated, or leave blank for AI to identify)
                    </label>
                    <Textarea
                      value={competitors}
                      onChange={(e) => setCompetitors(e.target.value)}
                      placeholder="Competitor A, Competitor B, Competitor C"
                      rows={2}
                    />
                  </div>

                  <Button 
                    onClick={generateCompetitiveAnalysis} 
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Competition...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Generate Analysis
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {competitiveAnalysis.map((analysis, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle>{analysis.competitor_name}</CardTitle>
                      <CardDescription>{analysis.positioning}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2 text-green-600">Strengths</p>
                          <ul className="text-sm space-y-1">
                            {analysis.strengths.map((s: string, i: number) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2 text-red-600">Weaknesses</p>
                          <ul className="text-sm space-y-1">
                            {analysis.weaknesses.map((w: string, i: number) => (
                              <li key={i}>• {w}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2 text-blue-600">Opportunities</p>
                          <ul className="text-sm space-y-1">
                            {analysis.opportunities.map((o: string, i: number) => (
                              <li key={i}>• {o}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2 text-orange-600">Threats</p>
                          <ul className="text-sm space-y-1">
                            {analysis.threats.map((t: string, i: number) => (
                              <li key={i}>• {t}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Campaign Images Tab */}
            <TabsContent value="images" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Image Generator</CardTitle>
                  <CardDescription>
                    Create professional marketing visuals for campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Image Type</label>
                      <Select value={imageType} onValueChange={setImageType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero">Hero Banner</SelectItem>
                          <SelectItem value="ad_banner">Ad Banner</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="product_shot">Product Shot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Style</label>
                      <Select value={imageStyle} onValueChange={setImageStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="vibrant">Vibrant</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={generateCampaignImage} 
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Image...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Generate Campaign Image
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {generatedImages.map((image, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize">{image.image_type.replace('_', ' ')}</CardTitle>
                        <Badge variant="outline">{image.dimensions}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <img 
                        src={image.image_data} 
                        alt={image.image_type}
                        className="w-full rounded-lg border"
                      />
                      <p className="text-xs text-muted-foreground">{image.prompt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* A/B Test Predictor Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                A/B Test Predictor
              </CardTitle>
              <CardDescription>
                Predict campaign performance before running tests using AI modeling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use AI to analyze campaign variants and predict which will perform better based on historical data, marketing psychology, and best practices. Make data-driven decisions before investing in full A/B tests.
              </p>
              <Button 
                onClick={() => navigate('/ab-test-predictor', { 
                  state: { projectId, productName } 
                })}
                className="w-full"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Open A/B Test Predictor
              </Button>
            </CardContent>
          </Card>

          {/* Survey Automation Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Survey Automation
              </CardTitle>
              <CardDescription>
                Match personas with contacts and automatically send targeted surveys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use AI to match your customer personas with real contacts from your database, then automatically send personalized surveys to the most relevant participants. Perfect for gathering targeted feedback and validating your research hypotheses.
              </p>
              <Button 
                onClick={() => navigate('/survey-automation', { 
                  state: { projectId, productName } 
                })}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Open Survey Automation
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MarketingStudio;
