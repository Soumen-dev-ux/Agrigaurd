"use client"

import { CheckCircle2, AlertCircle, Leaf, Zap, Clock, Shield } from "lucide-react"
import type { Language } from "@/lib/translations"
import { translations } from "@/lib/translations"

interface DiagnosisOutputProps {
  diagnosis: string
  language: Language
}

export default function DiagnosisOutput({ diagnosis, language }: DiagnosisOutputProps) {
  const t = translations[language]
  const sections = diagnosis.split("**").filter((s) => s.trim())

  return (
    <div className="bg-gradient-to-br from-card to-card/95 border border-border rounded-xl p-6 space-y-5 max-h-[75vh] overflow-y-auto shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border/50">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{t.diagnosisResult}</h2>
      </div>

      {/* Content Sections */}
      <div className="space-y-5">
        {sections.map((section, idx) => {
          const cleanSection = section.trim()
          if (!cleanSection) return null

          const lines = cleanSection.split("\n").filter((l) => l.trim())
          const isHeader = lines[0] && !lines[0].startsWith("•")
          const headerText = isHeader ? lines[0] : null
          const contentLines = isHeader ? lines.slice(1) : lines

          let icon = <Leaf className="w-5 h-5" />
          if (headerText?.includes("Issue") || headerText?.includes("समस्या") || headerText?.includes("Problem")) {
            icon = <AlertCircle className="w-5 h-5" />
          } else if (
            headerText?.includes("Severity") ||
            headerText?.includes("गंभीरता") ||
            headerText?.includes("Severity")
          ) {
            icon = <Zap className="w-5 h-5" />
          } else if (
            headerText?.includes("Prevention") ||
            headerText?.includes("रोकथाम") ||
            headerText?.includes("Prevention")
          ) {
            icon = <Shield className="w-5 h-5" />
          } else if (
            headerText?.includes("Recovery") ||
            headerText?.includes("पुनर्प्राप्ति") ||
            headerText?.includes("Recovery")
          ) {
            icon = <Clock className="w-5 h-5" />
          }

          return (
            <div key={idx} className="bg-background/40 border border-border/30 rounded-lg p-4 space-y-3">
              {headerText && (
                <div className="flex items-center gap-2">
                  <div className="text-primary">{icon}</div>
                  <h3 className="font-bold text-foreground text-base">{headerText}</h3>
                </div>
              )}

              <div className="space-y-2 ml-7">
                {contentLines.map((line, lineIdx) => {
                  const trimmedLine = line.trim()
                  if (trimmedLine.startsWith("•")) {
                    return (
                      <div key={lineIdx} className="flex gap-2 text-sm text-foreground/90">
                        <span className="text-primary font-semibold min-w-fit">→</span>
                        <span className="leading-relaxed">{trimmedLine.substring(1).trim()}</span>
                      </div>
                    )
                  } else if (trimmedLine) {
                    return (
                      <p key={lineIdx} className="text-sm text-foreground/85 leading-relaxed">
                        {trimmedLine}
                      </p>
                    )
                  }
                  return null
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Disclaimer Footer */}
      <div className="mt-6 pt-4 border-t border-border/50 bg-amber-50/30 dark:bg-amber-950/10 rounded-lg p-3">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{t.disclaimer}</p>
        </div>
      </div>
    </div>
  )
}
