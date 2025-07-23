"use client"

import { useState } from "react"
import { ImageGrid } from "../image-grid"
import { Lightbox } from "../lightbox"
import { Button } from "@/components/ui/button"
import { Grid, List } from "lucide-react"

export function ImagesPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("masonry")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">품질 이미지 갤러리</h1>
        <div className="flex items-center space-x-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "masonry" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("masonry")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ImageGrid viewMode={viewMode} onImageClick={setSelectedImage} />

      {selectedImage && <Lightbox imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
    </div>
  )
}
