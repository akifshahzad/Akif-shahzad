import { motion } from "framer-motion";

export default function SkillBar({ skill }) {
  const Icon = skill.icon;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-paper-200 light:text-ink-900">
          <Icon className="text-amber-400" aria-hidden="true" />
          {skill.name}
        </span>
        <span className="font-mono text-xs text-paper-300 light:text-ink-700">{skill.level}%</span>
      </div>
      <div
        className="mt-2 h-2 rounded-full bg-ink-700 light:bg-paper-300"
        role="progressbar"
        aria-valuenow={skill.level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${skill.name} proficiency`}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-amber-400"
        />
      </div>
    </div>
  );
}
