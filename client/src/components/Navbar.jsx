import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Globe2, LayoutDashboard, Luggage, Search, CalendarDays, Users,
  ShieldCheck, Building2, LogOut, MessageSquare, MapPin, Compass, Wallet, BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Role-specific Navbar link configurations
const TRAVELER_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trips', label: 'My Trips', icon: Luggage },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/community', label: 'Community', icon: Users },
];

const ADMIN_LINKS = [
  { to: '/admin?tab=analytics', label: 'System Analytics', icon: BarChart3, tabKey: 'analytics' },
  { to: '/admin?tab=trips', label: 'Trip Management', icon: Luggage, tabKey: 'trips' },
  { to: '/admin?tab=users', label: 'User Accounts', icon: Users, tabKey: 'users' },
  { to: '/admin?tab=community', label: 'Community Moderation', icon: MessageSquare, tabKey: 'community' },
  { to: '/admin?tab=cities', label: 'Cities Catalog', icon: MapPin, tabKey: 'cities' },
  { to: '/admin?tab=activities', label: 'Activities Catalog', icon: Compass, tabKey: 'activities' },
];

const AGENCY_LINKS = [
  { to: '/agency?tab=dashboard', label: 'Agency Dashboard', icon: Building2, tabKey: 'dashboard' },
  { to: '/agency?tab=enrolled-travelers', label: 'Enrolled Travelers', icon: Users, tabKey: 'enrolled-travelers' },
  { to: '/agency?tab=budgets', label: 'Trip Budgets', icon: Wallet, tabKey: 'budgets' },
  { to: '/agency?tab=cities', label: 'Cities Catalog', icon: MapPin, tabKey: 'cities' },
  { to: '/agency?tab=activities', label: 'Activities Catalog', icon: Compass, tabKey: 'activities' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '';

  const role = user?.role || (user?.isAdmin ? 'SUPER_ADMIN' : 'TRAVELER');

  const navLinks =
    role === 'SUPER_ADMIN'
      ? ADMIN_LINKS
      : role === 'AGENCY_ADMIN'
        ? AGENCY_LINKS
        : TRAVELER_LINKS;

  const currentTab = new URLSearchParams(search).get('tab');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 lg:px-8">

        {/* Brand Header */}
        <Link to={role === 'SUPER_ADMIN' ? '/admin' : role === 'AGENCY_ADMIN' ? '/agency' : '/dashboard'} className="flex items-center gap-2.5 text-foreground flex-shrink-0">
          <span className="inline-flex size-8 items-center justify-center rounded-xl bg-foreground text-background shadow-sm transition-transform duration-200 hover:scale-105">
            <Globe2 className="size-4" />
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <p className="font-serif text-base font-semibold tracking-tight">GlobeTrotter</p>
              {role === 'SUPER_ADMIN' && (
                <span className="rounded bg-[#E15B4F]/15 px-1.5 py-0.2 font-mono text-[9px] uppercase font-bold text-[#E15B4F] border border-[#E15B4F]/30">
                  Super Admin
                </span>
              )}
              {role === 'AGENCY_ADMIN' && (
                <span className="rounded bg-[#F2A93B]/20 px-1.5 py-0.2 font-mono text-[9px] uppercase font-bold text-[#8a5b0f] border border-[#F2A93B]/40">
                  Agency Admin
                </span>
              )}
            </div>
          </div>
        </Link>

        {user ? (
          <>
            {/* Direct Navbar Links for all sections */}
            <nav className="hidden items-center gap-0.5 md:flex overflow-x-auto py-1">
              {navLinks.map(({ to, label, icon: Icon, tabKey }) => {
                let isActive = false;
                if (tabKey) {
                  const targetPath = to.split('?')[0];
                  const activeTab = currentTab || (targetPath === '/admin' ? 'analytics' : 'dashboard');
                  isActive = pathname === targetPath && activeTab === tabKey;
                } else {
                  isActive = pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));
                }

                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      'relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap',
                      isActive
                        ? 'text-accent font-semibold bg-accent/10'
                        : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                    )}
                  >
                    <Icon className={cn('size-3.5', isActive && 'text-accent')} />
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 rounded-full bg-accent" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-0.5 outline-none ring-offset-background transition-all hover:ring-2 hover:ring-accent/40 focus-visible:ring-2 focus-visible:ring-accent flex-shrink-0">
                  <Avatar className="size-8 border-2 border-accent/30">
                    {user.photoUrl ? (
                      <AvatarImage src={user.photoUrl} />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {initials || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2 border-b border-border mb-1 space-y-1">
                  <p className="text-xs font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  <div className="pt-0.5">
                    {role === 'SUPER_ADMIN' && (
                      <Badge className="bg-[#E15B4F] text-[#FBF6ED] text-[9px] uppercase font-bold">Super Admin</Badge>
                    )}
                    {role === 'AGENCY_ADMIN' && (
                      <Badge className="bg-[#F2A93B] text-[#16302B] text-[9px] uppercase font-bold">Agency Admin</Badge>
                    )}
                    {role === 'TRAVELER' && (
                      <Badge variant="secondary" className="text-[9px] uppercase font-semibold">Traveler</Badge>
                    )}
                  </div>
                </div>

                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">Profile Settings</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-accent focus:text-accent focus:bg-accent/10 cursor-pointer"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
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
