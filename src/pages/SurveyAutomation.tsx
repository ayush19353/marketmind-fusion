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
import { ArrowLeft, UserPlus, Users, Send, Loader2, Mail, Target, TrendingUp, FileUp, BarChart3, Clock, MessageSquare, Trash2 } from "lucide-react";
import Papa from "papaparse";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const SurveyAutomation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const storedProjectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') : null;
  const storedProductName = typeof window !== 'undefined' ? localStorage.getItem('productName') : "";
  const initialProjectId = (location.state?.projectId as string | undefined) || storedProjectId || null;
  const initialProductName = (location.state?.productName as string | undefined) || storedProductName || "";
  const [projectId, setProjectId] = useState<string | null>(initialProjectId);
  const [productName, setProductName] = useState<string>(initialProductName);

  useEffect(() => {
    const stateProjectId = location.state?.projectId as string | undefined;
    if (stateProjectId && stateProjectId !== projectId) {
      setProjectId(stateProjectId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentProjectId', stateProjectId);
      }
    }

    const stateProductName = location.state?.productName as string | undefined;
    if (stateProductName && stateProductName !== productName) {
      setProductName(stateProductName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('productName', stateProductName);
      }
    }
  }, [location.state, projectId, productName]);

  // Resolve the most recently updated project when the page is opened directly or refreshed.
  useEffect(() => {
    if (projectId) return;

    let cancelled = false;

    const resolveLatestProject = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (!userId || cancelled) return;

        const { data: latestProject, error } = await supabase
          .from('research_projects')
          .select('id, product_name')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !latestProject || cancelled) return;

        setProjectId(latestProject.id);
        setProductName(latestProject.product_name || "");
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentProjectId', latestProject.id);
          if (latestProject.product_name) {
            localStorage.setItem('productName', latestProject.product_name);
          }
        }
      } catch (error) {
        console.error('Error resolving latest project:', error);
      }
    };

    resolveLatestProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const [activeTab, setActiveTab] = useState("contacts");
  const [contacts, setContacts] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

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
  const [externalFormUrl, setExternalFormUrl] = useState("");
  const [surveyQuestions, setSurveyQuestions] = useState<any[]>([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [minMatchScore, setMinMatchScore] = useState(70);
  
  // Results state
  const [surveyResults, setSurveyResults] = useState<any>(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchContacts();
      fetchPersonas();
      fetchSurveys();
    }
  }, [projectId]);

  const fetchSurveys = async () => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (!error && data && data.length > 0) {
      setSelectedSurveyId(data[0].id);
    }
  };

  const fetchSurveyResults = async (surveyId: string) => {
    setLoadingResults(true);
    try {
      // Fetch survey details
      const { data: survey } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      // Fetch survey sends (total sent)
      const { data: sends, count: totalSent } = await supabase
        .from('survey_sends')
        .select('*', { count: 'exact' })
        .eq('survey_id', surveyId);

      // Fetch responses
      const { data: responses } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', surveyId);

      // Calculate metrics
      const totalResponses = responses?.length || 0;
      const responseRate = totalSent ? Math.round((totalResponses / totalSent) * 100) : 0;

      // Calculate average completion time (if we track opened_at)
      const completionTimes = sends?.filter(s => s.opened_at && s.completed_at)
        .map(s => new Date(s.completed_at).getTime() - new Date(s.opened_at).getTime()) || [];
      const avgCompletionTime = completionTimes.length 
        ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length / 1000 / 60)
        : null;

      // Aggregate question responses
      const questions = typeof survey?.questions === 'string' 
        ? JSON.parse(survey.questions) 
        : (survey?.questions || []);
      const questionStats = questions.map((q: any, qIdx: number) => {
        const answers = responses?.map(r => r.responses?.[`q${qIdx}`]).filter(Boolean) || [];
        
        if (q.type === 'multiple_choice') {
          const counts: Record<string, number> = {};
          answers.forEach(a => {
            counts[a] = (counts[a] || 0) + 1;
          });
          return {
            question: q.text,
            type: q.type,
            answers: Object.entries(counts).map(([name, value]) => ({ name, value }))
          };
        } else if (q.type === 'text') {
          return {
            question: q.text,
            type: q.type,
            textResponses: answers.map((text, idx) => ({ text, index: idx }))
          };
        } else if (q.type === 'rating') {
          const ratings = answers.map(Number).filter(n => !isNaN(n));
          const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
          return {
            question: q.text,
            type: q.type,
            average: Math.round(avg * 10) / 10,
            distribution: ratings
          };
        }
        return null;
      }).filter(Boolean);

      // Get text responses for sentiment analysis
      const textResponses = questionStats
        .filter(q => q.type === 'text' && q.textResponses?.length > 0)
        .flatMap(q => q.textResponses);

      setSurveyResults({
        survey,
        totalSent,
        totalResponses,
        responseRate,
        avgCompletionTime,
        questionStats,
        textResponses,
        allResponses: responses
      });

      // Run sentiment analysis if there are text responses
      if (textResponses.length > 0) {
        const { data: sentiment, error: sentimentError } = await supabase.functions.invoke(
          'analyze-survey-responses',
          { body: { textResponses } }
        );
        
        if (!sentimentError) {
          setSentimentAnalysis(sentiment);
        }
      }

    } catch (error: any) {
      console.error('Error fetching results:', error);
      toast({
        title: "Error Loading Results",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    if (selectedSurveyId && activeTab === 'results') {
      fetchSurveyResults(selectedSurveyId);
    }
  }, [selectedSurveyId, activeTab]);

  const fetchContacts = async () => {
    try {
      if (!projectId) return;
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
      if (!projectId) return;
      const { data, error } = await supabase
        .from('customer_personas')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      const personaList = data || [];
      setPersonas(personaList);

      if (personaList.length === 0) {
        if (selectedPersonaId) {
          setSelectedPersonaId("");
        }
        return;
      }

      const selectedExists = personaList.some((persona) => persona.id === selectedPersonaId);
      if (!selectedExists) {
        setSelectedPersonaId(personaList[0].id);
      }
    } catch (error) {
      console.error('Error fetching personas:', error);
    }
  };

  const collectKeywords = (input: any): string[] => {
    if (!input) return [];
    if (typeof input === "string") {
      return input
        .split(/[\s,;/\n]+/)
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
    }
    if (Array.isArray(input)) {
      return input.flatMap(collectKeywords);
    }
    if (typeof input === "object") {
      return Object.values(input).flatMap(collectKeywords);
    }
    return [];
  };

  const parseAgeRange = (value?: string | null) => {
    if (!value) return null;
    const normalized = value.toString();
    const rangeMatch = normalized.match(/(\d{1,3})\D+(\d{1,3})/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1], 10);
      const max = parseInt(rangeMatch[2], 10);
      if (!Number.isNaN(min) && !Number.isNaN(max)) {
        return { min, max };
      }
    }
    const lowerBoundMatch = normalized.match(/(\d{1,3})\s*\+?/);
    if (lowerBoundMatch) {
      const min = parseInt(lowerBoundMatch[1], 10);
      if (!Number.isNaN(min)) {
        return { min, max: 120 };
      }
    }
    return null;
  };

  const ageRangesOverlap = (
    a: { min: number; max: number } | null,
    b: { min: number; max: number } | null
  ) => {
    if (!a || !b) return false;
    return a.min <= b.max && b.min <= a.max;
  };

  const buildLocalMatches = (persona: any, contactList: any[]) => {
    const personaKeywordSet = new Set([
      ...collectKeywords(persona.goals),
      ...collectKeywords(persona.pain_points),
      ...collectKeywords(persona.psychographics),
      ...collectKeywords(persona.demographics),
    ]);

    const personaChannelSet = new Set(collectKeywords(persona.preferred_channels));
    const personaIndustrySet = new Set(
      collectKeywords([
        persona.demographics?.industry,
        persona.demographics?.sector,
        persona.demographics?.profession,
      ])
    );
    const personaPainSet = new Set(collectKeywords(persona.pain_points));

    const personaRange = typeof persona.age_range === "string" ? parseAgeRange(persona.age_range) : null;
    const personaAgeLabel = typeof persona.age_range === "string" ? persona.age_range.toLowerCase() : "";

    return contactList.map((contact) => {
      let score = 10;
      const reasons: string[] = [];

      const contactRange = typeof contact.age_range === "string" ? parseAgeRange(contact.age_range) : null;
      const contactAgeLabel = typeof contact.age_range === "string" ? contact.age_range.toLowerCase() : "";

      if (personaRange && contactRange && ageRangesOverlap(personaRange, contactRange)) {
        score += 30;
        reasons.push("Age range aligns with the persona focus.");
      } else if (personaAgeLabel && contactAgeLabel && personaAgeLabel === contactAgeLabel) {
        score += 28;
        reasons.push("Age range matches the persona exactly.");
      }

      const contactKeywordSet = new Set([
        ...collectKeywords(contact.interests),
        ...collectKeywords(contact.demographics),
        ...collectKeywords(contact.behavior_data),
        ...collectKeywords(contact.notes),
      ]);

      const sharedKeywords = Array.from(personaKeywordSet).filter((keyword) => contactKeywordSet.has(keyword));
      if (sharedKeywords.length > 0) {
        const keywordScore = Math.min(40, 25 + sharedKeywords.length * 5);
        score += keywordScore;
        reasons.push(`Shared focus on ${sharedKeywords.slice(0, 3).join(', ')}.`);
      }

      const contactChannelSet = new Set([
        ...collectKeywords(contact.behavior_data?.preferred_channels),
        ...collectKeywords(contact.behavior_data?.channels),
      ]);
      const sharedChannels = Array.from(personaChannelSet).filter((channel) => contactChannelSet.has(channel));
      if (sharedChannels.length > 0) {
        score += 10;
        reasons.push(`Preferred channels overlap (${sharedChannels.slice(0, 2).join(', ')}).`);
      }

      const contactIndustrySet = new Set([
        ...collectKeywords(contact.demographics?.industry),
        ...collectKeywords(contact.demographics?.sector),
        ...collectKeywords(contact.demographics?.profession),
      ]);
      const sharedIndustries = Array.from(personaIndustrySet).filter((industry) => contactIndustrySet.has(industry));
      if (sharedIndustries.length > 0) {
        score += 12;
        reasons.push(`Similar industry background (${sharedIndustries[0]}).`);
      }

      const contactPainKeywords = new Set(collectKeywords(contact.notes));
      const sharedPain = Array.from(personaPainSet).filter((pain) => contactPainKeywords.has(pain));
      if (sharedPain.length > 0) {
        score += 8;
        reasons.push(`Notes mention persona pain point (${sharedPain[0]}).`);
      }

      const finalScore = Math.min(100, Math.round(score));
      const uniqueReasons = Array.from(new Set(reasons));
      if (uniqueReasons.length === 0) {
        uniqueReasons.push("Limited data available; included for manual review.");
      }

      return {
        contact_id: contact.id,
        contact,
        match_score: finalScore,
        reasons: uniqueReasons,
      };
    });
  };

  const mergeMatches = (
    aiMatches: any[] = [],
    heuristicMatches: any[] = [],
    contactList: any[] = []
  ) => {
    const contactMap = new Map(contactList.map((contact) => [contact.id, contact]));
    const mergedMap = new Map<string, any>();

    const upsertMatch = (match: any) => {
      if (!match) return;
      const contactId = match.contact_id || match.contact?.id;
      if (!contactId) return;

      const contact = match.contact || contactMap.get(contactId);
      if (!contact) return;

      const score = typeof match.match_score === "number" ? Math.round(match.match_score) : 0;
      const reasonsArray = Array.isArray(match.reasons)
        ? match.reasons
        : typeof match.reasons === "string"
          ? [match.reasons]
          : [];

      const existing = mergedMap.get(contactId);
      if (!existing || score > existing.match_score) {
        mergedMap.set(contactId, {
          contact_id: contactId,
          contact,
          match_score: Math.min(100, Math.max(0, score)),
          reasons: Array.from(new Set(reasonsArray.filter(Boolean))),
        });
      } else {
        const combined = new Set([...existing.reasons, ...reasonsArray.filter(Boolean)]);
        existing.reasons = Array.from(combined);
      }
    };

    aiMatches.forEach(upsertMatch);
    heuristicMatches.forEach(upsertMatch);

    return Array.from(mergedMap.values()).sort((a, b) => b.match_score - a.match_score);
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

    if (!projectId) {
      toast({
        title: "No Active Project",
        description: "Select or create a project before adding contacts.",
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

  const handleDeleteContact = async (contactId: string) => {
    if (!projectId) {
      toast({
        title: "No Active Project",
        description: "Select or create a project before removing contacts.",
        variant: "destructive",
      });
      return;
    }

    setDeletingContactId(contactId);
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
      setMatches((prev) => prev.filter((match) => match.contact?.id !== contactId));

      toast({
        title: "Contact Removed",
        description: "The contact has been deleted from this project.",
      });
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Unable to delete the contact right now.",
        variant: "destructive",
      });
    } finally {
      setDeletingContactId(null);
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

    if (!projectId) {
      toast({
        title: "No Active Project",
        description: "We couldn't find an active project context for matching.",
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

    const persona = personas.find((p) => p.id === selectedPersonaId);
    if (!persona) {
      toast({
        title: "Persona Not Available",
        description: "The selected persona could not be found. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsMatching(true);
    try {
      let aiMatches: any[] = [];

      try {
        const { data, error } = await supabase.functions.invoke('match-persona-contacts', {
          body: {
            personaId: selectedPersonaId,
            projectId,
            minMatchScore,
          }
        });

        if (error) throw error;
        if (data?.matches && Array.isArray(data.matches)) {
          aiMatches = data.matches;
        }
      } catch (integrationError) {
        console.warn('Falling back to heuristic matching:', integrationError);
        toast({
          title: "AI matching unavailable",
          description: "Using local matching logic to score contacts.",
        });
      }

      const heuristicMatches = buildLocalMatches(persona, contacts);
      const mergedMatches = mergeMatches(aiMatches, heuristicMatches, contacts);
      const filteredMatches = mergedMatches.filter((match) => match.match_score >= minMatchScore);

      const effectiveMatches = filteredMatches.length > 0
        ? filteredMatches
        : mergedMatches.slice(0, Math.min(10, mergedMatches.length));

      setMatches(effectiveMatches);

      if (filteredMatches.length > 0) {
        toast({
          title: "Matching Complete",
          description: `Found ${filteredMatches.length} contacts above ${minMatchScore}% score.`,
        });
        setActiveTab("matches");
      } else if (mergedMatches.length > 0) {
        toast({
          title: "Showing top matches",
          description: "No contacts reached the minimum score, so we listed the best available candidates.",
        });
        setActiveTab("matches");
      } else {
        toast({
          title: "No matches at this threshold",
          description: "Try lowering the minimum score or enrich your contact data.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Matching Failed",
        description: error.message || "Unable to match contacts right now.",
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

  const handleGenerateQuestions = async () => {
    if (!surveyTitle) {
      toast({
        title: "Missing Information",
        description: "Please provide a survey title",
        variant: "destructive",
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "No Active Project",
        description: "Select a project before generating survey questions.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-survey-questions', {
        body: {
          surveyTitle,
          surveyDescription,
          personaInfo: selectedPersonaId && personas.find(p => p.id === selectedPersonaId)
            ? `${personas.find(p => p.id === selectedPersonaId).name}`
            : undefined,
          questionCount: 5
        }
      });

      if (error) throw error;

      setSurveyQuestions(data.questions || []);
      toast({
        title: "Questions Generated",
        description: `Generated ${data.questions?.length || 0} survey questions`,
      });
    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate questions",
        variant: "destructive",
      });
    } finally {
      setGeneratingQuestions(false);
    }
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

    if (surveyQuestions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please generate survey questions first",
        variant: "destructive",
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "No Active Project",
        description: "We couldn't determine which project to associate with this survey.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Create survey with questions first
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .insert({
          project_id: projectId,
          persona_id: selectedPersonaId,
          title: surveyTitle,
          description: surveyDescription,
          questions: surveyQuestions,
          status: 'pending',
        })
        .select()
        .single();

      if (surveyError) throw surveyError;

      // Send emails with questions embedded
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

      setSelectedSurveyId(survey.id);
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteContact(contact.id)}
                        disabled={deletingContactId === contact.id}
                        title="Delete contact"
                      >
                        {deletingContactId === contact.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
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
                      {personas.length > 0 ? (
                        personas.map((persona) => (
                          <SelectItem key={persona.id} value={persona.id}>
                            {persona.name} ({persona.age_range})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-personas" disabled>
                          No personas found. Generate personas in the AI Marketing Studio.
                        </SelectItem>
                      )}
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

                <div className="space-y-4">
                  <Button 
                    onClick={handleGenerateQuestions}
                    disabled={!surveyTitle || generatingQuestions}
                    className="w-full"
                    size="lg"
                  >
                    {generatingQuestions ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      "Generate Survey Questions with AI"
                    )}
                  </Button>
                  
                  {surveyQuestions.length > 0 && (
                    <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Generated Questions ({surveyQuestions.length})</p>
                        <Badge variant="secondary">{surveyQuestions.length} questions</Badge>
                      </div>
                      <div className="space-y-2">
                        {surveyQuestions.map((q, idx) => (
                          <div key={idx} className="p-3 bg-background rounded-lg border">
                            <p className="text-sm font-medium mb-1">{idx + 1}. {q.text}</p>
                            <Badge variant="outline" className="text-xs">{q.type}</Badge>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        ✓ A Google Form will be automatically created with these questions when you send the survey
                      </p>
                    </div>
                  )}
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
                  <div className="space-y-3 mt-6">
                    {externalFormUrl && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Google Form Created
                        </p>
                        <a 
                          href={externalFormUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-primary hover:underline break-all block"
                        >
                          {externalFormUrl}
                        </a>
                      </div>
                    )}
                    <Button 
                      onClick={handleSendSurveys} 
                      disabled={isSending || !surveyTitle || surveyQuestions.length === 0}
                      className="w-full"
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {loadingResults ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing survey results...</p>
                  </div>
                </CardContent>
              </Card>
            ) : !surveyResults ? (
              <Card>
                <CardHeader>
                  <CardTitle>Survey Results</CardTitle>
                  <CardDescription>
                    Track survey sends and responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Send surveys first to see results
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Survey Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>{surveyResults.survey?.title}</CardTitle>
                    <CardDescription>
                      {surveyResults.survey?.description || 'Survey results and analysis'}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Response Rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{surveyResults.responseRate}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {surveyResults.totalResponses} of {surveyResults.totalSent} sent
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total Responses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{surveyResults.totalResponses}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Completed surveys
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Avg. Completion Time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-3xl font-bold">
                          {surveyResults.avgCompletionTime || 'N/A'}
                        </span>
                        {surveyResults.avgCompletionTime && <span className="text-sm">min</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Average time to complete
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Survey Status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge 
                        variant={surveyResults.survey?.status === 'active' ? 'default' : 'secondary'}
                        className="text-base"
                      >
                        {surveyResults.survey?.status || 'Unknown'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Current survey state
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Total Responses Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      All Responses ({surveyResults.totalResponses})
                    </CardTitle>
                    <CardDescription>
                      Complete breakdown of all survey submissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {surveyResults.totalResponses === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No responses yet. Responses will appear here as they come in.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Sent</p>
                            <p className="text-2xl font-bold">{surveyResults.totalSent}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold text-green-600">{surveyResults.totalResponses}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {(surveyResults.totalSent || 0) - surveyResults.totalResponses}
                            </p>
                          </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-muted px-4 py-3 font-semibold text-sm border-b">
                            Individual Responses
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {surveyResults.allResponses?.map((response: any, idx: number) => {
                              const questions = typeof surveyResults.survey?.questions === 'string' 
                                ? JSON.parse(surveyResults.survey.questions) 
                                : (surveyResults.survey?.questions || []);
                              
                              return (
                                <div key={response.id} className="p-4 hover:bg-muted/50 border-b last:border-b-0">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-sm">Response #{idx + 1}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        {new Date(response.submitted_at).toLocaleDateString()}
                                      </Badge>
                                      <Badge>Complete</Badge>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    {questions.map((q: any, qIdx: number) => {
                                      const answer = response.responses?.[`q${qIdx}`];
                                      return answer ? (
                                        <div key={qIdx} className="text-sm">
                                          <span className="font-medium text-foreground">Q{qIdx + 1}. {q.text}:</span>
                                          <p className="text-muted-foreground ml-4 mt-1">
                                            {q.type === 'rating' ? `${answer} ⭐` : answer}
                                          </p>
                                        </div>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sentiment Analysis */}
                {sentimentAnalysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        AI Sentiment Analysis
                      </CardTitle>
                      <CardDescription>
                        Automated analysis of open-ended text responses
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Overall Sentiment</Label>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={
                                sentimentAnalysis.overall_sentiment === 'positive' ? 'default' :
                                sentimentAnalysis.overall_sentiment === 'negative' ? 'destructive' :
                                'secondary'
                              }
                              className="text-lg px-4 py-2"
                            >
                              {sentimentAnalysis.overall_sentiment}
                            </Badge>
                            <span className="text-2xl font-bold">
                              {sentimentAnalysis.sentiment_score}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Key Themes</Label>
                          <ul className="space-y-2">
                            {sentimentAnalysis.key_themes?.map((theme: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{theme}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-base font-semibold text-destructive">Pain Points</Label>
                          <ul className="space-y-2">
                            {sentimentAnalysis.pain_points?.map((point: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-destructive mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-base font-semibold text-green-600">Positive Highlights</Label>
                          <ul className="space-y-2">
                            {sentimentAnalysis.positive_highlights?.map((highlight: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Actionable Insights</Label>
                          <ul className="space-y-2">
                            {sentimentAnalysis.actionable_insights?.map((insight: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-primary mt-0.5">→</span>
                                <span className="font-medium">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Question-by-Question Analysis */}
                {surveyResults.questionStats?.map((stat: any, idx: number) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-lg">Q{idx + 1}: {stat.question}</CardTitle>
                      <Badge variant="outline">{stat.type}</Badge>
                    </CardHeader>
                    <CardContent>
                      {stat.type === 'multiple_choice' && stat.answers && (
                        <div className="space-y-4">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stat.answers}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="hsl(var(--primary))" />
                            </BarChart>
                          </ResponsiveContainer>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {stat.answers.map((answer: any, aIdx: number) => (
                              <div key={aIdx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <span className="text-sm">{answer.name}</span>
                                <Badge>{answer.value}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {stat.type === 'rating' && (
                        <div className="text-center py-8">
                          <div className="text-5xl font-bold text-primary mb-2">
                            {stat.average}
                          </div>
                          <p className="text-muted-foreground">Average Rating</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Based on {stat.distribution.length} responses
                          </p>
                        </div>
                      )}

                      {stat.type === 'text' && stat.textResponses && (
                        <div className="space-y-3">
                          <Label>Individual Responses ({stat.textResponses.length})</Label>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {stat.textResponses.map((response: any, rIdx: number) => (
                              <div key={rIdx} className="p-3 bg-muted/50 rounded text-sm">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="flex-1">{response.text}</p>
                                  {sentimentAnalysis?.individual_sentiments?.[response.index] && (
                                    <Badge variant="outline" className="shrink-0">
                                      {sentimentAnalysis.individual_sentiments[response.index].sentiment}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SurveyAutomation;
