'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TargetColumnCardProps {
  targetColumn: string;
  classDistribution: Record<string, number>;
}

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export function TargetColumnCard({
  targetColumn,
  classDistribution,
}: TargetColumnCardProps) {
  const total = Object.values(classDistribution).reduce((a, b) => a + b, 0);
  const sortedEntries = Object.entries(classDistribution)
    .map(([className, count]) => ({
      class: className,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  const minorityClass = sortedEntries[sortedEntries.length - 1].class;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Target Column: {targetColumn}</CardTitle>
        <CardDescription>Class distribution visualization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sortedEntries}
                dataKey="count"
                nameKey="class"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ class: cls, percentage }) =>
                  `${cls}: ${percentage.toFixed(1)}%`
                }
              >
                {sortedEntries.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={entry.class === minorityClass ? 0.7 : 1}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {sortedEntries.map((item) => (
            <div
              key={item.class}
              className="rounded-lg bg-muted/50 p-4"
            >
              <p className="text-sm text-muted-foreground">
                {item.class === minorityClass ? 'Minority' : 'Majority'} Class
              </p>
              <p className="text-2xl font-bold">{item.percentage.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">{item.count} samples</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
