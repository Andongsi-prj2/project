"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"

interface LightboxProps {
  imageUrl: string
  onClose: () => void
}

export function Lightbox({ imageUrl, onClose }: LightboxProps) {
  const [zoom, setZoom] = useState(1)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 0.5))

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="확대된 이미지"
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          />

          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="bg-black/50 text-white hover:bg-black/70">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Button variant="ghost" size="sm" className="bg-black/50 text-white hover:bg-black/70">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Button variant="ghost" size="sm" className="bg-black/50 text-white hover:bg-black/70">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
