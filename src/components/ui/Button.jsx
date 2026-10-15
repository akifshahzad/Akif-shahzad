import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const VARIANTS = {
  primary: "bg-amber-400 text-ink-950 hover:bg-amber-500",
  secondary:
    "border border-ink-600 text-paper-200 light:text-ink-900 hover:border-teal-400 hover:text-teal-400",
  ghost: "text-paper-200 light:text-ink-900 hover:text-amber-400",
};

/**
 * Polymorphic button: renders a <Link> for internal paths (`to`),
 * an <a> for external hrefs, or a <button> otherwise.
 */
export default function Button({
  children,
  to,
  href,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  icon: Icon,
  ...rest
}) {
  const classes = cn(
    "inline-flex items-center gap-2 rounded-xl px-5 py-3 font-mono text-sm font-medium transition-colors duration-200",
    VARIANTS[variant],
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {Icon && <Icon aria-hidden="true" />}
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" onClick={onClick} className={classes} {...rest}>
        {Icon && <Icon aria-hidden="true" />}
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </button>
  );
}
