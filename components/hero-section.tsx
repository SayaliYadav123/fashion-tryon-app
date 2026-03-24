"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const scrollProgress = Math.max(0, -rect.top / rect.height)
        setScrollY(scrollProgress)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scale = 1 + scrollY * 0.3
  const opacity = Math.max(0, 1 - scrollY * 1.5)

  return (
    <section 
      ref={heroRef}
      className="relative h-[100vh] overflow-hidden"
    >
      {/* Background Image with Zoom Effect */}
      <div 
        className="absolute inset-0 transition-transform duration-100 ease-out"
        style={{ 
          transform: `scale(${scale})`,
        }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('/images/hero-fashion.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-foreground/30" />
      </div>

      {/* Content Overlay */}
      <div 
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        style={{ opacity }}
      >
        <span className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-card">
          AI-Powered Fashion
        </span>
        <h1 className="font-serif text-5xl font-light leading-tight text-card md:text-7xl lg:text-8xl text-balance">
          Try On Any Outfit
          <br />
          <span className="italic">Instantly</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-card/90 md:text-xl">
          Upload your photo and any outfit to see yourself in stunning new looks. 
          Our AI seamlessly blends fashion onto you.
        </p>
        <a
          href="#try-on"
          className="mt-10 flex flex-col items-center gap-2 text-card transition-opacity hover:opacity-80"
        >
          <span className="text-sm font-medium uppercase tracking-wider">Start Now</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </a>
      </div>
    </section>
  )
}
