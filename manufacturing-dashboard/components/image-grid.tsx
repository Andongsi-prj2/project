"use client"

import { motion } from "framer-motion"

interface ImageGridProps {
  viewMode: "grid" | "masonry"
  onImageClick: (imageUrl: string) => void
}

export function ImageGrid({ viewMode, onImageClick }: ImageGridProps) {
  // TODO: Replace with actual GraphQL query using filters from FilterCtx
  const images = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    url: "/KEMP_IMG_DATA_Error_12.png",
    type: Math.random() > 0.7 ? "NG" : "OK",
    hasViolation: Math.random() > 0.8,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toLocaleString("ko-KR"),
  }))

  if (viewMode === "masonry") {
    return (
      <div className="masonry-grid">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            className="masonry-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div
              className="relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
              onClick={() => onImageClick(image.url)}
            >
              <img src={image.url || "/placeholder.svg"} alt={`품질 이미지 ${image.id}`} className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      image.type === "OK" ? "bg-green-900/80 text-green-400" : "bg-red-900/80 text-red-400"
                    }`}
                  >
                    {image.type}
                  </span>
                  {image.hasViolation && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-900/80 text-yellow-400">위반</span>
                  )}
                </div>
                <div className="text-xs text-gray-300 mt-1">{image.timestamp}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all aspect-square"
          onClick={() => onImageClick(image.url)}
        >
          <img
            src={image.url || "/placeholder.svg"}
            alt={`품질 이미지 ${image.id}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  image.type === "OK" ? "bg-green-900/80 text-green-400" : "bg-red-900/80 text-red-400"
                }`}
              >
                {image.type}
              </span>
              {image.hasViolation && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-900/80 text-yellow-400">위반</span>
              )}
            </div>
            <div className="text-xs text-gray-300 mt-1">{image.timestamp}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
