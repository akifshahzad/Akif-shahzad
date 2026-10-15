import Seo from "../components/ui/Seo";
import Hero from "../components/sections/Hero";
import SkillsPreview from "../components/sections/SkillsPreview";
import FeaturedProjects from "../components/sections/FeaturedProjects";
import Testimonials from "../components/sections/Testimonials";
import CTASection from "../components/sections/CTASection";

export default function Home() {
  return (
    <>
      <Seo
        title="Home"
        description="Akif Shahzad is a full-stack and AI developer from Lahore, Pakistan, building fast web apps with React, Node.js and FastAPI, plus LLM chatbots and RAG-powered AI features."
        path="/"
      />
      <Hero />
      <SkillsPreview />
      <FeaturedProjects />
      <Testimonials />
      <CTASection />
    </>
  );
}
