"use client"

import { CheckCircle2, AlertCircle, Leaf, Zap, Shield, Stethoscope, Clock, Info } from "lucide-react"
import type { Language } from "@/lib/translations"
import { translations } from "@/lib/translations"
import { cn } from "@/lib/utils"

interface DiagnosisOutputProps {
  diagnosis: string
  language: Language
}

interface DiagnosisSection {
  title: string
  content: string
  type: 'issue' | 'severity' | 'prevention' | 'treatment' | 'recovery' | 'default'
}

export default function DiagnosisOutput({ diagnosis, language }: DiagnosisOutputProps) {
  const t = translations[language]

  // Robust parsing logic
  const parseDiagnosis = (text: string): DiagnosisSection[] => {
    // Regex matches between bold markers: **Title** Content...
    // The capture group (.*?) captures the Title inside **...**
    const parts = text.split(/\*\*(.*?)\*\*/g)
    const sections: DiagnosisSection[] = []

    // Handle initial content (before any bold header) as Overview/Pre-text
    if (parts[0]?.trim()) {
      sections.push({
        title: t.problemDescription || "Overview",
        content: parts[0].trim(),
        type: 'default'
      })
    }

    // parts[0] is pre-text (or empty)
    // parts[1] is Header 1
    // parts[2] is Content 1
    // parts[3] is Header 2
    // parts[4] is Content 2...
    for (let i = 1; i < parts.length; i += 2) {
      const titleRaw = parts[i] || ""
      const title = titleRaw.trim().replace(/:$/, '') // Remove trailing colon
      const content = parts[i + 1]?.trim()

      // Even if content is empty, sometimes the Header itself is the information (e.g. key-value on one line?)
      // But usually Gemini outputs: **Title:** Content
      if (!title && !content) continue

      const lowerTitle = title.toLowerCase()
      let type: DiagnosisSection['type'] = 'default'

      if (lowerTitle.includes("issue") || lowerTitle.includes("problem") || lowerTitle.includes("समस्या")) type = 'issue'
      else if (lowerTitle.includes("severity") || lowerTitle.includes("गंभीरता")) type = 'severity'
      else if (lowerTitle.includes("prevention") || lowerTitle.includes("prevent") || lowerTitle.includes("रोकथाम")) type = 'prevention'
      else if (lowerTitle.includes("treatment") || lowerTitle.includes("recommendation") || lowerTitle.includes("solution") || lowerTitle.includes("इलाज") || lowerTitle.includes("सुझाव")) type = 'treatment'
      else if (lowerTitle.includes("recovery") || lowerTitle.includes("पुनर्प्राप्ति")) type = 'recovery'

      // Skip if it's just a random bold word in middle of nowhere without content? 
      // No, for diagnosis, usually structural.
      if (content) {
        sections.push({ title, content, type })
      }
    }

    return sections
  }

  const sections = parseDiagnosis(diagnosis)

  const getSectionStyle = (type: DiagnosisSection['type']) => {
    switch (type) {
      case 'issue':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
          bg: "bg-red-50 dark:bg-red-950/20",
          border: "border-red-200 dark:border-red-900/30",
          headerColor: "text-red-700 dark:text-red-300",
          iconBg: "bg-white dark:bg-red-900/40"
        }
      case 'severity':
        return {
          icon: <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          bg: "bg-amber-50 dark:bg-amber-950/20",
          border: "border-amber-200 dark:border-amber-900/30",
          headerColor: "text-amber-700 dark:text-amber-300",
          iconBg: "bg-white dark:bg-amber-900/40"
        }
      case 'prevention':
        return {
          icon: <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          bg: "bg-emerald-50 dark:bg-emerald-950/20",
          border: "border-emerald-200 dark:border-emerald-900/30",
          headerColor: "text-emerald-700 dark:text-emerald-300",
          iconBg: "bg-white dark:bg-emerald-900/40"
        }
      case 'treatment':
        return {
          icon: <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          bg: "bg-blue-50 dark:bg-blue-950/20",
          border: "border-blue-200 dark:border-blue-900/30",
          headerColor: "text-blue-700 dark:text-blue-300",
          iconBg: "bg-white dark:bg-blue-900/40"
        }
      case 'recovery':
        return {
          icon: <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
          bg: "bg-purple-50 dark:bg-purple-950/20",
          border: "border-purple-200 dark:border-purple-900/30",
          headerColor: "text-purple-700 dark:text-purple-300",
          iconBg: "bg-white dark:bg-purple-900/40"
        }
      default:
        return {
          icon: <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
          bg: "bg-gray-50 dark:bg-gray-900/20",
          border: "border-gray-200 dark:border-gray-800",
          headerColor: "text-gray-700 dark:text-gray-300",
          iconBg: "bg-white dark:bg-gray-800"
        }
    }
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="relative bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden">

        {/* Header Ribbon */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

        {/* Global Header */}
        <div className="p-6 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {t.diagnosisResult}
              </h2>
              <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
          </div>
        </div>

        {/* Sections Container */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {sections.length > 0 ? sections.map((section, idx) => {
            const style = getSectionStyle(section.type)
            const lines = section.content.split('\n').filter(l => l.trim())

            return (
              <div
                key={idx}
                className={cn(
                  "rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-sm",
                  style.bg,
                  style.border
                )}
              >
                {/* Section Header */}
                <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
                  <div className={cn("p-1.5 rounded-md shadow-sm", style.iconBg)}>
                    {style.icon}
                  </div>
                  <h3 className={cn("font-semibold text-lg", style.headerColor)}>
                    {section.title}
                  </h3>
                </div>

                {/* Section Content */}
                <div className="p-4 bg-background/50 dark:bg-background/20">
                  <div className="space-y-2">
                    {lines.map((line, lineIdx) => {
                      const trimmed = line.trim()
                      const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")
                      const content = isBullet ? trimmed.substring(1).trim() : trimmed

                      return (
                        <div key={lineIdx} className="flex gap-2.5 items-start text-foreground/80">
                          {isBullet && (
                            <div className={cn("mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0", style.headerColor.split(' ')[0].replace('text-', 'bg-'))} />
                          )}
                          <p className={cn("text-sm leading-relaxed", !isBullet && "font-medium text-foreground/90")}>
                            {content}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No structued diagnosis available.</p>
              <pre className="mt-4 text-xs text-left bg-muted p-2 rounded overflow-auto max-h-40">{diagnosis}</pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            {t.disclaimer}
          </p>
        </div>
      </div>
    </div>
  )
}
