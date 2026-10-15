import SectionHeading from "../ui/SectionHeading";
import ProjectCard from "../ui/ProjectCard";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";
import { PROJECTS } from "../../data/projects";
import { FiArrowRight } from "react-icons/fi";

export default function FeaturedProjects() {
  const featured = PROJECTS.filter((p) => p.featured);

  return (
    <section className="py-20">
      <div className="container-app">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            comment="// featured-work"
            title="A few things I've built"
            description="Projects picked for range: a data-heavy dashboard, an offline-first app, and a scraping pipeline."
          />
          <Reveal delay={0.1}>
            <Button to="/projects" variant="secondary" icon={FiArrowRight}>
              All Projects
            </Button>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((project, i) => (
            <Reveal key={project.id} delay={i * 0.08}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
