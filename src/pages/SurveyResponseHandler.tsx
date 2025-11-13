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
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [question, setQuestion] = useState<any>(null);

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
          setLoading(false);
        } else {
          // Show text input form
          setLoading(false);
        }
      }
    };

    handleResponse();
  }, [surveyId, contactId, questionIdx, answer, navigate]);

  const handleTextSubmit = async () => {
    if (!textAnswer.trim()) return;

    setLoading(true);
    await supabase.from("survey_responses").insert({
      survey_id: surveyId,
      contact_id: contactId,
      question_index: parseInt(questionIdx!),
      question_text: question.text,
      answer: textAnswer,
    });
    setSubmitted(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p>Processing your response...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
            <p className="text-muted-foreground">Your response has been recorded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show text input form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h2 className="text-xl font-bold mb-4">{question?.text}</h2>
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
};

export default SurveyResponseHandler;
