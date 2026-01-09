"use client"

import { useState, type ReactNode } from "react"
import { LanguageContext } from "@/lib/language-context"
import type { Language } from "@/lib/translations"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}
