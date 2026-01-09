"use client"

import { X } from "lucide-react"

interface ImagePreviewProps {
  image: File | string
  onRemove: () => void
  type: "file" | "data"
}

export default function ImagePreview({ image, onRemove, type }: ImagePreviewProps) {
  const src = type === "file" ? URL.createObjectURL(image as File) : image

  return (
    <div className="relative mt-4 rounded-lg overflow-hidden">
      <img src={src || "/placeholder.svg"} alt="Preview" className="w-full h-auto object-cover rounded-lg" />
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
