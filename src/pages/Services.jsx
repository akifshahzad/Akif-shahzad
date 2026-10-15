import Seo from "../components/ui/Seo";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import Button from "../components/ui/Button";
import { SERVICES } from "../data/experience";
import { FiArrowRight } from "react-icons/fi";

export default function Services() {
  return (
    <>
      <Seo
        title="Services"
        description="Full-stack and AI development services by Akif Shahzad: React and Next.js apps, Node/FastAPI APIs, AI chatbots, RAG systems and LLM integrations."
        path="/services"
      />
      <section className="py-20">
        <div className="container-app">
          <SectionHeading
            comment="// services.render()"
            title="How I can help"
            description="From a landing page that needs to load fast to a full application that needs an API behind it."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <Reveal key={service.id} delay={i * 0.06}>
                <div className="h-full rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-6 transition-colors hover:border-teal-400">
                  <span className="font-mono text-xs text-amber-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold text-paper-100 light:text-ink-950">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm text-paper-300 light:text-ink-700">{service.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15} className="mt-12 text-center">
            <Button to="/contact" icon={FiArrowRight}>Discuss Your Project</Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
