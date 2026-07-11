import Link from "next/link";
import { ReactNode } from "react";

interface BaseButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

interface ButtonAsLink extends BaseButtonProps {
  href: string;
  onClick?: never;
  type?: never;
}

interface ButtonAsButton extends BaseButtonProps {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

type ButtonProps = ButtonAsLink | ButtonAsButton;

const baseStyles =
  "inline-flex items-center justify-center px-6 py-3 rounded-full font-medium text-sm tracking-wide transition-colors duration-200";

const variantStyles = {
  primary:
    "bg-brand-teal text-brand-cream hover:bg-brand-charcoal",
  secondary:
    "border border-brand-gold text-brand-charcoal hover:bg-brand-gold hover:text-brand-cream",
};

/**
 * Button
 * Shared button component with two visual variants: "primary" (solid,
 * for main calls-to-action) and "secondary" (outlined, for lower-emphasis
 * actions). Pass `href` to render as a navigation link, or `onClick`/`type`
 * to render as a real <button> for forms and in-page actions.
 */
export function Button({
  children,
  variant = "primary",
  className = "",
  href,
  onClick,
  type = "button",
}: ButtonProps) {
  const styles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={styles}>
      {children}
    </button>
  );
}