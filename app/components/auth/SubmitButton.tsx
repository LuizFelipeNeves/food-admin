import { ButtonHTMLAttributes } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function SubmitButton({ loading, children, className = "", ...props }: SubmitButtonProps) {
  return (
    <button
      {...props}
      type="submit"
      disabled={loading || props.disabled}
      className={`relative w-full px-6 py-3 text-sm font-medium text-white 
        bg-gradient-to-r from-emerald-600 to-green-500 rounded-lg
        transition-all duration-150 transform hover:translate-y-[-1px]
        hover:shadow-lg hover:from-emerald-500 hover:to-green-400
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        disabled:hover:shadow-none ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {loading && (
          <svg className="absolute w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        <span className={loading ? "invisible" : "visible"}>{children}</span>
      </div>
    </button>
  );
} 