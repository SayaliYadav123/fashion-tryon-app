import { HeroSection } from "@/components/hero-section"
import { TryOnSection } from "@/components/try-on-section"

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TryOnSection />
      
      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-medium text-foreground">StyleMorph</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered virtual try-on technology
            </p>
            <nav className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
              <a href="#" className="transition-colors hover:text-foreground">Terms</a>
              <a href="#" className="transition-colors hover:text-foreground">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  )
}
