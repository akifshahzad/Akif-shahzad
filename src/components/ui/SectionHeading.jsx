import Reveal from "./Reveal";

export default function SectionHeading({ comment, title, description, align = "left" }) {
  return (
    <Reveal className={align === "center" ? "text-center" : ""}>
      <p className="eyebrow">{comment}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold text-paper-100 light:text-ink-950 md:text-4xl">
        {title}
      </h2>
      {description && (
        <p
          className={`mt-3 max-w-2xl text-paper-300 light:text-ink-700 ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
