import { useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import Seo from "../components/ui/Seo";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import ProjectCard from "../components/ui/ProjectCard";
import { PROJECTS, PROJECT_FILTERS } from "../data/projects";
import { cn } from "../utils/cn";

/**
 * Advanced filtering: free-text search (title + description) combined
 * with multi-select technology tags (AND logic — a project must match
 * every selected tag), plus a one-click "clear all" reset.
 */
export default function Projects() {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);

  const tags = PROJECT_FILTERS.filter((t) => t !== "All");

  const toggleTag = (tag) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const clearFilters = () => {
    setQuery("");
    setActiveTags([]);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROJECTS.filter((p) => {
      const matchesQuery =
        !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchesTags = activeTags.every((tag) => p.tech.includes(tag));
      return matchesQuery && matchesTags;
    });
  }, [query, activeTags]);

  const hasActiveFilters = query.trim() !== "" || activeTags.length > 0;

  return (
    <>
      <Seo
        title="Projects"
        description="Browse Akif Shahzad's full-stack and AI projects, searchable and filterable by technology stack."
        path="/projects"
      />
      <section className="py-20">
        <div className="container-app">
          <SectionHeading
            comment="// projects.filter(bySearchAndTech)"
            title="Things I've shipped"
            description="Search by keyword or combine technology tags — a project must match every tag you select."
          />

          <div className="mt-8 flex flex-col gap-4">
            <label htmlFor="project-search" className="sr-only">
              Search projects
            </label>
            <div className="relative max-w-sm">
              <FiSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paper-300 light:text-ink-700"
                aria-hidden="true"
              />
              <input
                id="project-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects…"
                className="w-full rounded-lg border border-ink-600 light:border-paper-300 bg-ink-900 light:bg-paper-100 py-2 pl-9 pr-3 text-sm text-paper-100 light:text-ink-900 outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter projects by technology">
              {tags.map((tech) => {
                const active = activeTags.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTag(tech)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full px-4 py-1.5 font-mono text-xs transition-colors",
                      active
                        ? "bg-amber-400 text-ink-950"
                        : "bg-ink-800 light:bg-paper-200 text-paper-300 light:text-ink-700 hover:text-amber-400"
                    )}
                  >
                    {tech}
                  </button>
                );
              })}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 font-mono text-xs text-paper-300 light:text-ink-700 hover:text-amber-400 transition-colors"
                >
                  <FiX /> Clear filters
                </button>
              )}
            </div>

            <p className="font-mono text-xs text-paper-300 light:text-ink-700" aria-live="polite">
              {filtered.length} project{filtered.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
            {filtered.map((project, i) => (
              <Reveal key={project.id} delay={i * 0.06}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-10 text-center text-paper-300 light:text-ink-700">
              No projects match those filters — try clearing one of them.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
