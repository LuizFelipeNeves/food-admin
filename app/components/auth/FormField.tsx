import { InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

export function FormField({ label, error, className = "", ...props }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          className={`block w-full rounded-lg border bg-gray-50 px-4 py-3 
            transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 
            focus:ring-emerald-500 focus:bg-white text-gray-900 placeholder:text-gray-400
            ${error ? "border-red-500" : "border-gray-200"} ${className}`}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
} 