'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: '00:00', total: 12 },
  { name: '03:00', total: 8 },
  { name: '06:00', total: 5 },
  { name: '09:00', total: 15 },
  { name: '12:00', total: 45 },
  { name: '15:00', total: 32 },
  { name: '18:00', total: 48 },
  { name: '21:00', total: 25 },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Orders
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].value}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          strokeWidth={2}
          activeDot={{
            r: 6,
            style: { fill: 'var(--theme-primary)' },
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}