import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Settings,
  Users,
  FileText,
  HelpCircle,
  LayoutDashboard,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useCurrentPath } from "@/hooks/useCurrentPath";
import { EPSON_LOGO_WHITE } from "@/assets/images";
import { VerifyiLogoLight, VerifyiVLogo } from "@/assets/svgs";
import { getIsEVS } from "@/utils/env";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "./input";

interface SubItem {
  label: string;
  href: string;
}

interface NavItemConfig {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  subItems?: SubItem[];
}

interface SidebarProps {
  className?: string;
  defaultCollapsed?: boolean;
  navItems?: NavItemConfig[];
  logo?: React.ReactNode;
  footerItems?: React.ReactNode[];
  collapsedLogo?: React.ReactNode;
  collapsedFooterItems?: React.ReactNode[];
  onEvacComplete?: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  collapsed?: boolean;
  subItems?: SubItem[];
}

const NavItem = ({
  icon,
  label,
  href,
  onClick,
  collapsed,
  subItems,
}: NavItemProps) => {
  const currentPath = useCurrentPath();

  // Add states for controlling submenu visibility and opacity
  const [showSubmenu, setShowSubmenu] = React.useState(false);
  const [isSubmenuVisible, setIsSubmenuVisible] = React.useState(false);
  const closeTimeoutRef = React.useRef<any | undefined>(undefined);

  // Check if current path matches this nav item or any of its subitems
  const isExactMatch = href === currentPath;
  const isParentOfActive = subItems?.some((item) =>
    currentPath.startsWith(item.href)
  );
  const isActiveItem = isExactMatch || isParentOfActive;

  const [isExpanded, setIsExpanded] = React.useState(isParentOfActive);
  const itemRef = React.useRef<HTMLDivElement>(null);
  const submenuContainerRef = React.useRef<HTMLDivElement | null>(null);

  const hasSubItems = subItems && subItems.length > 0;

  // Update expanded state when route changes
  React.useEffect(() => {
    if (isParentOfActive && !collapsed) {
      setIsExpanded(true);
    } else if (!isParentOfActive && !isExactMatch) {
      setIsExpanded(false);
    }
  }, [currentPath, isParentOfActive, isExactMatch, collapsed]);

  const updateSubmenuPosition = React.useCallback(() => {
    if (
      collapsed &&
      showSubmenu &&
      itemRef.current &&
      submenuContainerRef.current
    ) {
      const rect = itemRef.current.getBoundingClientRect();
      submenuContainerRef.current.style.setProperty(
        "--submenu-top-position",
        `${rect.top}px`
      );
    }
  }, [collapsed, showSubmenu]);

  // Update position when submenu visibility changes
  React.useEffect(() => {
    updateSubmenuPosition();
    // Add window resize listener to update position
    window.addEventListener("resize", updateSubmenuPosition);
    return () => window.removeEventListener("resize", updateSubmenuPosition);
  }, [showSubmenu, updateSubmenuPosition]);

  const handleMouseEnter = () => {
    if (collapsed && hasSubItems) {
      clearTimeout(closeTimeoutRef.current);
      setShowSubmenu(true);
      // Small delay to ensure CSS transition works
      setTimeout(() => {
        setIsSubmenuVisible(true);
      }, 50);
    }
  };

  const handleMouseLeave = () => {
    if (collapsed) {
      setIsSubmenuVisible(false);
      closeTimeoutRef.current = setTimeout(() => {
        setShowSubmenu(false);
      }, 200); // Match this with CSS transition duration
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={itemRef}
    >
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start px-4 py-2.5 h-12 font-normal text-[#94A3B8] hover:text-white",
          collapsed && "justify-center px-0",
          isActiveItem && "text-white",
          hasSubItems && !collapsed && "justify-between",
          "hover:bg-transparent"
        )}
        asChild={!!href && !hasSubItems}
        onClick={hasSubItems ? toggleExpand : onClick}
      >
        {href && !hasSubItems ? (
          <Link
            to={href}
            className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}
          >
            <div className={cn(isActiveItem && "text-white")}>{icon}</div>
            {!collapsed && (
              <span
                className={cn(
                  "truncate text-[15px] font-medium",
                  isActiveItem && "text-white"
                )}
              >
                {label}
              </span>
            )}
          </Link>
        ) : (
          <>
            <div
              className={cn(
                "flex items-center gap-3",
                collapsed && "justify-center w-full"
              )}
            >
              <div className={cn(isActiveItem && "text-white")}>{icon}</div>
              {!collapsed && (
                <span
                  className={cn(
                    "truncate text-[15px] font-medium",
                    isActiveItem && "text-white"
                  )}
                >
                  {label}
                </span>
              )}
            </div>
            {hasSubItems && !collapsed && (
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform duration-200",
                  isActiveItem ? "text-white" : "text-[#94A3B8]",
                  isExpanded && "transform rotate-180"
                )}
              />
            )}
          </>
        )}
      </Button>

      {/* Submenu for non-collapsed state */}
      {hasSubItems && !collapsed && isExpanded && (
        <div className="pl-2 space-y-1 border-l border-white/20 ml-6">
          {subItems.map((item, idx) => {
            const isSubItemActive = currentPath.startsWith(item.href);
            return (
              <Button
                key={idx}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start font-normal h-10 text-[#94A3B8] hover:text-white",
                  isSubItemActive && "text-white",
                  "hover:bg-transparent"
                )}
                asChild
              >
                <Link to={item.href}>
                  <span
                    className={cn(
                      "text-[15px]",
                      isSubItemActive && "text-white"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </Button>
            );
          })}
        </div>
      )}

      {/* Floating submenu for collapsed state */}
      {hasSubItems && collapsed && showSubmenu && (
        <div
          ref={submenuContainerRef}
          className={cn(
            "fixed z-50 left-[105px] bg-[#1E3A8A] border border-white/20 rounded shadow-md py-2 px-1 max-w-[300px] max-h-[calc(100vh-250px)] overflow-auto transition-opacity duration-200",
            isSubmenuVisible ? "opacity-100" : "opacity-0"
          )}
          style={{ top: "var(--submenu-top-position, 0)" }}
        >
          <div className="space-y-1 overflow-y-auto px-1">
            {subItems.map((item, idx) => {
              const isSubItemActive = currentPath.startsWith(item.href);
              return (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start font-normal h-10 text-[#94A3B8] hover:text-white",
                    isSubItemActive && "text-white",
                    "hover:bg-transparent"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <span
                      className={cn("text-sm", isSubItemActive && "text-white")}
                    >
                      {item.label}
                    </span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Default nav items with updated styling
const defaultNavItems: NavItemConfig[] = [
  {
    icon: <LayoutDashboard size={22} />,
    label: "Dashboard",
    href: "/dashboard",
    subItems: [
      { label: "Overview", href: "/overview" },
      { label: "Departments", href: "/departments" },
      { label: "Entry & Exit Points", href: "/entry-exit" },
    ],
  },
  {
    icon: <Users size={22} />,
    label: "Employees",
    href: "/employees",
  },
  {
    icon: <FileText size={22} />,
    label: "Reports",
    href: "/reports",
    subItems: [
      { label: "Daily Reports", href: "/reports/daily" },
      { label: "Weekly Summary", href: "/reports/weekly" },
      { label: "Monthly Analytics", href: "/reports/monthly" },
    ],
  },
  {
    icon: <Settings size={22} />,
    label: "Settings",
    href: "/settings",
    subItems: [
      { label: "User Settings", href: "/settings/user" },
      { label: "System Settings", href: "/settings/system" },
      { label: "Permissions", href: "/settings/permissions" },
    ],
  },
  {
    icon: <HelpCircle size={22} />,
    label: "Help & Support",
    href: "/help",
  },
];

// Updated logo styling
const defaultLogo = (
  <div>
    <img src={EPSON_LOGO_WHITE} alt="Epson Logo" width={156} height={36} />
  </div>
);

export function Sidebar({
  className,
  defaultCollapsed = false,
  navItems = defaultNavItems,
  logo = defaultLogo,
  collapsedLogo,
  onEvacComplete,
}: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const toggleSidebar = () => setCollapsed(!collapsed);
  const currentPath = router.state.location.pathname;
  const [email, setEmail] = React.useState("");

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#1E3A8A] transition-all duration-300 ease-in-out h-screen",
        collapsed ? "w-[100px]" : "w-[240px]",
        className
      )}
      data-collapsed={collapsed}
    >
      {/* Header with back button and logo */}
      <div className="flex flex-col relative px-2">
        <div
          className={cn(
            "flex items-center relative",
            collapsed ? "justify-center h-32" : "justify-between h-32"
          )}
        >
          {!collapsed ? logo : collapsedLogo}

          <Button
            variant="ghost"
            size="icon"
            className="bg-white absolute -right-5"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ArrowRight
                size={18}
                className={cn(
                  "text-blue-900",
                  router.state.location.pathname.includes(
                    "evacuation-monitoring"
                  )
                    ? "text-primary-evs"
                    : "text-primary"
                )}
              />
            ) : (
              <ArrowLeft
                size={18}
                className={cn(
                  "text-blue-900",
                  router.state.location.pathname.includes(
                    "evacuation-monitoring"
                  )
                    ? "text-primary-evs"
                    : "text-primary"
                )}
              />
            )}
          </Button>
        </div>

        {!getIsEVS() && (
          <Button
            variant="default"
            className="flex items-center gap-2 px-4 py-6 mb-3 w-full bg-white rounded-lg text-primary hover:bg-white/80"
            asChild
          >
            <Link
              to="/modules"
              className={cn(
                router.state.location.pathname.includes("evacuation-monitoring")
                  ? "text-primary-evs"
                  : "text-primary"
              )}
            >
              <ChevronLeft
                size={20}
                className={cn(
                  "text-primary",
                  router.state.location.pathname.includes(
                    "evacuation-monitoring"
                  )
                    ? "text-primary-evs"
                    : "text-primary"
                )}
              />
              {!collapsed ? (
                <span className="text-sm font-medium capitalize">
                  {currentPath.split("/")[1].split("-").join(" ")}
                </span>
              ) : (
                <span className="text-sm font-medium uppercase">
                  {currentPath.split("/")[1]
                    ? currentPath
                        .split("/")[1]
                        .split("-")
                        .reduce(
                          (acc, part) => acc + (part ? part[0] || "" : ""),
                          ""
                        ) + "S"
                    : "S"}
                </span>
              )}
            </Link>
          </Button>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {navItems.map((item, index) => (
          <NavItem
            key={`nav-item-${index}`}
            icon={item.icon}
            label={item.label}
            href={item.href}
            onClick={item.onClick}
            collapsed={collapsed}
            subItems={item.subItems}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="py-6 flex flex-col items-center justify-center space-y-5">
        {onEvacComplete && (
          <div className="w-full flex items-center justify-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" className="w-[90%] text-white">
                  Evacuation Complete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[700px] flex flex-col">
                <AlertDialogHeader>
                  <AlertDialogTitle>Evacuation Complete</AlertDialogTitle>
                  <AlertDialogDescription>
                    Kindly provide your email to confirm the completion of the
                    evacuation.
                  </AlertDialogDescription>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <small className="text-red-500">
                    {email !== "" &&
                      email !==
                        JSON.parse(localStorage.getItem("user") || "{}")[
                          "EmailAddress"
                        ] &&
                      "Incorrect email address"}
                  </small>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-primary-evs hover:bg-primary-evs/80"
                    disabled={
                      email !==
                      JSON.parse(localStorage.getItem("user") || "{}")[
                        "EmailAddress"
                      ]
                    }
                    onClick={onEvacComplete}
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        {!collapsed ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <VerifyiLogoLight className="w-full px-16 opacity-70 h-fit" />
            <div className="text-white text-xs text-center">version 1.0.0</div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <VerifyiVLogo className="w-full px-7 opacity-70 h-fit" />
          </div>
        )}
      </div>
    </aside>
  );
}
