import { Loader2 } from "lucide-react";

export function Loader() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted font-medium animate-pulse">Loading EduVault...</p>
      </div>
    </div>
  );
}
