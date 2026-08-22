import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe2, LayoutDashboard, Luggage, Search, CalendarDays, Users, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-2 text-foreground">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
            <Globe2 className="size-5" />
          </span>
          <div>
            <p className="text-base font-semibold leading-none tracking-tight">GlobeTrotter</p>
            <p className="text-xs text-muted-foreground">Empowering Personalized Travel Planning</p>
          </div>
        </Link>

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
          <DropdownMenuTrigger render={<Button variant="ghost" className="rounded-full p-0.5" />}>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">{initials || 'U'}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link to="/profile" />}>Profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => { logout(); navigate('/login'); }}>
              <LogOut className="size-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
