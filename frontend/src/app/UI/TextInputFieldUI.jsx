import { Input } from "@/components/ui/input";
import React from "react";

const TextInputFieldUI = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  error = "",
  className = "",
  ...props
}) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
    )}
    <Input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`bg-primary/30 text-primary`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export default TextInputFieldUI;
