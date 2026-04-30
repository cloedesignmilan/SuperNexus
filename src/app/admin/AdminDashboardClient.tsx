'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboardClient({ chartData }: { chartData: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorImages" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
          </linearGradient>
        </defs>
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
            stroke="rgba(255,255,255,0.4)" 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
        />
        <Tooltip 
            contentStyle={{ backgroundColor: '#1c1c1e', borderColor: 'rgba(0,210,255,0.3)', borderRadius: '12px', color: '#fff' }} 
            itemStyle={{ color: '#00d2ff' }}
        />
        <Area 
            type="monotone" 
            dataKey="images" 
            stroke="#00d2ff" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorImages)" 
            activeDot={{ r: 6, fill: '#00d2ff', stroke: '#1c1c1e', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
