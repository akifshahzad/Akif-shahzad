import Reveal from "../ui/Reveal";
import Button from "../ui/Button";
import { FiArrowRight } from "react-icons/fi";

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="container-app">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 px-8 py-14 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl"
            />
            <p className="eyebrow justify-center">// let's talk</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-paper-100 light:text-ink-950 md:text-4xl">
              Have a project in mind?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-paper-300 light:text-ink-700">
              I'm currently available for freelance work and full-time opportunities.
            </p>
            <div className="mt-7 flex justify-center">
              <Button to="/contact" icon={FiArrowRight}>Start a Conversation</Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
