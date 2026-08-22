import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe2, LayoutDashboard, Luggage, Search, CalendarDays, Users, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trips', label: 'My Trips', icon: Luggage },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/community', label: 'Community', icon: Users },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-8">

        {/* Brand */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 text-foreground">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-foreground text-background shadow-sm transition-transform duration-200 hover:scale-105">
            <Globe2 className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="font-serif text-base font-semibold tracking-tight">GlobeTrotter</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent mt-0.5">
              Travel Planning
            </p>
          </div>
        </Link>

        {user ? (
          <>
            {/* Nav links */}
            <nav className="hidden items-center gap-0.5 md:flex">
              {LINKS.map(({ to, label, icon: Icon }) => {
                const isActive = pathname === to || pathname.startsWith(`${to}/`);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'text-accent font-semibold'
                        : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                    )}
                  >
                    <Icon className={cn('size-4', isActive && 'text-accent')} />
                    {label}
                    {/* active underline pill */}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 rounded-full bg-accent" />
                    )}
                  </Link>
                );
              })}
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150',
                    pathname === '/admin'
                      ? 'text-accent font-semibold'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                  )}
                >
                  <ShieldCheck className={cn('size-4', pathname === '/admin' && 'text-accent')} />
                  Admin
                  {pathname === '/admin' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 rounded-full bg-accent" />
                  )}
                </Link>
              )}
            </nav>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-0.5 outline-none ring-offset-background transition-all hover:ring-2 hover:ring-accent/40 focus-visible:ring-2 focus-visible:ring-accent">
                  <Avatar className="size-8 border-2 border-accent/30">
                    {user.photoUrl
                      ? <AvatarImage src={user.photoUrl} />
                      : <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials || 'U'}</AvatarFallback>
                    }
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <div className="px-2 py-1.5 border-b border-border mb-1">
                  <p className="text-xs font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-accent focus:text-accent focus:bg-accent/10 cursor-pointer"
                  onClick={() => { logout(); navigate('/login'); }}
                >
                  <LogOut className="size-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-foreground/25 hover:border-accent hover:text-accent" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
