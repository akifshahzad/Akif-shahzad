import Seo from "../components/ui/Seo";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import Button from "../components/ui/Button";
import { SITE } from "../constants";
import { trackEvent } from "../utils/analytics";
import { FiDownload } from "react-icons/fi";

export default function Resume() {
  return (
    <>
      <Seo
        title="Résumé"
        description="Download Akif Shahzad's résumé — full-stack and AI developer working with React, Node.js, Python/FastAPI and LLMs."
        path="/resume"
      />
      <section className="py-20">
        <div className="container-app">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading comment="// resume.pdf" title="Résumé" description="The short version of everything on this site." />
            <Reveal>
              <Button
                href={SITE.resumeUrl}
                icon={FiDownload}
                onClick={() => trackEvent("resume_download", { location: "resume_page" })}
              >
                Download PDF
              </Button>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="mt-10">
            <div className="overflow-hidden rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100">
              <iframe
                src={SITE.resumeUrl}
                title="Akif Shahzad's résumé"
                className="h-[70vh] w-full"
              />
            </div>
            <p className="mt-3 text-sm text-paper-300 light:text-ink-700">
              If the preview doesn't load, use the download button above.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
