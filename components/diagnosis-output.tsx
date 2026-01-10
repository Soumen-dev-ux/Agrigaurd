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
  id: string
  title: string
  content: string[]
  type: 'issue' | 'severity' | 'prevention' | 'treatment' | 'recovery' | 'default'
}

export default function DiagnosisOutput({ diagnosis, language }: DiagnosisOutputProps) {
  const t = translations[language]

  // Robust line-by-line parsing logic
  const parseDiagnosis = (text: string): DiagnosisSection[] => {
    const lines = text.split('\n');
    const sections: DiagnosisSection[] = [];

    let currentTitle = t.problemDescription || "Overview";
    let currentContent: string[] = [];
    let currentType: DiagnosisSection['type'] = 'default';

    // Helper to determine section type from title
    const getSectionType = (title: string): DiagnosisSection['type'] => {
      const lower = title.toLowerCase();
      if (lower.includes("issue") || lower.includes("problem") || lower.includes("disease") || lower.includes("समस्या")) return 'issue';
      if (lower.includes("severity") || lower.includes("risk") || lower.includes("गंभीरता")) return 'severity';
      if (lower.includes("prevention") || lower.includes("prevent") || lower.includes("avoid") || lower.includes("रोकथाम")) return 'prevention';
      if (lower.includes("recommendation") || lower.includes("treatment") || lower.includes("solution") || lower.includes("step") || lower.includes("इलाज")) return 'treatment';
      if (lower.includes("recovery") || lower.includes("time") || lower.includes("पुनर्प्राप्ति")) return 'recovery';
      return 'default';
    }

    const startNewSection = (title: string, firstLine?: string) => {
      // Flush old
      if (currentContent.length > 0 || (sections.length === 0 && currentType === 'default')) { // always save the first default section if it has content or we need to clear it
        // Clean up
        const cleanedContent = currentContent.filter(l => l.trim().length > 0);
        if (cleanedContent.length > 0) {
          sections.push({
            id: `section-${sections.length}-${Math.random().toString(36).substr(2, 9)}`,
            title: currentTitle,
            content: cleanedContent,
            type: currentType
          });
        }
      }

      // Start new
      currentTitle = title;
      currentType = getSectionType(title);
      currentContent = firstLine ? [firstLine] : [];
    };

    // Regex for:
    // 1. **Title** or **Title:**
    // 2. ## Title
    // 3. 1. **Title**
    const headerRegex = /^(?:[\d\-\.\)]+\s*)?(?:\*\*|##|__)(.*?)(?:\*\*|##|__)?(?::)?\s*(.*)$/i;
    // Simple bold regex: **Text** at start of line

    for (const line of lines) {
      const match = line.match(headerRegex);
      // Check if it looks like a header (non-empty capture)
      if (match && match[1] && match[1].trim().length > 0 && match[1].trim().length < 50) {
        // match[1] is title, match[2] is remainder
        const formattedTitle = match[1].trim();
        const remainder = match[2]?.trim();
        startNewSection(formattedTitle, remainder);
      } else {
        const trimmed = line.trim();
        // Skip purely numeric lines that might be leftover lists "1."
        if (trimmed && !trimmed.match(/^\d+[\.)]$/)) {
          currentContent.push(line);
        }
      }
    }

    // Flush final
    const cleanedContent = currentContent.filter(l => l.trim().length > 0);
    if (cleanedContent.length > 0) {
      sections.push({
        id: `section-${sections.length}-${Math.random().toString(36).substr(2, 9)}`,
        title: currentTitle,
        content: cleanedContent,
        type: currentType
      });
    }

    return sections;
  }

  const sections = parseDiagnosis(diagnosis)

  const getSectionStyle = (type: DiagnosisSection['type']) => {
    switch (type) {
      case 'issue':
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
          bg: "bg-red-50 dark:bg-red-950/30",
          border: "border-red-200 dark:border-red-900",
          titleColor: "text-red-800 dark:text-red-300",
          shadow: "hover:shadow-red-500/10",
          gradient: "from-red-50 to-white dark:from-red-950/20 dark:to-background"
        }
      case 'severity':
        return {
          icon: <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
          bg: "bg-amber-50 dark:bg-amber-950/30",
          border: "border-amber-200 dark:border-amber-900",
          titleColor: "text-amber-800 dark:text-amber-300",
          shadow: "hover:shadow-amber-500/10",
          gradient: "from-amber-50 to-white dark:from-amber-950/20 dark:to-background"
        }
      case 'treatment':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
          bg: "bg-blue-50 dark:bg-blue-950/30",
          border: "border-blue-200 dark:border-blue-900",
          titleColor: "text-blue-800 dark:text-blue-300",
          shadow: "hover:shadow-blue-500/10",
          gradient: "from-blue-50 to-white dark:from-blue-950/20 dark:to-background"
        }
      case 'prevention':
        return {
          icon: <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
          border: "border-emerald-200 dark:border-emerald-900",
          titleColor: "text-emerald-800 dark:text-emerald-300",
          shadow: "hover:shadow-emerald-500/10",
          gradient: "from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background"
        }
      case 'recovery':
        return {
          icon: <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
          bg: "bg-purple-50 dark:bg-purple-950/30",
          border: "border-purple-200 dark:border-purple-900",
          titleColor: "text-purple-800 dark:text-purple-300",
          shadow: "hover:shadow-purple-500/10",
          gradient: "from-purple-50 to-white dark:from-purple-950/20 dark:to-background"
        }
      default:
        return {
          icon: <Info className="w-6 h-6 text-gray-600 dark:text-gray-400" />,
          bg: "bg-gray-50 dark:bg-gray-900/30",
          border: "border-gray-200 dark:border-gray-800",
          titleColor: "text-gray-800 dark:text-gray-300",
          shadow: "hover:shadow-gray-500/10",
          gradient: "from-gray-50 to-white dark:from-gray-900/10 dark:to-background"
        }
    }
  }

  // Helper to format inline markdown bold/italic
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, i) => {
      // Handle Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={i} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </span>
        );
      }

      // Handle Italic
      const subParts = part.split(/(\*[^\s*][^*]*?\*)/g);
      return (
        <span key={i}>
          {subParts.map((subPart, j) => {
            if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
              return (
                <span key={j} className="italic text-foreground/80 font-medium">
                  {subPart.slice(1, -1)}
                </span>
              );
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  const renderSection = (section: DiagnosisSection, className?: string) => {
    const style = getSectionStyle(section.type);

    return (
      <div
        key={section.id}
        className={cn(
          "rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
          "bg-gradient-to-br",
          style.gradient,
          style.border,
          style.shadow,
          className
        )}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={cn("p-2.5 rounded-xl bg-background/80 backdrop-blur-md border shadow-sm ring-1 ring-black/5")}>
            {style.icon}
          </div>
          <h3 className={cn("text-xl font-bold leading-tight mt-1.5", style.titleColor)}>{section.title}</h3>
        </div>

        <div className="space-y-3 pl-1">
          {section.content.map((line, idx) => {
            const trimmed = line.trim();

            // Handle sub-headers (###) content
            if (trimmed.startsWith('###')) {
              return (
                <h4 key={idx} className="text-base font-bold text-foreground mt-4 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-primary/40 rounded-full" />
                  {formatText(trimmed.replace(/^###\s*/, ''))}
                </h4>
              );
            }

            const isBullet = line.trim().startsWith("-") || line.trim().startsWith("*") || line.trim().match(/^\d+\./);
            const cleanLine = line.replace(/^[\-\*]\s*/, "");

            return (
              <div key={idx} className={cn("text-foreground/80 leading-relaxed text-[15px]", isBullet && "pl-3 relative")}>
                {isBullet ? (
                  <div className="flex gap-3">
                    <span className={cn("mt-[9px] w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current opacity-40")} />
                    <span>{formatText(cleanLine)}</span>
                  </div>
                ) : (
                  <p>{formatText(cleanLine)}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(diagnosis);
    // Ideally show a toast here, but for now simple action
  };

  // Layout Grouping
  const issueSections = sections.filter(s => s.type === 'issue');
  const severitySections = sections.filter(s => s.type === 'severity');
  const treatmentSections = sections.filter(s => s.type === 'treatment');
  const otherSections = sections.filter(s => !['issue', 'severity', 'treatment'].includes(s.type));

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* 1. Report Header */}
      <div className="bg-card rounded-xl border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t.diagnosisResult}</h2>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={handleCopy} className="p-2.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground" title="Copy to Clipboard">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
          </button>
          <button onClick={handlePrint} className="p-2.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground" title="Print Report">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
          </button>
        </div>
      </div>

      {sections.length > 0 ? (
        <div className="space-y-6">
          {/* Issue Section */}
          {issueSections.map(s => renderSection(s))}

          {/* Severity Section */}
          {severitySections.map(s => renderSection(s))}

          {/* Treatment Plan */}
          {treatmentSections.map(s => renderSection(s, "border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/10 dark:to-background"))}

          {/* Remaining Sections */}
          {otherSections.map(s => {
            if (s.title === "Overview" && issueSections.length === 0) return null;
            return renderSection(s);
          })}
        </div>
      ) : (
        <div className="p-8 bg-card rounded-xl border border-dashed border-border/60 text-center">
          <Stethoscope className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/80 leading-relaxed text-left inline-block max-w-full overflow-auto">
            {diagnosis}
          </pre>
        </div>
      )}

      <div className="text-center pt-8 border-t border-border/40">
        <p className="text-xs text-muted-foreground/60 max-w-lg mx-auto leading-relaxed">
          {t.disclaimer}
        </p>
      </div>
    </div >
  )
}
