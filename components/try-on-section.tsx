"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, Download, Sparkles, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UploadBoxProps {
  label: string
  sublabel: string
  file: File | null
  preview: string | null
  onFileSelect: (file: File) => void
  onRemove: () => void
}

function UploadBox({ label, sublabel, file, preview, onFileSelect, onRemove }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      onFileSelect(droppedFile)
    }
  }, [onFileSelect])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-serif text-xl font-medium text-foreground">{label}</h3>
        <span className="text-sm text-muted-foreground">{sublabel}</span>
      </div>
      <div
        onClick={() => !preview && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed transition-all duration-300",
          isDragging 
            ? "border-foreground bg-muted" 
            : "border-border bg-card hover:border-foreground/40 hover:bg-muted/50",
          preview && "cursor-default border-solid border-border"
        )}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt={label}
              className="h-full w-full object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="absolute right-3 top-3 rounded-full bg-foreground/80 p-1.5 text-background transition-colors hover:bg-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
            <div className="rounded-full bg-muted p-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Drop your image here</p>
              <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}

export function TryOnSection() {
  const [photoA, setPhotoA] = useState<File | null>(null)
  const [photoB, setPhotoB] = useState<File | null>(null)
  const [previewA, setPreviewA] = useState<string | null>(null)
  const [previewB, setPreviewB] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelectA = (file: File) => {
    setPhotoA(file)
    setPreviewA(URL.createObjectURL(file))
    setResult(null)
  }

  const handleFileSelectB = (file: File) => {
    setPhotoB(file)
    setPreviewB(URL.createObjectURL(file))
    setResult(null)
  }

  const handleRemoveA = () => {
    setPhotoA(null)
    if (previewA) URL.revokeObjectURL(previewA)
    setPreviewA(null)
    setResult(null)
  }

  const handleRemoveB = () => {
    setPhotoB(null)
    if (previewB) URL.revokeObjectURL(previewB)
    setPreviewB(null)
    setResult(null)
  }

  const handleGenerate = async () => {
    if (!photoA || !photoB) return
    
    setIsGenerating(true)
    setError(null)
    setResult(null)
    
    try {
      const formData = new FormData()
      formData.append('personImage', photoA)
      formData.append('outfitImage', photoB)

      const response = await fetch('/api/try-on', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate try-on image')
      }

      if (data.image) {
        const imageUrl = `data:${data.image.mediaType};base64,${data.image.base64}`
        setResult(imageUrl)
      } else {
        throw new Error('No image generated')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!result) return
    
    try {
      const response = await fetch(result)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement("a")
      link.href = url
      link.download = "stylemorph-result.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch {
      // Fallback for data URLs
      const link = document.createElement("a")
      link.href = result
      link.download = "stylemorph-result.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const canGenerate = photoA && photoB && !isGenerating

  return (
    <section id="try-on" className="min-h-screen bg-background px-6 py-20 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Virtual Try-On
          </span>
          <h2 className="mt-4 font-serif text-4xl font-light text-foreground md:text-5xl text-balance">
            See Yourself in Any Look
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Upload your photo and the outfit you want to try. Our AI does the rest.
          </p>
        </div>

        {/* Upload Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {/* Photo A - Your Photo */}
          <UploadBox
            label="Your Photo"
            sublabel="Photo A"
            file={photoA}
            preview={previewA}
            onFileSelect={handleFileSelectA}
            onRemove={handleRemoveA}
          />

          {/* Photo B - Outfit Photo */}
          <UploadBox
            label="Outfit Photo"
            sublabel="Photo B"
            file={photoB}
            preview={previewB}
            onFileSelect={handleFileSelectB}
            onRemove={handleRemoveB}
          />

          {/* Result Preview */}
          <div className="flex flex-col gap-3 md:col-span-2 lg:col-span-1">
            <div className="flex items-baseline justify-between">
              <h3 className="font-serif text-xl font-medium text-foreground">Result</h3>
              <span className="text-sm text-muted-foreground">Your new look</span>
            </div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-border bg-muted/30">
              {isGenerating ? (
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-foreground" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 animate-pulse text-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Creating your look...</p>
                </div>
              ) : error ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
                  <div className="rounded-full bg-destructive/10 p-4">
                    <X className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="text-center text-sm text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setError(null)}
                  >
                    Try Again
                  </Button>
                </div>
              ) : result ? (
                <img
                  src={result}
                  alt="Generated result"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
                  <div className="rounded-full bg-muted p-4">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Your generated look will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            size="lg"
            className="w-full gap-2 sm:w-auto"
          >
            <Sparkles className="h-4 w-4" />
            Generate Look
          </Button>
          
          <Button
            onClick={handleDownload}
            disabled={!result}
            variant="outline"
            size="lg"
            className="w-full gap-2 sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Download Result
          </Button>
        </div>

        {/* Tips */}
        <div className="mt-16 rounded-lg border border-border bg-card p-6 md:p-8">
          <h3 className="font-serif text-lg font-medium text-foreground">Tips for Best Results</h3>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
              Use a clear, front-facing photo of yourself
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
              Choose outfit photos with visible clothing details
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
              Good lighting improves generation quality
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
              Avoid busy backgrounds for cleaner results
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
