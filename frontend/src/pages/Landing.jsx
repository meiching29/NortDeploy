import LandingNav from '../components/landing/LandingNav'
import HeroLeft from '../components/landing/HeroLeft'
import LandingFooter from '../components/landing/LandingFooter'
import CinematicOrb from '../components/landing/CinematicOrb'

export default function Landing() {
  return (
    <div className="min-h-screen bg-ndark relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-nred/[0.015] via-transparent to-ngold/[0.008]" />

      <CinematicOrb />

      <div className="relative z-10 flex flex-col min-h-screen">
        <LandingNav />

        <main className="flex-1 flex items-center w-full max-w-7xl mx-auto px-8 lg:px-20">
          <div className="w-full lg:w-[55%] 2xl:w-1/2 pt-28 lg:pt-24">
            <HeroLeft />
          </div>
        </main>

        <LandingFooter />
      </div>
    </div>
  )
}
