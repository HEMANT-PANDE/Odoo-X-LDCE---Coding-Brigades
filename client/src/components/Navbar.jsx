import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe2, LayoutDashboard, Luggage, Search, CalendarDays, Users, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
    <header className="sticky top-0 z-40 border-b border-dashed border-[#16302B]/25 bg-[#FBF6ED]/95 text-[#16302B] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#16302B] text-[#FBF6ED] shadow-sm">
            <Globe2 className="size-4.5" />
          </span>
          <div className="leading-tight">
            <p className="font-serif text-base font-semibold tracking-tight text-[#16302B]">GlobeTrotter</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#16302B]/55">
              Gate 01 · Trip Planning
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex">
          {LINKS.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all',
                  isActive
                    ? 'bg-[#16302B] text-[#FBF6ED] shadow-sm'
                    : 'text-[#16302B]/70 hover:bg-[#16302B]/8 hover:text-[#16302B]'
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </Link>
            );
          })}
          {user.isAdmin && (
            <Link
              key="/admin"
              to="/admin"
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all',
                pathname === '/admin'
                  ? 'bg-[#E15B4F] text-[#FBF6ED] shadow-sm'
                  : 'text-[#E15B4F] hover:bg-[#E15B4F]/10'
              )}
            >
              <ShieldCheck className="size-3.5" />
              Admin
            </Link>
          )}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-0.5 outline-none hover:ring-2 hover:ring-[#16302B]/20 transition-all">
              <Avatar className="size-8 border border-[#16302B]/20">
                <AvatarFallback className="bg-[#16302B] text-[#FBF6ED] text-xs font-mono font-semibold">
                  {initials || 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#FBF6ED] border border-[#16302B]/15 text-[#16302B] shadow-md rounded-xl">
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer font-medium text-xs">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#16302B]/10" />
            <DropdownMenuItem
              className="text-[#E15B4F] cursor-pointer font-medium text-xs focus:text-[#E15B4F] focus:bg-[#E15B4F]/10"
              onClick={() => { logout(); navigate('/login'); }}
            >
              <LogOut className="size-3.5 mr-1.5" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
