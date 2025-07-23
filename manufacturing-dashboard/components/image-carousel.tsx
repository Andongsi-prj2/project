"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showOverlay, setShowOverlay] = useState(false)

  // TODO: Replace with actual image data from GraphQL
  const images = [
    {
      id: 1,
      url: "/KEMP_IMG_DATA_Error_12.png",
      type: "OK",
      hasViolation: false,
    },
    {
      id: 2,
      url: "/KEMP_IMG_DATA_Error_12.png",
      type: "NG",
      hasViolation: true,
    },
    {
      id: 3,
      url: "/KEMP_IMG_DATA_Error_12.png",
      type: "OK",
      hasViolation: false,
    },
  ]

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const currentImage = images[currentIndex]

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={currentImage.url}
              alt={`품질 이미지 ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {showOverlay && currentImage.hasViolation && (
            <div className="absolute inset-0 bg-red-500/20 border-2 border-red-500 rounded-lg">
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">규칙 위반</div>
            </div>
          )}
        </div>

        <div className="absolute inset-y-0 left-0 flex items-center">
          <Button variant="ghost" size="sm" onClick={prevImage} className="bg-black/50 text-white hover:bg-black/70">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button variant="ghost" size="sm" onClick={nextImage} className="bg-black/50 text-white hover:bg-black/70">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              currentImage.type === "OK" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
            }`}
          >
            {currentImage.type}
          </span>
          <span className="text-sm text-gray-400">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOverlay(!showOverlay)}
          className="text-gray-400 hover:text-white"
        >
          {showOverlay ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="ml-2">위반 표시</span>
        </Button>
      </div>
    </div>
  )
}
