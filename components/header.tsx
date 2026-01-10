"use client"

import { Leaf, Globe } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { translations, type Language } from "@/lib/translations"

export default function Header() {
  const { language, setLanguage } = useLanguage()

  const languages: { code: Language; name: string; region?: string }[] = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी", region: "Hindi" },
    { code: "ta", name: "தமிழ்", region: "Tamil" },
    { code: "te", name: "తెలుగు", region: "Telugu" },
    { code: "kn", name: "ಕನ್ನಡ", region: "Kannada" },
    { code: "ml", name: "മലയാളം", region: "Malayalam" },
    { code: "mr", name: "मराठी", region: "Marathi" },
    { code: "bn", name: "বাংলা", region: "Bengali" },
    { code: "gu", name: "ગુજરાતી", region: "Gujarati" },
    { code: "pa", name: "ਪੰਜਾਬੀ", region: "Punjabi" },
    { code: "od", name: "ଓଡିଆ", region: "Odia" },
  ]

  const t = translations[language]

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">
                {t.appTitle} <span className="ml-1">🌿</span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">{t.appSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-input border border-border rounded-lg p-1">
            <Globe className="w-5 h-5 text-muted-foreground ml-2" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="px-2 py-2 bg-transparent text-sm text-foreground focus:outline-none cursor-pointer font-medium"
              aria-label="Select language"
              title={`Current: ${languages.find((l) => l.code === language)?.region || "English"}`}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}
