import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

export default function SurveyResponse() {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get("survey");
  const contactId = searchParams.get("contact");
  const { toast } = useToast();
  
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!surveyId) return;
      
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load survey",
          variant: "destructive",
        });
        return;
      }
      
      setSurvey(data);
      setLoading(false);
    };
    
    fetchSurvey();
  }, [surveyId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: surveyId,
          contact_id: contactId,
          responses: responses,
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Success!",
        description: "Your responses have been recorded. Thank you!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>
              Your responses have been submitted successfully.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const questions = survey?.questions?.questions || [];

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{survey?.title}</CardTitle>
            {survey?.description && (
              <CardDescription className="text-base">
                {survey.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <p className="text-muted-foreground">This survey has no questions yet.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {questions.map((q: any, index: number) => (
                  <div key={index} className="space-y-3">
                    <Label className="text-base font-medium">
                      {index + 1}. {q.text}
                      {q.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    
                    {q.type === 'text' && (
                      <Textarea
                        required={q.required}
                        value={responses[`q${index}`] || ''}
                        onChange={(e) => setResponses({ ...responses, [`q${index}`]: e.target.value })}
                        placeholder="Your answer..."
                        rows={3}
                      />
                    )}
                    
                    {q.type === 'multiple_choice' && (
                      <RadioGroup
                        required={q.required}
                        value={responses[`q${index}`] || ''}
                        onValueChange={(value) => setResponses({ ...responses, [`q${index}`]: value })}
                      >
                        {q.options?.map((option: string, optIndex: number) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} />
                            <Label htmlFor={`q${index}-opt${optIndex}`} className="font-normal">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    
                    {q.type === 'rating' && (
                      <RadioGroup
                        required={q.required}
                        value={responses[`q${index}`] || ''}
                        onValueChange={(value) => setResponses({ ...responses, [`q${index}`]: value })}
                        className="flex gap-4"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div key={rating} className="flex flex-col items-center space-y-1">
                            <RadioGroupItem value={rating.toString()} id={`q${index}-rating${rating}`} />
                            <Label htmlFor={`q${index}-rating${rating}`} className="font-normal text-sm">
                              {rating}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </div>
                ))}
                
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Responses"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
