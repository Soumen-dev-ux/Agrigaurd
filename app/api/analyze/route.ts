import { GoogleGenerativeAI, Part } from "@google/generative-ai"
import process from "process"



export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set")
      return Response.json({ error: "Server configuration error: GEMINI_API_KEY is missing" }, { status: 500 })
    }

    const { description, imageBase64, language } = await request.json()

    if (!description && !imageBase64) {
      return Response.json({ error: "Please provide crop description or image" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const languageInstructions: Record<string, string> = {
      en: "in English",
      hi: "in Hindi",
      ta: "in Tamil",
      te: "in Telugu",
      kn: "in Kannada",
      ml: "in Malayalam",
      mr: "in Marathi",
      bn: "in Bengali",
      gu: "in Gujarati",
      pa: "in Punjabi",
      od: "in Odia",
    }

    const langInstruction = languageInstructions[language] || "in English"

    const prompt = `You are an expert agricultural scientist. Analyze the crop problem described and provide a detailed diagnosis ${langInstruction}.

Crop Problem Description: ${description || "Image analysis only"}

Please provide:
1. **Detected Issue:** Name of the disease or problem
2. **Severity:** Assessment of how severe the problem is
3. **Recommendations:** Specific actionable steps to treat the problem
4. **Prevention Tips:** How to prevent this in the future
5. **Expected Recovery Time:** Estimated time for recovery with proper treatment

Format the response with clear sections and bullet points for recommendations.`

    const parts: Part[] = [{ text: prompt }]

    if (imageBase64) {
      // Extract base64 data correctly (remove header if present)
      const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      })
    }

    const result = await model.generateContent(parts)
    const response = await result.response
    const diagnosis = response.text()

    return Response.json({ diagnosis })
  } catch (error) {
    console.error("Gemini API error details:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return Response.json({ error: `Failed to analyze crop problem: ${errorMessage}` }, { status: 500 })
  }
}
