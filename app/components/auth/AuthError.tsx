import { AlertTriangle } from "lucide-react";

interface AuthErrorProps {
  message: string;
  className?: string;
}

export function AuthError({ message, className = "" }: AuthErrorProps) {
  return (
    <div className={`rounded-md bg-red-50 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{message}</h3>
        </div>
      </div>
    </div>
  );
} 