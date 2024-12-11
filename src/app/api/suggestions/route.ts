import { OpenAIStream } from "@/lib/openai-stream"
import { StreamingTextResponse } from "ai"

export async function GET() {
  const prompt = `Generate 4 different questions about nutrition and healthy eating. 
  Format the response as a JSON array of strings. 
  Make the questions diverse and interesting.
  Example format: ["question 1", "question 2", "question 3", "question 4"]`

  const response = await OpenAIStream(prompt)
  return new StreamingTextResponse(response)
} 