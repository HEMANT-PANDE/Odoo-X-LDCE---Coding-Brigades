import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="relative overflow-hidden bg-accent text-accent-foreground border-t border-dashed border-accent-foreground/25 mt-auto">
            <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-xs text-accent-foreground/70">
                        © {new Date().getFullYear()} GlobeTrotter. All rights reserved.
                    </p>
                    <div className="flex items-center gap-5 font-mono text-xs text-accent-foreground/80">
                        <Link to="#" className="hover:text-accent-foreground">Privacy</Link>
                        <Link to="#" className="hover:text-accent-foreground">Terms</Link>
                        <Link to="/dashboard" className="inline-flex items-center gap-1 text-foreground bg-accent-foreground px-3 py-1.5 rounded-full hover:bg-accent-foreground/90 transition-colors">
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            {/* giant bleeding wordmark */}
            <div className="relative z-0 -mt-6 select-none overflow-hidden">
                <p
                    className="whitespace-nowrap pl-2 font-serif font-bold leading-none text-accent-foreground/50"
                    style={{ fontSize: 'clamp(6rem, 22vw, 14rem)', letterSpacing: '-0.03em' }}
                    aria-hidden="true"
                >
                    globetrotter
                </p>
            </div>
        </footer>
    );
}