'use client';

import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminDashboardClient({ chartData }: { chartData: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        
        <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.4)" 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
            dy={10}
        />
        
        <YAxis 
            yAxisId="left"
            stroke="rgba(255,255,255,0.4)" 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
            label={{ value: 'Images', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
        />
        
        <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="rgba(255,255,255,0.4)" 
            tick={{ fill: '#eab308', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(value) => `€${value.toFixed(1)}`}
            label={{ value: 'Cost (€)', angle: 90, position: 'insideRight', fill: '#eab308', fontSize: 12 }}
        />

        <Tooltip 
            contentStyle={{ backgroundColor: '#1c1c1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
            formatter={(value: any, name: any) => {
              if (name === 'flashCost' || name === 'proCost' || name === 'totalCost') return [`€${value.toFixed(2)}`, name];
              return [value, name];
            }}
            labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}
        />

        {/* Stacked Bars for Images */}
        <Bar yAxisId="left" dataKey="flashImages" stackId="a" fill="#00d2ff" name="Flash Images" radius={[0, 0, 4, 4]} />
        <Bar yAxisId="left" dataKey="proImages" stackId="a" fill="#a855f7" name="Pro Images" radius={[4, 4, 0, 0]} />

        {/* Line for Total Cost */}
        <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="totalCost" 
            name="Total Cost (€)" 
            stroke="#eab308" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#eab308', stroke: '#1c1c1e', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
