import { VcetLogo } from "@/components/vcet/VcetLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  CreditCard,
  FileText,
  LayoutDashboard,
  Library,
  LifeBuoy,
  LogOut,
  Menu,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/circulars", label: "Circulars", icon: FileText },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/examinations", label: "Examinations", icon: BookOpen },
  { to: "/e-library", label: "E-Library", icon: Library },
  { to: "/extracurricular", label: "Extracurricular", icon: Users },
  { to: "/feedback", label: "Feedback & Support", icon: LifeBuoy },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pt-2">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#EAF2FC] text-[#0B3B78]"
                  : "text-white/85 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-4 pb-5 pt-6 text-center">
        <svg
          viewBox="0 0 200 60"
          className="mx-auto mb-3 h-10 w-auto opacity-40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          <path d="M20 50 V25 L45 12 L70 25 V50" />
          <path d="M70 50 V32 H100 V50" />
          <path d="M100 50 V20 L130 8 L160 20 V50" />
          <path d="M160 50 V35 H185 V50" />
          <path d="M0 50 H200" />
        </svg>
        <p className="font-hand text-sm leading-snug text-white/85">
          Learn · Grow · Build
          <br />a Better Tomorrow
        </p>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const results = useQuery(
    api.portal.globalSearch,
    debounced.trim().length >= 2 ? { q: debounced } : "skip",
  );

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    setQ("");
    navigate(path);
  };

  const hasResults =
    results &&
    (results.circulars.length > 0 ||
      results.events.length > 0 ||
      results.library.length > 0 ||
      results.pages.length > 0);

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5B6B83]" />
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search anything…"
        className="h-10 rounded-full border-[#E5EAF2] bg-[#F4F7FC] pl-9 text-sm focus-visible:ring-2 focus-visible:ring-[#0B3B78]/30"
        aria-label="Global search"
      />
      {open && debounced.trim().length >= 2 && (
        <div className="vcet-card absolute left-0 right-0 top-12 z-50 max-h-96 overflow-y-auto p-2">
          {!results && (
            <p className="px-3 py-4 text-sm text-[#5B6B83]">Searching…</p>
          )}
          {results && !hasResults && (
            <p className="px-3 py-4 text-sm text-[#5B6B83]">
              No results for “{debounced}”
            </p>
          )}
          {results && hasResults && (
            <>
              {results.pages.length > 0 && (
                <SearchGroup label="Pages">
                  {results.pages.map((p: any) => (
                    <button
                      key={p.path}
                      onClick={() => go(p.path)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-[#EAF2FC]"
                    >
                      {p.label}
                    </button>
                  ))}
                </SearchGroup>
              )}
              {results.circulars.length > 0 && (
                <SearchGroup label="Circulars">
                  {results.circulars.map((c: any) => (
                    <button
                      key={c._id}
                      onClick={() => go("/circulars")}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-[#EAF2FC]"
                    >
                      <span className="truncate">{c.title}</span>
                      <span className="ml-2 shrink-0 text-xs text-[#5B6B83]">
                        {c.category}
                      </span>
                    </button>
                  ))}
                </SearchGroup>
              )}
              {results.events.length > 0 && (
                <SearchGroup label="Events">
                  {results.events.map((e: any) => (
                    <button
                      key={e._id}
                      onClick={() => go("/dashboard")}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-[#EAF2FC]"
                    >
                      <span className="truncate">{e.title}</span>
                      <span className="ml-2 shrink-0 text-xs text-[#5B6B83]">
                        {e.date}
                      </span>
                    </button>
                  ))}
                </SearchGroup>
              )}
              {results.library.length > 0 && (
                <SearchGroup label="Library">
                  {results.library.map((l: any) => (
                    <button
                      key={l._id}
                      onClick={() => go("/e-library")}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-[#EAF2FC]"
                    >
                      <span className="truncate">{l.title}</span>
                      <span className="ml-2 shrink-0 text-xs text-[#5B6B83]">
                        {l.author}
                      </span>
                    </button>
                  ))}
                </SearchGroup>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SearchGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[#5B6B83]">
        {label}
      </p>
      {children}
    </div>
  );
}

function NotificationsMenu() {
  const notifications = useQuery(api.portal.getNotifications);
  const markRead = useMutation(api.portal.markNotificationRead);
  const markAll = useMutation(api.portal.markAllNotificationsRead);
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative flex size-10 items-center justify-center rounded-full hover:bg-[#EAF2FC]"
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        >
          <Bell className="size-5 text-[#0B3B78]" />
          {unread > 0 && (
            <span className="absolute right-2 top-2 flex size-2.5 items-center justify-center rounded-full bg-[#E4572E] text-[9px] font-bold text-white ring-2 ring-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-[#E5EAF2] px-4 py-3">
          <p className="text-sm font-semibold text-[#0F2542]">Notifications</p>
          {unread > 0 && (
            <button
              onClick={() => markAll({})}
              className="text-xs font-medium text-[#0B3B78] hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications === undefined && (
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          {notifications?.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[#5B6B83]">
              You're all caught up!
            </p>
          )}
          {notifications?.map((n) => (
            <button
              key={n._id}
              onClick={() => markRead({ notificationId: n._id })}
              className={cn(
                "block w-full border-b border-[#E5EAF2]/70 px-4 py-3 text-left last:border-0 hover:bg-[#F4F7FC]",
                !n.read && "bg-[#EAF2FC]/50",
              )}
            >
              <p className="text-sm font-medium text-[#0F2542]">{n.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-[#5B6B83]">{n.body}</p>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const viewer = useQuery(api.portal.getViewer, {});
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isParentView = viewer?.kind === "parent";
  const displayName =
    viewer?.student?.name ?? user?.name ?? "Student";
  const subtitle = isParentView
    ? `Parent of ${viewer?.student?.name ?? "student"}`
    : (viewer?.student?.program ?? user?.email ?? "Student");

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] bg-[#0B3B78] lg:block">
        <div className="flex h-16 items-center border-b border-white/10 px-4">
          <VcetLogo light size={36} />
        </div>
        <div className="h-[calc(100%-4rem)]">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[260px] bg-[#0B3B78] shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
              <VcetLogo light size={36} />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex size-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="h-[calc(100%-4rem)]">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-[260px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E5EAF2] bg-white px-4 lg:px-6">
          <button
            className="flex size-10 items-center justify-center rounded-lg hover:bg-[#EAF2FC] lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5 text-[#0B3B78]" />
          </button>
          <div className="hidden flex-1 justify-center md:flex">
            <GlobalSearch />
          </div>
          <div className="flex-1 md:hidden" />
          <div className="ml-auto flex items-center gap-2">
            <NotificationsMenu />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-[#EAF2FC]">
                  <Avatar className="size-9 border border-[#E5EAF2]">
                    <AvatarImage src={user?.image ?? undefined} alt={displayName} />
                    <AvatarFallback className="bg-[#0B3B78] text-xs font-semibold text-white">
                    {displayName
                      .split(" ")
                      .map((p: string) => p[0])
                      .slice(0, 2)
                      .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-semibold leading-tight text-[#0F2542]">
                      {displayName}
                    </span>
                    <span className="block text-[11px] leading-tight text-[#5B6B83]">
                      {isParentView ? "Parent" : "Student"}
                    </span>
                  </span>
                  <ChevronDown className="size-4 text-[#5B6B83]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Parent mode toggle */}
            {viewer && (viewer.kind === "parent" || viewer.canToggleParent) && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5",
                  isParentView
                    ? "border-[#5BAA3C]/40 bg-[#5BAA3C]/10"
                    : "border-[#E5EAF2] bg-[#F4F7FC]",
                )}
                title={
                  viewer.kind === "parent"
                    ? "You are signed in as a parent — view is read-only"
                    : undefined
                }
              >
                <Users className={cn("size-4", isParentView ? "text-[#5BAA3C]" : "text-[#5B6B83]")} />
                <span className="text-xs font-medium text-[#0F2542]">
                  {isParentView ? "Parent Mode" : "Student Mode"}
                </span>
                <Switch
                  checked={isParentView}
                  disabled
                  aria-label="Parent mode (read-only)"
                  className="data-[state=checked]:bg-[#5BAA3C]"
                />
              </div>
            )}
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export { NAV_ITEMS };
