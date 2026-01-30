import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToCSV, exportToPDF } from '@/lib/report-export';
import { useSavedReports } from '@/hooks/useSavedReports';
import { toast } from 'sonner';

interface ReportExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  title: string;
  reportType: string;
}

export function ReportExportButton({ data, filename, title, reportType }: ReportExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { createExport } = useSavedReports();

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      if (format === 'csv') {
        exportToCSV(data, filename);
      } else {
        exportToPDF(title, data);
      }

      // Track the export
      await createExport.mutateAsync({
        report_type: reportType,
        format,
        file_name: `${filename}.${format}`,
      });

      toast.success(`${format.toUpperCase()} exported successfully`);
    } catch (error) {
      toast.error('Export failed');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || data.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
