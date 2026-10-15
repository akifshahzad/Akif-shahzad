import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";
import { SKILL_GROUPS } from "../../data/skills";
import { FiArrowRight } from "react-icons/fi";

const PREVIEW_COUNT = 6;

export default function SkillsPreview() {
  return (
    <section className="py-20">
      <div className="container-app">
        <SectionHeading
          comment="// tech-stack"
          title="Tools I reach for"
          description="Full-stack web plus applied AI — a stack chosen for shipping speed and long-term maintainability."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SKILL_GROUPS.map((group, i) => (
            <Reveal key={group.id} delay={i * 0.08}>
              <div className="h-full rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-5">
                <p className="font-mono text-xs text-teal-400">{group.comment}</p>
                <h3 className="mt-1 font-display font-semibold text-paper-100 light:text-ink-950">
                  {group.title}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2" role="list">
                  {group.skills.slice(0, PREVIEW_COUNT).map((s) => (
                    <li
                      key={s.name}
                      className="flex items-center gap-1.5 rounded-full bg-ink-700 light:bg-paper-200 px-2.5 py-1 text-xs text-paper-200 light:text-ink-800"
                    >
                      <s.icon className="text-amber-400" aria-hidden="true" />
                      {s.name}
                    </li>
                  ))}
                  {group.skills.length > PREVIEW_COUNT && (
                    <li className="rounded-full px-2.5 py-1 font-mono text-xs text-teal-400">
                      +{group.skills.length - PREVIEW_COUNT} more
                    </li>
                  )}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-8 text-center">
          <Button to="/skills" variant="secondary" icon={FiArrowRight}>
            See the full breakdown
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
