import { motion } from "framer-motion";
import { FiGithub, FiExternalLink } from "react-icons/fi";

export default function ProjectCard({ project }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100"
    >
      <div className="aspect-video overflow-hidden bg-ink-900 light:bg-paper-200">
        <img
          src={project.image}
          alt={`${project.title} preview`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-paper-100 light:text-ink-950">
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-paper-300 light:text-ink-700">
          {project.description}
        </p>

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies used">
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded-full bg-ink-700 light:bg-paper-200 px-2.5 py-1 font-mono text-[11px] text-teal-400"
            >
              {t}
            </li>
          ))}
        </ul>

        {(project.github || project.demo) && (
          <div className="mt-5 flex gap-3">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-600 px-3 py-1.5 font-mono text-xs text-paper-200 light:text-ink-900 hover:border-teal-400 hover:text-teal-400 transition-colors"
              >
                <FiGithub /> Code
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 font-mono text-xs text-ink-950 hover:bg-amber-500 transition-colors"
              >
                <FiExternalLink /> Live Demo
              </a>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
