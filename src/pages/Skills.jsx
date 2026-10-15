import Seo from "../components/ui/Seo";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import SkillBar from "../components/ui/SkillBar";
import { SKILL_GROUPS } from "../data/skills";

export default function Skills() {
  return (
    <>
      <Seo
        title="Skills"
        description="Akif Shahzad's technical skills across frontend (React, Next.js, TypeScript), backend (Node.js, FastAPI), databases, AI/ML (LLMs, RAG, LangChain) and DevOps."
        path="/skills"
      />
      <section className="py-20">
        <div className="container-app">
          <SectionHeading
            comment="// skills.map(s => s.name)"
            title="What I bring to a project"
            description="Proficiency levels are self-assessed, based on hours shipped in production rather than tutorials completed."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {SKILL_GROUPS.map((group, i) => (
              <Reveal key={group.id} delay={i * 0.08}>
                <div className="h-full rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-6">
                  <p className="font-mono text-xs text-teal-400">{group.comment}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-paper-100 light:text-ink-950">
                    {group.title}
                  </h3>
                  <div className="mt-5 space-y-4">
                    {group.skills.map((skill) => (
                      <SkillBar key={skill.name} skill={skill} />
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
