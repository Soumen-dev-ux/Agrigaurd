"use client"

import { useState, useEffect } from "react"
import { 
  Cloud, 
  CloudDrizzle, 
  CloudFog, 
  CloudLightning, 
  CloudRain, 
  CloudSnow, 
  CloudSun, 
  Loader2, 
  MapPinOff, 
  Sun 
} from "lucide-react"

// Open-Meteo Weather Codes Mapping
const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun className="w-5 h-5 text-yellow-500" />
  if ([1, 2].includes(code)) return <CloudSun className="w-5 h-5 text-gray-400" />
  if ([3].includes(code)) return <Cloud className="w-5 h-5 text-gray-500" />
  if ([45, 48].includes(code)) return <CloudFog className="w-5 h-5 text-gray-400" />
  if ([51, 53, 55, 56, 57].includes(code)) return <CloudDrizzle className="w-5 h-5 text-blue-400" />
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain className="w-5 h-5 text-blue-500" />
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow className="w-5 h-5 text-blue-200" />
  if ([95, 96, 99].includes(code)) return <CloudLightning className="w-5 h-5 text-yellow-600" />
  
  return <Cloud className="w-5 h-5 text-gray-500" />
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported")
      setLoading(false)
      return
    }

    // Use a small timeout to not permanently spin if user ignores the prompt
    const timeoutId = setTimeout(() => {
       if (loading) {
         setLoading(false)
       }
    }, 10000)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeoutId)
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
          )
          
          if (!res.ok) throw new Error("Failed to fetch weather")
          
          const data = await res.json()
          setWeather({
            temp: data.current.temperature_2m,
            code: data.current.weather_code
          })
        } catch (err) {
          setError("Failed to fetch weather data")
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        clearTimeout(timeoutId)
        setError("Location access denied or unavailable")
        setLoading(false)
      },
      { timeout: 10000 }
    )

    return () => clearTimeout(timeoutId)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-input/50 border border-border rounded-lg px-3 py-1.5 min-h-[38px] animate-pulse">
        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        <span className="text-sm text-muted-foreground font-medium hidden sm:inline-block">Loading...</span>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div 
        className="flex items-center gap-2 bg-input/50 border border-border rounded-lg px-3 py-1.5 min-h-[38px]"
        title={error || "Weather unavailable"}
      >
        <MapPinOff className="w-4 h-4 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-input border border-border rounded-lg px-3 py-1.5 shadow-sm hover:bg-input/80 transition-colors cursor-default min-h-[38px]">
      {getWeatherIcon(weather.code)}
      <span className="text-sm font-medium text-foreground">
        {Math.round(weather.temp)}°C
      </span>
    </div>
  )
}
