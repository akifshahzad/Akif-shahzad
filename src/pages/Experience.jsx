import Seo from "../components/ui/Seo";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import { TIMELINE } from "../data/experience";
import { cn } from "../utils/cn";

const TYPE_LABEL = {
  work: "work",
  certification: "certification",
  learning: "learning",
};

const TYPE_COLOR = {
  work: "bg-amber-400",
  certification: "bg-teal-400",
  learning: "bg-ink-600 light:bg-paper-300",
};

export default function Experience() {
  return (
    <>
      <Seo
        title="Experience"
        description="Akif Shahzad's professional experience, freelance work, learning journey, and certifications, in one timeline."
        path="/experience"
      />
      <section className="py-20">
        <div className="container-app">
          <SectionHeading
            comment="// experience.sort(byDate)"
            title="How I got here"
            description="Work, freelance projects, and the certifications along the way."
          />

          <div className="relative mt-12 ml-3 border-l border-ink-700 light:border-paper-300 pl-8">
            {TIMELINE.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.08} className="relative pb-10 last:pb-0">
                <span
                  className={cn(
                    "absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-ink-900 light:ring-paper-100",
                    TYPE_COLOR[item.type]
                  )}
                  aria-hidden="true"
                />
                <p className="font-mono text-xs text-teal-400">
                  {item.year} · {TYPE_LABEL[item.type]}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-paper-100 light:text-ink-950">
                  {item.title}
                </h3>
                <p className="text-sm text-paper-300 light:text-ink-700">{item.org}</p>
                <p className="mt-2 max-w-2xl text-paper-300 light:text-ink-700">{item.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
