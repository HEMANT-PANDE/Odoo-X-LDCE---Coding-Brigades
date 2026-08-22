import { Globe2 } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[linear-gradient(135deg,var(--secondary)_0%,white_45%,var(--secondary)_100%)] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-foreground">
          <Globe2 className="size-8" strokeWidth={2.2} />
          <span className="text-2xl font-semibold tracking-tight">GlobeTrotter</span>
        </div>
        {children}
      </div>
    </div>
  );
}
