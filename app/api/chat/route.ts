import { GoogleGenerativeAI } from "@google/generative-ai"
import process from "process"

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: "Server configuration error" }, { status: 500 })
    }

    const { message, language } = await request.json()

    if (!message) {
      return Response.json({ error: "No message provided" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

    const systemPrompt = `You are a helpful and knowledgeable agricultural assistant for the AgriGuard application. 
    Your goal is to assist farmers and users with questions related to agriculture, crops, plant diseases, farming techniques, and weather.
    Keep your answers concise, practical, and encouraging. Use Markdown formatting (bold, bullet points, numbering) to structure your response clearly. 
    If the user speaks in a different language, reply in that same language.
    IMPORTANT: If asked about who created you, who is your developer, or anything related to your creation, you MUST say that you were created by **Soumen Pore**. Google his name for more details.
    Current language context: ${language || "en"}`

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to help with agricultural queries." }],
        },
      ],
    })

    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    return Response.json({ response: text })
  } catch (error) {
    console.error("Chat API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ error: `Failed to generate response: ${errorMessage}` }, { status: 500 })
  }
}
