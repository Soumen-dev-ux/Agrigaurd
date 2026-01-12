"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { Mic, X, MessageSquare, Loader2, Volume2, StopCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { LanguageContext } from "@/lib/language-context"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [inputText, setInputText] = useState("")

  const recognitionRef = useRef<any>(null) // Using any for SpeechRecognition to avoid TS complex setup
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const languageContext = useContext(LanguageContext)
  const currentLanguage = languageContext?.language || "en"

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = currentLanguage === 'en' ? 'en-US' : currentLanguage

        recognition.onstart = () => setIsListening(true)

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputText(transcript)
          handleSendMessage(transcript)
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [currentLanguage])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])


  const startListening = () => {
    if (recognitionRef.current) {
      // Always stop first to ensure clean state
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore error if already stopped
      }

      // Stop speaking if currently speaking
      window.speechSynthesis.cancel()
      setIsSpeaking(false)

      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error("Recognition start error", e)
      }
    } else {
      alert("Speech Recognition is not supported in this browser.")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const speakText = (text: string) => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)

      // Wait for voices to load if they haven't
      let voices = window.speechSynthesis.getVoices()

      const setVoice = () => {
        voices = window.speechSynthesis.getVoices()

        // First priority: Female voice in current language
        let selectedVoice = voices.find(voice =>
          (voice.name.toLowerCase().includes("female") ||
            voice.name.includes("Google") ||
            voice.name.includes("Zira")) &&
          voice.lang.startsWith(currentLanguage)
        )

        // Second priority: Any voice in current language
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.startsWith(currentLanguage))
        }

        // Third priority: English female voice (if lang not found)
        if (!selectedVoice) {
          selectedVoice = voices.find(voice =>
            (voice.name.toLowerCase().includes("female") ||
              voice.name.includes("Zira")) &&
            voice.lang.startsWith('en')
          )
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice
          utterance.lang = selectedVoice.lang
        } else {
          // Fallback
          utterance.lang = currentLanguage
        }

        utterance.volume = 1
        utterance.rate = 1
        utterance.pitch = 1

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)

        window.speechSynthesis.speak(utterance)
      }

      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = setVoice
      } else {
        setVoice()
      }
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const newMessage: Message = { role: "user", content: text }
    setMessages((prev) => [...prev, newMessage])
    setInputText("")
    setIsProcessing(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language: currentLanguage }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      if (data.response) {
        const aiMessage: Message = { role: "assistant", content: data.response }
        setMessages((prev) => [...prev, aiMessage])
        speakText(data.response)
      } else {
        console.error("No response from API")
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage = error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again."
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errorMessage}` }])
      speakText("Sorry, I encountered an error.")
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full h-16 w-16 shadow-lg bg-green-600 hover:bg-green-700 text-white p-0 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              <Mic className="h-8 w-8 relative z-10" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 md:w-full md:max-w-md shadow-2xl"
          >
            <Card className="border-green-100 dark:border-green-900 border-2 overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-zinc-950/95">
              <CardHeader className="bg-green-50 dark:bg-green-950/30 pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg text-green-700 dark:text-green-400 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    AgriGuard Assistant
                  </CardTitle>
                  <CardDescription>Ask me anything about your crops</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 -mr-2">
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[50vh] md:h-[400px] p-4" ref={scrollAreaRef as any}>
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-10">
                        <Mic className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>Tap the microphone to start asking questions.</p>
                      </div>
                    )}

                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex w-full mb-2",
                          m.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                            m.role === "user"
                              ? "bg-green-600 text-white rounded-br-none"
                              : "bg-muted text-foreground rounded-bl-none"
                          )}
                        >
                          {m.role === "user" ? (
                            m.content
                          ) : (
                            <ReactMarkdown
                              components={{
                                p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                ul: ({ children }: any) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                ol: ({ children }: any) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                li: ({ children }: any) => <li>{children}</li>,
                                strong: ({ children }: any) => <span className="font-semibold">{children}</span>,
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    ))}

                    {isProcessing && (
                      <div className="flex justify-start w-full mb-2">
                        <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                          <span className="text-xs text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-3 bg-muted/30 border-t flex gap-2">
                <div className="relative flex-1">
                  <input
                    className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                    placeholder="Type or speak..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage(inputText)
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1 h-8 w-8 text-green-600"
                    onClick={() => handleSendMessage(inputText)}
                    disabled={!inputText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  size="icon"
                  onClick={toggleListening}
                  className={cn(
                    "rounded-full h-10 w-10 transition-all duration-300 shadow-sm",
                    isListening
                      ? "bg-red-500 hover:bg-red-600 animate-pulse text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  )}
                >
                  {isListening ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
