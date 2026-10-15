import Seo from "../components/ui/Seo";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import StatCard from "../components/ui/StatCard";
import GithubContributions from "../components/ui/GithubContributions";
import { SITE } from "../constants";

const INTERESTS = ["Open-source", "Cricket", "Table Tennis", "Chess", "Soccer", "Netflix", "Hiking"];

export default function About() {
  return (
    <>
      <Seo
        title="About"
        description="Learn about Akif Shahzad — a full-stack and AI developer — his background, tech stack, and how he takes products from idea to deployment."
        path="/about"
      />
      <section className="py-20">
        <div className="container-app">
          <SectionHeading comment="// about-me" title="A developer who reads the whole error message" />

          <div className="mt-10 grid gap-10 md:grid-cols-5">
            <Reveal className="md:col-span-3">
              <div className="space-y-4 text-paper-300 light:text-ink-700">
                <p>
                  I'm <strong>Akif Shahzad</strong>, a Full-Stack &amp; AI Developer passionate about
                  building fast, scalable, and user-friendly web applications. I enjoy transforming ideas
                  into production-ready products with clean architecture, reusable components, and
                  responsive interfaces.
                </p>
                <p>
                  My primary stack includes <strong>React.js</strong>, <strong>Next.js</strong>,{" "}
                  <strong>JavaScript</strong>, <strong>TypeScript</strong>, <strong>Tailwind CSS</strong>,
                  and <strong>Vite</strong> on the frontend, while I build secure REST APIs using{" "}
                  <strong>Python</strong>, <strong>FastAPI</strong>, <strong>Node.js</strong>, and{" "}
                  <strong>Express.js</strong>. I work with MySQL, PostgreSQL, MongoDB, and Firebase to create
                  reliable backend solutions.
                </p>
                <p>
                  On the AI side, I build <strong>LLM-powered chatbots</strong>,{" "}
                  <strong>RAG pipelines</strong> over private documents, and integrations with the OpenAI,
                  Claude, and Gemini APIs — adding AI where it genuinely makes a product more useful.
                </p>
                <p>
                  I enjoy writing clean, maintainable code, optimizing performance, integrating APIs, and
                  continuously learning modern technologies. Outside of development, I explore new tools,
                  work on personal projects, and stay up to date with the JavaScript and Python ecosystems.
                </p>
              </div>

              <div className="mt-8">
                <p className="eyebrow">// currently-working-with</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["React", "Next.js", "TypeScript", "Node.js", "Python", "FastAPI", "PostgreSQL", "LangChain", "OpenAI / Claude APIs"].map(
                    (tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-ink-600 px-3 py-1 font-mono text-xs text-teal-400"
                      >
                        {tech}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="mt-8">
                <p className="eyebrow">// when-not-coding</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-ink-800 light:bg-paper-200 px-3 py-1 text-xs text-paper-200 light:text-ink-800"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <StatCard value={2} suffix="+" label="Years building" />
                <StatCard value={15} suffix="+" label="Projects shipped" />
                <StatCard value={8} suffix="+" label="Happy clients" />
                <StatCard value={90} suffix="+" label="Avg. Lighthouse score" />
              </div>

              <div className="mt-6 rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-5">
                <p className="eyebrow">// career-goal</p>
                <p className="mt-2 text-sm text-paper-300 light:text-ink-700">
                  To keep building products that are fast, accessible, and genuinely useful — with AI
                  where it adds real value — and easy for the next developer to pick up, including future-me.
                </p>
              </div>

              <div className="mt-6">
                <GithubContributions username={SITE.githubUsername} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
