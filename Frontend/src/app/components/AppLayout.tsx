import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Search, 
  UserCircle, 
  LogOut
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { clearSession, getCurrentUser, isAuthenticated, setCurrentUser } from "../api/session";
import { getMe } from "../api/authApi";
import type { AuthUser } from "../api/types";
import { roleDefaultPath } from "./RouteGuards";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUserState] = useState<AuthUser | null>(getCurrentUser());

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    getMe()
      .then((user) => {
        setCurrentUser(user);
        setCurrentUserState(user);
      })
      .catch(() => {
        clearSession();
        navigate('/login');
      });
  }, [navigate]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const dashboardPath = roleDefaultPath(currentUser?.role);

  const isDashboardActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/contributor") ||
    location.pathname.startsWith("/reviewer") ||
    location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Project Repository</span>
            </Link>

            <nav className="flex items-center gap-1">
              <Button 
                variant={isDashboardActive ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
                onClick={() => navigate(dashboardPath)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
              <Button 
                variant={isActive('/repository') ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
                onClick={() => navigate('/repository')}
              >
                <Search className="w-4 h-4" />
                Repository
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserCircle className="w-5 h-5" />
                  <span className="max-w-32 truncate">{currentUser?.name ?? 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{currentUser?.name ?? 'User'}</span>
                    <span className="text-xs font-normal text-gray-500">{currentUser?.email ?? ''}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}