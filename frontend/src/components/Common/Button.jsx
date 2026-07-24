import React from "react";

const VARIANT_CLASS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-primary btn-danger",
};

const Button = ({
  children,
  variant = "primary",
  size,
  icon: Icon,
  className = "",
  ...rest
}) => {
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  return (
    <button
      className={`${VARIANT_CLASS[variant] || VARIANT_CLASS.primary} ${sizeClass} ${className}`.trim()}
      {...rest}
    >
      {Icon && <Icon style={{ marginRight: children ? 8 : 0 }} />}
      {children}
    </button>
  );
};

export default Button;
