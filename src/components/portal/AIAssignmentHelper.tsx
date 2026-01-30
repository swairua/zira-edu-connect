import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIAssignmentHelperProps {
  title: string;
  subjectName?: string;
  className?: string;
  onDescriptionGenerated: (description: string) => void;
  disabled?: boolean;
}

export function AIAssignmentHelper({
  title,
  subjectName,
  className,
  onDescriptionGenerated,
  disabled,
}: AIAssignmentHelperProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error('Please enter an assignment title first');
      return;
    }

    setIsGenerating(true);

    try {
      const LOVABLE_API_KEY = await getApiKey();
      
      const prompt = `Generate clear, student-friendly instructions for an assignment:
- Title: ${title}
${subjectName ? `- Subject: ${subjectName}` : ''}
${className ? `- Class: ${className}` : ''}

Provide 2-4 sentences that:
1. Explain what students need to do
2. Mention any key requirements or expectations
3. Are encouraging and professional

Return ONLY the description text, no headers or formatting.`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            subject_code: subjectName || 'General',
            grade_level: className || 'All levels',
            question_type: 'essay',
            difficulty: 'medium',
            count: 1,
            topic: title,
            custom_prompt: prompt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      
      // Extract generated content - the edge function returns questions array
      if (data.questions?.[0]?.question_text) {
        onDescriptionGenerated(data.questions[0].question_text);
        toast.success('Description generated!');
      } else {
        // Fallback: generate a simple description
        const simpleDescription = `Complete this ${title} assignment. Follow the instructions carefully, show your work, and submit before the deadline. Ask your teacher if you have any questions.`;
        onDescriptionGenerated(simpleDescription);
        toast.success('Description generated!');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      // Fallback description
      const fallbackDescription = `Please complete the "${title}" assignment. Review the requirements carefully, follow all instructions, and submit your work by the due date. If you need clarification, don't hesitate to ask your teacher.`;
      onDescriptionGenerated(fallbackDescription);
      toast.info('Generated a template description');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleGenerate}
      disabled={disabled || isGenerating || !title.trim()}
      className="gap-1 h-7 text-xs"
    >
      {isGenerating ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {isGenerating ? 'Generating...' : 'AI Suggest'}
    </Button>
  );
}

async function getApiKey(): Promise<string> {
  // The API key is handled by the edge function
  return '';
}
