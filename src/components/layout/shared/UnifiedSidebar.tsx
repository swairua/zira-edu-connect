import { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, LogOut, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PortalType, getPortalBranding } from '@/config/portalBranding';
import { getUnifiedNavigation, getNavItemsBySection, UnifiedNavItem } from '@/config/unifiedNavigation';
import { useIsTablet } from '@/hooks/useBreakpoint';
import { useOwnershipType } from '@/hooks/useOwnershipType';

const STORAGE_KEY = 'portal-sidebar-expanded-sections';

interface UnifiedSidebarProps {
  portalType: PortalType;
  onLogout: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function UnifiedSidebar({
  portalType,
  onLogout,
  collapsed: controlledCollapsed,
  onCollapsedChange,
}: UnifiedSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Ignore parsing errors
    }
    // Default to all sections expanded
    return new Set(['Main', 'Fees', 'Setup', 'Reports', 'Control']);
  });
  const location = useLocation();
  const isTablet = useIsTablet();
  
  // Use controlled or internal state
  const collapsed = controlledCollapsed ?? (isTablet || internalCollapsed);
  const setCollapsed = onCollapsedChange ?? setInternalCollapsed;

  const branding = getPortalBranding(portalType);
  const navigation = getUnifiedNavigation(portalType);
  const sectionedNav = getNavItemsBySection(portalType);
  const BrandIcon = branding.icon;
  const { isPublicSchool, isPrivateSchool } = useOwnershipType();

  // Filter nav items based on ownership type
  const filterByOwnership = useCallback((item: UnifiedNavItem): boolean => {
    if (item.publicSchoolOnly && !isPublicSchool) return false;
    if (item.privateSchoolOnly && !isPrivateSchool) return false;
    return true;
  }, [isPublicSchool, isPrivateSchool]);

  // Filtered navigation items
  const filteredMainNav = useMemo(() => 
    navigation.main.filter(filterByOwnership), 
    [navigation.main, filterByOwnership]
  );
  
  const filteredSectionedNav = useMemo(() => {
    const result: Record<string, UnifiedNavItem[]> = {};
    Object.entries(sectionedNav).forEach(([section, items]) => {
      const filtered = items.filter(filterByOwnership);
      if (filtered.length > 0) {
        result[section] = filtered;
      }
    });
    return result;
  }, [sectionedNav, filterByOwnership]);

  // Persist expanded sections to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...expandedSections]));
  }, [expandedSections]);

  // Toggle section expand/collapse
  const toggleSection = useCallback((sectionTitle: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionTitle)) {
        next.delete(sectionTitle);
      } else {
        next.add(sectionTitle);
      }
      return next;
    });
  }, []);

  const isActive = (path: string) => {
    if (path === '/dashboard' || path === '/portal' || path === '/student' || path === '/parent' || path === '/staff') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ item }: { item: UnifiedNavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    const content = (
      <NavLink
        to={item.path}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
          active 
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex h-16 items-center border-b border-sidebar-border px-4',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', branding.iconBgClass)}>
                <BrandIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-base font-bold text-sidebar-foreground truncate">{branding.name}</span>
            </div>
          )}
          
          {collapsed && (
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', branding.iconBgClass)}>
              <BrandIcon className="h-5 w-5 text-white" />
            </div>
          )}
          
          {!isTablet && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {/* Main items (non-sectioned) */}
          {filteredMainNav.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}

          {/* Secondary items - render by section if available, else flat */}
          {Object.keys(filteredSectionedNav).length > 1 ? (
            // Render sectioned navigation with collapsible groups
            Object.entries(filteredSectionedNav).map(([sectionName, items], index) => {
              if (sectionName === 'Main') return null; // Already rendered above
              if (items.length === 0) return null;
              
              const isExpanded = expandedSections.has(sectionName);
              
              return (
                <div key={sectionName}>
                  {index > 0 && <div className="my-3 border-t border-sidebar-border" />}
                  
                  {!collapsed ? (
                    <Collapsible open={isExpanded} onOpenChange={() => toggleSection(sectionName)}>
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/70 transition-colors">
                        <span>{sectionName}</span>
                        <ChevronDown className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1 space-y-1">
                        {items.map((item) => (
                          <NavItem key={item.path} item={item} />
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    // Collapsed mode - just show icons
                    items.map((item) => (
                      <NavItem key={item.path} item={item} />
                    ))
                  )}
                </div>
              );
            })
          ) : (
            // Flat secondary navigation (no sections defined)
            navigation.secondary.length > 0 && (
              <>
                <div className="my-3 border-t border-sidebar-border" />
                {navigation.secondary.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </>
            )
          )}
        </nav>

        {/* Footer - Logout */}
        <div className="border-t border-sidebar-border p-3">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={onLogout}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  'text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive',
                  collapsed && 'justify-center px-2'
                )}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!collapsed && <span>Logout</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="font-medium">
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
