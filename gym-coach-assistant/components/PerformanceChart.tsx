
import type { MonthlyPerformance } from '../types';
import type { ExerciseType } from '../types';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  data: MonthlyPerformance[];
  exerciseType: ExerciseType;
  color: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, exerciseType, color }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
          <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
          <YAxis tick={{ fill: '#9ca3af' }} />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                borderColor: '#4b5563', 
                borderRadius: '0.5rem'
            }}
            labelStyle={{ color: '#f9fafb' }}
            itemStyle={{ color: color }}
            cursor={{fill: 'rgba(75, 85, 99, 0.2)'}}
           />
          <Legend />
          <Bar dataKey={exerciseType} fill={color} name={exerciseType} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
