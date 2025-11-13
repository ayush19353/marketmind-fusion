import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus, Users, Send, Loader2, Mail, Target, TrendingUp, Upload, FileUp } from "lucide-react";
import Papa from "papaparse";

const SurveyAutomation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const projectId = location.state?.projectId || localStorage.getItem('currentProjectId');
  const productName = location.state?.productName || localStorage.getItem('productName');

  const [activeTab, setActiveTab] = useState("contacts");
  const [contacts, setContacts] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Contact form state
  const [newContact, setNewContact] = useState({
    first_name: "",
    last_name: "",
    email: "",
    age_range: "",
    interests: "",
    notes: "",
  });

  // Survey state
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [minMatchScore, setMinMatchScore] = useState(70);

  useEffect(() => {
    if (projectId) {
      fetchContacts();
      fetchPersonas();
    }
  }, [projectId]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchPersonas = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_personas')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      setPersonas(data || []);
    } catch (error) {
      console.error('Error fetching personas:', error);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.first_name || !newContact.email) {
      toast({
        title: "Missing Information",
        description: "Please provide at least first name and email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('contacts').insert({
        project_id: projectId,
        first_name: newContact.first_name,
        last_name: newContact.last_name,
        email: newContact.email,
        age_range: newContact.age_range,
        interests: newContact.interests ? newContact.interests.split(',').map(i => i.trim()) : [],
        notes: newContact.notes,
      });

      if (error) throw error;

      toast({
        title: "Contact Added",
        description: `${newContact.first_name} has been added successfully.`,
      });

      setNewContact({
        first_name: "",
        last_name: "",
        email: "",
        age_range: "",
        interests: "",
        notes: "",
      });

      fetchContacts();
    } catch (error: any) {
      toast({
        title: "Error Adding Contact",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchPersona = async () => {
    if (!selectedPersonaId) {
      toast({
        title: "No Persona Selected",
        description: "Please select a persona to match against.",
        variant: "destructive",
      });
      return;
    }

    if (contacts.length === 0) {
      toast({
        title: "No Contacts",
        description: "Please add contacts before matching.",
        variant: "destructive",
      });
      return;
    }

    setIsMatching(true);
    try {
      const { data, error } = await supabase.functions.invoke('match-persona-contacts', {
        body: {
          personaId: selectedPersonaId,
          projectId,
          minMatchScore,
        }
      });

      if (error) throw error;

      setMatches(data.matches || []);
      
      toast({
        title: "Matching Complete",
        description: `Found ${data.matches.length} good matches above ${minMatchScore}% score.`,
      });

      setActiveTab("matches");
    } catch (error: any) {
      toast({
        title: "Matching Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsMatching(false);
    }
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const validContacts = results.data
            .filter((row: any) => row.first_name && row.email)
            .map((row: any) => ({
              project_id: projectId,
              first_name: row.first_name?.trim() || '',
              last_name: row.last_name?.trim() || '',
              email: row.email?.trim().toLowerCase() || '',
              age_range: row.age_range?.trim() || null,
              interests: row.interests ? row.interests.split(',').map((i: string) => i.trim()) : [],
              demographics: row.demographics ? JSON.parse(row.demographics) : {},
              behavior_data: row.behavior_data ? JSON.parse(row.behavior_data) : {},
              notes: row.notes?.trim() || null,
            }));

          if (validContacts.length === 0) {
            toast({
              title: "No Valid Contacts",
              description: "CSV must have at least 'first_name' and 'email' columns with data.",
              variant: "destructive",
            });
            setIsImporting(false);
            return;
          }

          const { error } = await supabase
            .from('contacts')
            .insert(validContacts);

          if (error) throw error;

          toast({
            title: "Import Successful",
            description: `Successfully imported ${validContacts.length} contacts.`,
          });

          fetchContacts();
          
          // Reset file input
          event.target.value = '';
        } catch (error: any) {
          console.error('Import error:', error);
          toast({
            title: "Import Failed",
            description: error.message || "Failed to import contacts. Check CSV format.",
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
        }
      },
      error: (error) => {
        console.error('Parse error:', error);
        toast({
          title: "Parse Error",
          description: "Failed to parse CSV file. Check the file format.",
          variant: "destructive",
        });
        setIsImporting(false);
      }
    });
  };

  const handleSendSurveys = async () => {
    if (!surveyTitle || matches.length === 0) {
      toast({
        title: "Cannot Send Surveys",
        description: "Please provide a survey title and match contacts first.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Create survey
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .insert({
          project_id: projectId,
          persona_id: selectedPersonaId,
          title: surveyTitle,
          description: surveyDescription,
          questions: { questions: [] }, // Placeholder
          status: 'pending',
        })
        .select()
        .single();

      if (surveyError) throw surveyError;

      // Send emails
      const { data, error } = await supabase.functions.invoke('send-survey-emails', {
        body: {
          surveyId: survey.id,
          matches: matches.map(m => ({
            ...m,
            persona_id: selectedPersonaId,
          })),
        }
      });

      if (error) throw error;

      toast({
        title: "Surveys Sent!",
        description: `Successfully sent ${data.sent} surveys. ${data.failed} failed.`,
      });

      setActiveTab("results");
    } catch (error: any) {
      toast({
        title: "Error Sending Surveys",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Survey Automation</h1>
                {productName && <p className="text-sm text-muted-foreground">{productName}</p>}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contacts">
              <Users className="h-4 w-4 mr-2" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="match">
              <Target className="h-4 w-4 mr-2" />
              Match
            </TabsTrigger>
            <TabsTrigger value="matches">
              <TrendingUp className="h-4 w-4 mr-2" />
              Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="results">
              <Mail className="h-4 w-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Import Contacts</CardTitle>
                <CardDescription>
                  Upload a CSV file to import multiple contacts at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCSVImport}
                    disabled={isImporting}
                  />
                  <Label
                    htmlFor="csv-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <FileUp className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {isImporting ? "Importing..." : "Click to upload CSV"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Required columns: first_name, email
                    </span>
                  </Label>
                </div>
                <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
                  <p className="font-medium">CSV Format Example:</p>
                  <p className="font-mono">first_name,last_name,email,age_range,interests</p>
                  <p className="font-mono">John,Doe,john@example.com,25-34,"tech,fitness"</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Single Contact</CardTitle>
                <CardDescription>
                  Manually add one contact to your list
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                      value={newContact.first_name}
                      onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={newContact.last_name}
                      onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <Input
                    value={newContact.age_range}
                    onChange={(e) => setNewContact({ ...newContact, age_range: e.target.value })}
                    placeholder="e.g., 25-34"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interests (comma-separated)</Label>
                  <Input
                    value={newContact.interests}
                    onChange={(e) => setNewContact({ ...newContact, interests: e.target.value })}
                    placeholder="technology, fitness, travel"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newContact.notes}
                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                    placeholder="Additional information about this contact"
                    rows={3}
                  />
                </div>

                <Button onClick={handleAddContact} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Contact
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact List ({contacts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                        {contact.age_range && (
                          <Badge variant="outline" className="mt-1">{contact.age_range}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No contacts yet. Add your first contact above.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Match Tab */}
          <TabsContent value="match" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Match Persona to Contacts</CardTitle>
                <CardDescription>
                  Use AI to find the best contact matches for your target persona
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Persona</Label>
                  <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a persona to match" />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map((persona) => (
                        <SelectItem key={persona.id} value={persona.id}>
                          {persona.name} ({persona.age_range})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Match Score: {minMatchScore}%</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Only contacts scoring above {minMatchScore}% will be included
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Available:</strong> {contacts.length} contacts and {personas.length} personas
                  </p>
                </div>

                <Button 
                  onClick={handleMatchPersona} 
                  disabled={isMatching || !selectedPersonaId}
                  className="w-full"
                  size="lg"
                >
                  {isMatching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Matching with AI...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Find Best Matches
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            {matches.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Match Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-background rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Total Matches</p>
                      <p className="text-3xl font-bold text-primary">{matches.length}</p>
                    </div>
                    <div className="bg-background rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-3xl font-bold text-primary">
                        {Math.round(matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length)}%
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Top Match</p>
                      <p className="text-3xl font-bold text-primary">
                        {Math.max(...matches.map(m => m.match_score))}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Configure Survey</CardTitle>
                <CardDescription>
                  Set up your survey before sending to matched contacts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Survey Title *</Label>
                  <Input
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    placeholder="e.g., Product Feedback Survey"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    placeholder="Brief description that will appear in the email"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Matched Contacts Preview ({matches.length})</CardTitle>
                <CardDescription>
                  Review AI-matched contacts and their match reasons before sending surveys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {matches.map((match, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">
                            {match.contact.first_name} {match.contact.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{match.contact.email}</p>
                          {match.contact.age_range && (
                            <Badge variant="outline" className="mt-2">
                              {match.contact.age_range}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={match.match_score >= 80 ? "default" : "secondary"} 
                            className="text-lg px-3 py-1"
                          >
                            {match.match_score}%
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Match Score</p>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-md p-3 mt-3">
                        <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Why This Contact Matches:
                        </p>
                        <ul className="text-sm space-y-1.5">
                          {match.reasons.map((reason: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  {matches.length === 0 && (
                    <div className="text-center py-12">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">No matches yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Go to the Match tab to find contacts for your persona
                      </p>
                    </div>
                  )}
                </div>

                {matches.length > 0 && (
                  <Button 
                    onClick={handleSendSurveys} 
                    disabled={isSending || !surveyTitle}
                    className="w-full mt-6"
                    size="lg"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Surveys...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Surveys to {matches.length} Contacts
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Survey Results</CardTitle>
                <CardDescription>
                  Track survey sends and responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Results will appear here after sending surveys
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SurveyAutomation;
