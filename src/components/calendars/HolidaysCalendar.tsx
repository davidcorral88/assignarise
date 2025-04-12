
import React, { useState, useEffect } from 'react';
import { format, parseISO, getYear } from 'date-fns';
import { gl } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Holiday } from '@/utils/types';
import { toast } from '@/components/ui/use-toast';
import { getHolidays } from '@/utils/dataService';

const HolidaysCalendar = () => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 3 + i).toString());

  // Function to fetch holidays for the selected year
  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const holidaysData = await getHolidays(selectedYear);
        setHolidays(holidaysData);
      } catch (error) {
        console.error('Error fetching holidays:', error);
        toast({
          title: 'Error',
          description: 'Non foi posible cargar os festivos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [selectedYear]);

  // Create a set of holiday dates for easier lookup
  const holidayDates = new Set(holidays.map(holiday => holiday.date.split('T')[0]));

  // Custom day renderer to highlight holidays
  const modifiers = {
    holiday: (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return holidayDates.has(dateStr);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 space-y-4">
          <div>
            <Label htmlFor="year-select">Ano</Label>
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
            >
              <SelectTrigger id="year-select" className="w-full">
                <SelectValue placeholder="Selecciona un ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="text-center mb-2 font-medium">
                Calendario de Festivos {selectedYear}
              </div>
              <div className="overflow-x-auto">
                <Calendar
                  mode="single"
                  month={new Date(parseInt(selectedYear), 0)}
                  toMonth={new Date(parseInt(selectedYear), 11, 31)}
                  initialFocus
                  className="rounded-md border w-full"
                  locale={gl}
                  modifiers={{
                    holiday: (date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      return holidayDates.has(dateStr);
                    }
                  }}
                  modifiersStyles={{
                    holiday: {
                      color: 'white',
                      backgroundColor: '#ea384c'
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/2">
          <Card className="h-full">
            <CardContent className="p-4">
              <div className="text-center mb-4 font-medium">
                Listado de Festivos {selectedYear}
              </div>
              {loading ? (
                <div className="text-center py-4">Cargando festivos...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrición</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holidays.length > 0 ? (
                      holidays
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map(holiday => (
                          <TableRow key={holiday.date}>
                            <TableCell>
                              {format(parseISO(holiday.date), 'dd/MM/yyyy', { locale: gl })}
                            </TableCell>
                            <TableCell>{holiday.name}</TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">
                          Non hai festivos rexistrados para este ano
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HolidaysCalendar;
