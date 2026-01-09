"use client"

import { useState } from "react"
import Header from "@/components/header"
import InputSection from "@/components/input-section"
import DiagnosisOutput from "@/components/diagnosis-output"
import { LanguageProvider } from "@/components/language-provider"
import { useLanguage } from "@/hooks/use-language"
import { Loader2 } from "lucide-react"
import { translations } from "@/lib/translations"

function PageContent() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<string | null>(null)
  const [cropDescription, setCropDescription] = useState("")
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [cameraImage, setCameraImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { language } = useLanguage()
  const t = translations[language]

  const handleAnalyze = async () => {
    if (!cropDescription && !uploadedImage && !cameraImage) {
      alert("Please provide crop problem description or image")
      return
    }

    setIsAnalyzing(true)
    setDiagnosis(null)
    setError(null)

    try {
      let imageBase64: string | null = null

      if (uploadedImage) {
        const reader = new FileReader()
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(uploadedImage)
        })
      } else if (cameraImage) {
        imageBase64 = cameraImage
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: cropDescription,
          imageBase64,
          language,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze")
      }

      const data = await response.json()
      setDiagnosis(data.diagnosis)
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      console.error("Analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <InputSection
              cropDescription={cropDescription}
              setCropDescription={setCropDescription}
              uploadedImage={uploadedImage}
              setUploadedImage={setUploadedImage}
              cameraImage={cameraImage}
              setCameraImage={setCameraImage}
            />

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                t.analyzeButton
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="lg:col-span-1">
            {isAnalyzing ? (
              <div className="sticky top-8 bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center min-h-96">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground text-center">{t.analyzing}</p>
              </div>
            ) : diagnosis ? (
              <div className="sticky top-8">
                <DiagnosisOutput diagnosis={diagnosis} language={language} />
              </div>
            ) : (
              <div className="sticky top-8 bg-secondary/10 border border-secondary/20 rounded-lg p-6 text-center">
                <p className="text-muted-foreground text-sm">{t.resultsMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Page() {
  return (
    <LanguageProvider>
      <PageContent />
    </LanguageProvider>
  )
}
