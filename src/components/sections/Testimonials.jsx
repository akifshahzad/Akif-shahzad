import { FiStar } from "react-icons/fi";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { TESTIMONIALS } from "../../data/testimonials";

export default function Testimonials() {
  return (
    <section className="py-20">
      <div className="container-app">
        <SectionHeading
          comment="// testimonials.map(quote => trust)"
          title="What clients say"
          description="A few words from people I've built things for."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <figure className="h-full rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-6">
                <div className="flex" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <FiStar
                      key={idx}
                      className={idx < t.rating ? "fill-amber-400 text-amber-400" : "text-ink-600"}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm text-paper-300 light:text-ink-700">
                  “{t.feedback}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <img
                    src={t.photo}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-paper-100 light:text-ink-950">{t.name}</p>
                    <p className="font-mono text-xs text-teal-400">
                      {t.role} · {t.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
