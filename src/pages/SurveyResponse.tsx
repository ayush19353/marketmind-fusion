import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";

type Question = {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating';
  required: boolean;
  options?: string[];
};

type Survey = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
};

export default function SurveyResponse() {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSurvey();
  }, [surveyId]);

  const loadSurvey = async () => {
    if (!surveyId) return;

    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('id, title, description, questions')
        .eq('id', surveyId)
        .single();

      if (error) throw error;
      setSurvey(data as Survey);
    } catch (error) {
      console.error('Error loading survey:', error);
      toast.error("Failed to load survey");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;

    // Validate required fields
    const missingRequired = survey.questions
      .filter(q => q.required)
      .some(q => !responses[q.id] || responses[q.id].trim() === '');

    if (missingRequired) {
      toast.error("Please answer all required questions");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: survey.id,
          responses: responses,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Survey submitted successfully!");
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error("Failed to submit survey");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Survey Not Found</CardTitle>
            <CardDescription>The survey you're looking for doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>Your response has been recorded.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{survey.title}</CardTitle>
            {survey.description && (
              <CardDescription className="text-base">{survey.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {survey.questions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <Label htmlFor={question.id} className="text-base font-medium">
                    {index + 1}. {question.text}
                    {question.required && <span className="text-destructive ml-1">*</span>}
                  </Label>

                  {question.type === 'text' && (
                    <Textarea
                      id={question.id}
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      required={question.required}
                      placeholder="Your answer..."
                      className="min-h-[100px]"
                    />
                  )}

                  {question.type === 'multiple_choice' && question.options && (
                    <RadioGroup
                      value={responses[question.id] || ''}
                      onValueChange={(value) => handleResponseChange(question.id, value)}
                      required={question.required}
                    >
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} />
                          <Label htmlFor={`${question.id}-${optIndex}`} className="font-normal cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === 'rating' && (
                    <RadioGroup
                      value={responses[question.id] || ''}
                      onValueChange={(value) => handleResponseChange(question.id, value)}
                      required={question.required}
                      className="flex gap-2"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating} className="flex flex-col items-center">
                          <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} />
                          <Label htmlFor={`${question.id}-${rating}`} className="font-normal cursor-pointer text-sm mt-1">
                            {rating}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}

              <Button type="submit" disabled={submitting} className="w-full">
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
