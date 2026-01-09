"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Camera } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"
import ImagePreview from "./image-preview"

interface InputSectionProps {
  cropDescription: string
  setCropDescription: (value: string) => void
  uploadedImage: File | null
  setUploadedImage: (file: File | null) => void
  cameraImage: string | null
  setCameraImage: (data: string | null) => void
}

export default function InputSection({
  cropDescription,
  setCropDescription,
  uploadedImage,
  setUploadedImage,
  cameraImage,
  setCameraImage,
}: InputSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  const { language } = useLanguage()
  const t = translations[language]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      setCameraImage(null)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (err) {
      console.error("Camera access denied:", err)
      alert("Unable to access camera")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        context.drawImage(videoRef.current, 0, 0)
        const imageData = canvasRef.current.toDataURL("image/jpeg")
        setCameraImage(imageData)
        setUploadedImage(null)
        stopCamera()
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setIsCameraActive(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Problem Description */}
      <div className="bg-card border border-border rounded-lg p-6">
        <label className="block text-sm font-semibold text-foreground mb-3">{t.problemDescription}</label>
        <textarea
          value={cropDescription}
          onChange={(e) => setCropDescription(e.target.value)}
          placeholder={t.problemPlaceholder}
          className="w-full h-32 px-4 py-3 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Image Upload */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm font-medium">{t.uploadImage}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

          <button
            onClick={() => (!isCameraActive ? startCamera() : stopCamera())}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm font-medium">{isCameraActive ? t.closeCamera : t.camera}</span>
          </button>
        </div>

        {/* Camera Preview */}
        {isCameraActive && (
          <div className="space-y-3">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black" />
            <button
              onClick={capturePhoto}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {t.capturePhoto}
            </button>
          </div>
        )}

        {/* Image Previews */}
        {uploadedImage && <ImagePreview image={uploadedImage} onRemove={() => setUploadedImage(null)} type="file" />}

        {cameraImage && <ImagePreview image={cameraImage} onRemove={() => setCameraImage(null)} type="data" />}
      </div>

      <canvas ref={canvasRef} className="hidden" width={640} height={480} />
    </div>
  )
}
