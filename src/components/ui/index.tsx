import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
} from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "inverse" | "contrast";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`ui-button ui-button--${variant} ui-button--${size} ${className}`.trim()}
      type={type}
      {...props}
    />
  );
}

type CardProps = HTMLAttributes<HTMLDivElement> & {
  as?: "article" | "div" | "section";
};

export function Card({
  as: Component = "div",
  className = "",
  ...props
}: CardProps) {
  return (
    <Component className={`ui-card ${className}`.trim()} {...props} />
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return <input className={`ui-input ${className}`.trim()} {...props} />;
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "brand" | "solid" | "neutral" | "success" | "warning" | "danger";
};

export function Badge({
  className = "",
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`ui-badge ui-badge--${variant} ${className}`.trim()}
      {...props}
    />
  );
}
