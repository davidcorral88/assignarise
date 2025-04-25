
import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface ChartData {
  name: string;
  hours: number;
  id: number;
}

interface HoursPerWorkerChartProps {
  data: ChartData[];
}

export const HoursPerWorkerChart: React.FC<HoursPerWorkerChartProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.hours - a.hours);
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={80}
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          label={{ 
            value: 'Horas', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' } 
          }} 
        />
        <Tooltip 
          formatter={(value) => [`${value} horas`, 'Total']}
          labelFormatter={(label) => `Trabajador: ${label}`}
        />
        <Legend />
        <Bar 
          dataKey="hours" 
          name="Horas" 
          fill="#007bc4" 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
