import Seo from "../components/ui/Seo";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import ContactForm from "../components/sections/ContactForm";
import { SITE } from "../constants";
import { FiMail, FiGithub, FiLinkedin, FiTwitter } from "react-icons/fi";
import { SiUpwork, SiFiverr } from "react-icons/si";

// Links with an empty href (see SITE.social) are hidden.
const EXTRA_LINKS = [
  { icon: FiTwitter, href: SITE.social.twitter, label: "X (Twitter)", note: "Follow along with what I'm building" },
  { icon: SiUpwork, href: SITE.social.upwork, label: "Upwork", note: "Hire me through Upwork" },
  { icon: SiFiverr, href: SITE.social.fiverr, label: "Fiverr", note: "See my Fiverr gigs" },
];

export default function Contact() {
  return (
    <>
      <Seo
        title="Contact"
        description="Contact Akif Shahzad for freelance full-stack or AI development work, or full-time opportunities."
        path="/contact"
      />
      <section className="py-20">
        <div className="container-app">
          <SectionHeading
            comment="// contact.send()"
            title="Let's build something"
            description="Have a project, a role, or just a question? Send a message — I read every one."
          />

          <div className="mt-10 grid gap-10 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <ContactForm />
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-2">
              <div className="space-y-4">
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-3 rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-4 hover:border-teal-400 transition-colors"
                >
                  <FiMail className="text-xl text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-paper-100 light:text-ink-950">Email</p>
                    <p className="text-sm text-paper-300 light:text-ink-700">{SITE.email}</p>
                  </div>
                </a>

                <a
                  href={SITE.social.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-4 hover:border-teal-400 transition-colors"
                >
                  <FiGithub className="text-xl text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-paper-100 light:text-ink-950">GitHub</p>
                    <p className="text-sm text-paper-300 light:text-ink-700">Check out my repositories</p>
                  </div>
                </a>

                <a
                  href={SITE.social.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-4 hover:border-teal-400 transition-colors"
                >
                  <FiLinkedin className="text-xl text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-paper-100 light:text-ink-950">LinkedIn</p>
                    <p className="text-sm text-paper-300 light:text-ink-700">Let's connect professionally</p>
                  </div>
                </a>

                {EXTRA_LINKS.filter((l) => l.href).map(({ icon: Icon, href, label, note }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-4 hover:border-teal-400 transition-colors"
                  >
                    <Icon className="text-xl text-amber-400" />
                    <div>
                      <p className="text-sm font-medium text-paper-100 light:text-ink-950">{label}</p>
                      <p className="text-sm text-paper-300 light:text-ink-700">{note}</p>
                    </div>
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
