import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const SurveyResponseHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [question, setQuestion] = useState<any>(null);
  const [showTextForm, setShowTextForm] = useState(false);

  const surveyId = searchParams.get("survey");
  const contactId = searchParams.get("contact");
  const questionIdx = searchParams.get("question");
  const answer = searchParams.get("answer");

  useEffect(() => {
    const handleResponse = async () => {
      if (!surveyId || !contactId || questionIdx === null) {
        navigate("/");
        return;
      }

      // Fetch survey to get question details
      const { data: survey } = await supabase
        .from("surveys")
        .select("questions")
        .eq("id", surveyId)
        .single();

      if (survey) {
        const questions = typeof survey.questions === 'string' 
          ? JSON.parse(survey.questions) 
          : survey.questions;
        const currentQuestion = questions[parseInt(questionIdx)];
        setQuestion(currentQuestion);

        // If answer is provided (multiple choice or rating), submit immediately
        if (answer && currentQuestion.type !== 'text') {
          await supabase.from("survey_responses").insert({
            survey_id: surveyId,
            contact_id: contactId,
            question_index: parseInt(questionIdx),
            question_text: currentQuestion.text,
            answer: answer,
          });
          setSubmitted(true);
        } else {
          // Show text input form
          setShowTextForm(true);
        }
      }
    };

    handleResponse();
  }, [surveyId, contactId, questionIdx, answer, navigate]);

  const handleTextSubmit = async () => {
    if (!textAnswer.trim()) return;

    await supabase.from("survey_responses").insert({
      survey_id: surveyId,
      contact_id: contactId,
      question_index: parseInt(questionIdx!),
      question_text: question.text,
      answer: textAnswer,
    });
    setSubmitted(true);
    setShowTextForm(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Thank You!</h1>
            <p className="text-lg text-muted-foreground">Your response has been recorded successfully.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show text input form
  if (showTextForm && question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold mb-4">{question.text}</h2>
            <Textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="mb-4"
              rows={5}
            />
            <Button onClick={handleTextSubmit} disabled={!textAnswer.trim()} className="w-full">
              Submit Answer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default SurveyResponseHandler;
