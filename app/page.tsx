"use client"

import { useState } from "react"
import Header from "@/components/header"
import InputSection from "@/components/input-section"
import DiagnosisOutput from "@/components/diagnosis-output"
import Footer from "@/components/footer"
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
        let errorMessage = "Failed to analyze"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          const errorText = await response.text()
          if (response.status === 413) {
            errorMessage = "Image is too large. Please use a smaller image."
          } else {
            errorMessage = errorText || errorMessage
          }
        }
        throw new Error(errorMessage)
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
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 md:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Input Section */}
          <div className="space-y-6 lg:col-span-2">
            <InputSection
              cropDescription={cropDescription}
              setCropDescription={setCropDescription}
              uploadedImage={uploadedImage}
              setUploadedImage={setUploadedImage}
              cameraImage={cameraImage}
              setCameraImage={setCameraImage}
            />

            {/* Analyze Button - Moved inside this column */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                t.analyzeButton
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl animate-in slide-in-from-top-2">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="min-h-[500px] lg:col-span-3">
            {isAnalyzing ? (
              <div className="sticky top-8 bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 flex flex-col items-center justify-center h-[500px] shadow-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="relative w-16 h-16 text-primary animate-spin" />
                </div>
                <p className="mt-6 text-lg font-medium text-muted-foreground animate-pulse">{t.analyzing}</p>
              </div>
            ) : diagnosis ? (
              <div className="sticky top-8">
                <DiagnosisOutput diagnosis={diagnosis} language={language} />
              </div>
            ) : (
              <div className="sticky top-8 bg-secondary/5 border border-dashed border-secondary/30 rounded-xl p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground/80 mb-2">Ready to Analyze</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">{t.resultsMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
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
