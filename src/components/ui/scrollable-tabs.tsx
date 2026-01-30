import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabsList } from "@/components/ui/tabs";

interface ScrollableTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsList> {
  children: React.ReactNode;
}

export const ScrollableTabsList = React.forwardRef<
  React.ElementRef<typeof TabsList>,
  ScrollableTabsListProps
>(({ className, children, ...props }, ref) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    // Check after a brief delay to account for content rendering
    const timer = setTimeout(checkScroll, 100);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      clearTimeout(timer);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.6;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full">
      {/* Left scroll indicator */}
      <div
        className={cn(
          "absolute left-0 top-0 z-10 flex h-full items-center bg-gradient-to-r from-muted via-muted/80 to-transparent pl-1 pr-3 transition-opacity duration-200",
          canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <button
          type="button"
          onClick={() => scroll("left")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-md hover:bg-accent"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide overflow-x-auto"
      >
        <TabsList
          ref={ref}
          className={cn(
            "inline-flex h-auto w-max min-w-full items-center justify-start gap-1 p-1.5",
            className
          )}
          {...props}
        >
          {children}
        </TabsList>
      </div>

      {/* Right scroll indicator */}
      <div
        className={cn(
          "absolute right-0 top-0 z-10 flex h-full items-center bg-gradient-to-l from-muted via-muted/80 to-transparent pl-3 pr-1 transition-opacity duration-200",
          canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <button
          type="button"
          onClick={() => scroll("right")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-md hover:bg-accent"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

ScrollableTabsList.displayName = "ScrollableTabsList";
