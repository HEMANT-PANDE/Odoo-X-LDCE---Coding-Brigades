import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe2, LayoutDashboard, Luggage, Search, CalendarDays, Users, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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
        <Link to="/dashboard" className="flex items-center gap-2 text-foreground">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
            <Globe2 className="size-5" />
          </span>
          <div>
            <p className="font-serif text-base font-semibold leading-none tracking-tight">GlobeTrotter</p>
            <p className="text-xs text-muted-foreground mt-1">Empowering Personalized Travel Planning</p>
          </div>
        </Link>

        {user ? (
          <>
            <nav className="hidden items-center gap-1 md:flex">
              {LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground',
                    pathname === to && 'bg-secondary text-secondary-foreground'
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
              {user.isAdmin && (
                <Link
                  key="/admin"
                  to="/admin"
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground',
                    pathname === '/admin' && 'bg-secondary text-secondary-foreground'
                  )}
                >
                  <ShieldCheck className="size-4" />
                  Admin
                </Link>
              )}
            </nav>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0.5">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">{initials || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => { logout(); navigate('/login'); }}>
                  <LogOut className="size-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-foreground/25" asChild>
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
