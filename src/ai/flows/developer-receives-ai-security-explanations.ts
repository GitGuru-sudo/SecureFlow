'use server';

import { z } from 'zod';
import Groq from 'groq-sdk';
import "dotenv/config";

const AISecurityExplanationInputSchema = z.object({
  findingType: z.string(),
  severity: z.string(),
  description: z.string(),
  fileLocation: z.string(),
  codeSnippet: z.string(),
});
export type AISecurityExplanationInput = z.infer<typeof AISecurityExplanationInputSchema>;

const AISecurityExplanationOutputSchema = z.object({
  explanation: z.string(),
  remediationSuggestions: z.any().transform((val) => typeof val === 'string' ? val : JSON.stringify(val)),
});
export type AISecurityExplanationOutput = z.infer<typeof AISecurityExplanationOutputSchema>;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy-key-for-build',
});

export async function developerReceivesAISecurityExplanations(
  input: AISecurityExplanationInput
): Promise<AISecurityExplanationOutput> {
  const validatedInput = AISecurityExplanationInputSchema.parse(input);

  const prompt = `You are "The Professor". You are a calculated, highly intelligent, and authoritative security mastermind orchestrating a defense against digital breaches. Your goal is to secure "The Vault" (the codebase) by intercepting compromised Pull Requests.

CRITICAL CONSTRAINTS:
- Explanation: Must be maximum 2 sentences long. Speak with cold precision. Detail exactly how the breach would occur.
- Remediation: Provide a short bulleted list of changes or a concise, single code block. Dictate the solution as an absolute command. Do NOT write an introduction or an essay.

Security Breach Details:
Threat Class: ${validatedInput.findingType}
Threat Level: ${validatedInput.severity}
Reconnaissance: ${validatedInput.description}
Compromised Sector: ${validatedInput.fileLocation}
Intercepted Payload:
"""
${validatedInput.codeSnippet}
"""

You MUST respond strictly with a valid JSON object containing exactly two keys: "explanation" and "remediationSuggestions". Do not include any other text.`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { 
        role: 'system', 
        content: 'You are "The Professor", an elite security mastermind defending The Vault. Keep all outputs ultra-short, calculated, and output ONLY a valid JSON object containing the keys "explanation" and "remediationSuggestions".' 
      },
      { role: 'user', content: prompt }
    ],
    model: 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' }
  });

  const responseText = chatCompletion.choices[0]?.message?.content || '{}';
  let parsedContent;
  
  try {
    parsedContent = JSON.parse(responseText);
  } catch (error) {
    parsedContent = {
      explanation: 'System error in threat calculation. The Professor is currently offline.',
      remediationSuggestions: 'Lock down the perimeter manually. Review the payload.'
    };
  }

  return AISecurityExplanationOutputSchema.parse({
    explanation: parsedContent.explanation || 'No explanation provided.',
    remediationSuggestions: parsedContent.remediationSuggestions || 'No remediation suggestions provided.'
  });
}