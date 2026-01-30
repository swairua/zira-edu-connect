import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  /** Hide this column on mobile card view */
  hideOnMobile?: boolean;
  /** Show this field as a badge/tag on mobile card */
  mobileHighlight?: boolean;
  /** Custom className for the cell */
  className?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  /** Key extractor for each row */
  keyExtractor: (item: T) => string;
  /** Number of skeleton rows to show when loading */
  skeletonRows?: number;
  /** Custom card renderer for mobile view */
  renderMobileCard?: (item: T, columns: ColumnDef<T>[]) => React.ReactNode;
  /** Additional className for the container */
  className?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data found",
  onRowClick,
  keyExtractor,
  skeletonRows = 5,
  renderMobileCard,
  className,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  // Mobile card view
  if (isMobile) {
    return (
      <div className={cn("space-y-3", className)}>
        {isLoading ? (
          Array.from({ length: skeletonRows }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : data.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {emptyMessage}
            </CardContent>
          </Card>
        ) : (
          data.map((item) => {
            if (renderMobileCard) {
              return (
                <div
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {renderMobileCard(item, columns)}
                </div>
              );
            }

            const visibleColumns = columns.filter((col) => !col.hideOnMobile);
            const highlightColumns = columns.filter((col) => col.mobileHighlight);
            const regularColumns = visibleColumns.filter((col) => !col.mobileHighlight);

            return (
              <Card
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-accent/50 active:bg-accent"
                )}
              >
                <CardContent className="p-4 space-y-2">
                  {/* First column as title */}
                  {regularColumns[0] && (
                    <div className="font-medium text-foreground">
                      {regularColumns[0].cell(item)}
                    </div>
                  )}
                  
                  {/* Remaining columns as details */}
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {regularColumns.slice(1).map((col) => (
                      <div key={col.key} className="flex justify-between items-center">
                        <span className="text-xs uppercase tracking-wide">{col.header}</span>
                        <span>{col.cell(item)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Highlighted items as badges */}
                  {highlightColumns.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {highlightColumns.map((col) => (
                        <div key={col.key}>{col.cell(item)}</div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className={cn("rounded-md border overflow-x-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
