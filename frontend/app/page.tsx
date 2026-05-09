import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { PlannerDemo } from "@/components/landing/PlannerDemo";
import { QuizDemo } from "@/components/landing/QuizDemo";
import { TutorDemo } from "@/components/landing/TutorDemo";
import { ProgressDashboard } from "@/components/landing/ProgressDashboard";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="relative">
      <AnimatedBackground />
      <Navbar />
      <Hero />
      <Features />
      <PlannerDemo />
      <QuizDemo />
      <TutorDemo />
      <ProgressDashboard />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
