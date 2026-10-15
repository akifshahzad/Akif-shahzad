import Seo from "../components/ui/Seo";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import { CERTIFICATIONS } from "../data/experience";
import { FiAward, FiExternalLink } from "react-icons/fi";

export default function Certifications() {
  return (
    <>
      <Seo
        title="Certifications"
        description="Certifications earned by Akif Shahzad across web development and JavaScript fundamentals."
        path="/certifications"
      />
      <section className="py-20">
        <div className="container-app">
          <SectionHeading
            comment="// certifications.list()"
            title="Certifications"
            description="Formal credentials that back up the day-to-day practice."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CERTIFICATIONS.map((cert, i) => (
              <Reveal key={cert.id} delay={i * 0.08}>
                <div className="h-full rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-6">
                  <FiAward className="text-2xl text-amber-400" aria-hidden="true" />
                  <h3 className="mt-3 font-display font-semibold text-paper-100 light:text-ink-950">
                    {cert.name}
                  </h3>
                  <p className="mt-1 text-sm text-paper-300 light:text-ink-700">
                    {cert.org} · {cert.date}
                  </p>
                  <a
                    href={cert.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-teal-400 hover:text-amber-400 transition-colors"
                  >
                    View credential <FiExternalLink />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
