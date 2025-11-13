import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SurveyResponseHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [survey, setSurvey] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  const surveyId = searchParams.get("survey");
  const contactId = searchParams.get("contact");

  useEffect(() => {
    const loadSurvey = async () => {
      if (!surveyId || !contactId) {
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from("surveys")
          .select("*")
          .eq("id", surveyId)
          .single();

        if (error || !data) {
          toast({
            title: "Error",
            description: "Survey not found",
            variant: "destructive"
          });
          return;
        }

        setSurvey(data);
      } catch (error) {
        console.error('Error loading survey:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, [surveyId, contactId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const questions = typeof survey.questions === 'string' 
        ? JSON.parse(survey.questions) 
        : survey.questions;

      // Validate required fields
      const missingRequired = questions.some((q: any, idx: number) => 
        q.required && !responses[`q${idx}`]
      );

      if (missingRequired) {
        toast({
          title: "Missing Required Fields",
          description: "Please answer all required questions",
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }

      // Submit all responses
      await supabase.from("survey_responses").insert({
        survey_id: surveyId,
        contact_id: contactId,
        responses: responses,
        submitted_at: new Date().toISOString()
      });

      setSubmitted(true);
      toast({
        title: "Success!",
        description: "Your responses have been submitted"
      });
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        title: "Error",
        description: "Failed to submit survey",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponseChange = (questionIdx: number, value: any) => {
    setResponses(prev => ({
      ...prev,
      [`q${questionIdx}`]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Survey Not Found</CardTitle>
            <CardDescription>
              The survey you're looking for doesn't exist
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Thank You! 🎉</CardTitle>
            <CardDescription>
              Your responses have been recorded successfully
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const questions = typeof survey.questions === 'string' 
    ? JSON.parse(survey.questions) 
    : survey.questions;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{survey.title}</CardTitle>
            {survey.description && (
              <CardDescription className="text-base">
                {survey.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {questions.map((q: any, idx: number) => (
                <div key={idx} className="space-y-3">
                  <Label className="text-base font-semibold">
                    {idx + 1}. {q.text}
                    {q.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  
                  {q.type === 'text' && (
                    <Textarea
                      value={responses[`q${idx}`] || ''}
                      onChange={(e) => handleResponseChange(idx, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={4}
                      required={q.required}
                    />
                  )}

                  {q.type === 'multiple_choice' && (
                    <RadioGroup
                      value={responses[`q${idx}`] || ''}
                      onValueChange={(value) => handleResponseChange(idx, value)}
                      required={q.required}
                    >
                      {q.options?.map((option: string, oIdx: number) => (
                        <div key={oIdx} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`q${idx}-o${oIdx}`} />
                          <Label htmlFor={`q${idx}-o${oIdx}`} className="font-normal cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {q.type === 'rating' && (
                    <RadioGroup
                      value={responses[`q${idx}`] || ''}
                      onValueChange={(value) => handleResponseChange(idx, value)}
                      required={q.required}
                      className="flex gap-2"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating} className="flex items-center">
                          <RadioGroupItem value={rating.toString()} id={`q${idx}-r${rating}`} className="sr-only" />
                          <Label 
                            htmlFor={`q${idx}-r${rating}`} 
                            className={`
                              cursor-pointer px-4 py-2 rounded-lg border-2 transition-all
                              ${responses[`q${idx}`] === rating.toString() 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'bg-background border-border hover:border-primary/50'}
                            `}
                          >
                            {rating}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Survey'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
