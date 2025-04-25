
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilePdf, FileSpreadsheet, Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { User } from '@/utils/types';
import * as XLSX from 'xlsx';

interface TaskWithHours {
  id: number | string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  project?: string;
  totalHours: number;
  workerHours: Record<number, number>;
  [key: string]: any;
}

interface DashboardControlsProps {
  data: TaskWithHours[];
  users: User[];
  dateRange: DateRange | undefined;
  isLoading: boolean;
}

export const DashboardControls: React.FC<DashboardControlsProps> = ({
  data,
  users,
  dateRange,
  isLoading
}) => {
  const exportToExcel = () => {
    const exportData = data.map(task => {
      const rowData: Record<string, any> = {
        ID: task.id,
        Título: task.title,
        Descripción: task.description || '',
        Estado: task.status,
        Prioridad: task.priority,
        Categoría: task.category || '',
        Proyecto: task.project || '',
        'Total Horas': task.totalHours
      };
      
      // Add columns for each worker's hours
      users.forEach(user => {
        rowData[`Horas - ${user.name}`] = task.workerHours[user.id] || 0;
      });
      
      return rowData;
    });
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tarefas");
    
    // Format dates for the filename
    const fromDate = dateRange?.from ? format(dateRange.from, "yyyyMMdd") : "inicio";
    const toDate = dateRange?.to ? format(dateRange.to, "yyyyMMdd") : "final";
    
    XLSX.writeFile(wb, `Reporte_Tarefas_${fromDate}_${toDate}.xlsx`);
  };
  
  const exportToPDF = () => {
    alert("La exportación a PDF se implementará en una versión futura");
  };
  
  return (
    <div className="space-y-4">
      <Button 
        onClick={exportToExcel} 
        className="w-full" 
        disabled={isLoading || data.length === 0}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="mr-2 h-4 w-4" />
        )}
        Exportar a Excel
      </Button>
      
      <Button 
        onClick={exportToPDF} 
        variant="outline" 
        className="w-full"
        disabled={isLoading || data.length === 0}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FilePdf className="mr-2 h-4 w-4" />
        )}
        Exportar a PDF
      </Button>
    </div>
  );
};
