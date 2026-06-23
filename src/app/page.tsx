import { LandingScene } from "@/components/3d/LandingScene"
import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { CtaSection } from "@/components/landing/CtaSection"
import { Footer } from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <>
      <LandingScene />
      <Navbar />
      <Hero />
      <Features />
      <CtaSection />
      <Footer />
    </>
  )
}
