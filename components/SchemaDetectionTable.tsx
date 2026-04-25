'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';

interface TopValueItem {
  value: string;
  count: number;
  pct: number;
}

interface FeatureData {
  type?: string;
  cardinality?: number;
  unique_values?: number;
  missing_pct?: number;
  top_value_stats?: TopValueItem[];
  top_values_stats?: TopValueItem[];
  top_values?: string[];
  min?: number;
  max?: number;
  mean?: number;
  std?: number;
}

interface SchemaDetectionTableProps {
  features: Record<string, FeatureData>;
}

export function SchemaDetectionTable({ features }: SchemaDetectionTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'type'>('name');

  const featureArray = Object.entries(features).map(([name, data]) => {
    // Resolve top value stats from whichever field is present
    const topValueStats: TopValueItem[] =
      data.top_value_stats ??
      data.top_values_stats ??
      // Fall back: if only string array, convert without counts
      (data.top_values ?? []).map((v) => ({ value: v, count: 0, pct: 0 }));

    return {
      name,
      type: data.type ?? 'unknown',
      cardinality: data.cardinality ?? data.unique_values ?? 0,
      missing_pct: data.missing_pct ?? 0,
      top_value_stats: topValueStats,
      min: data.min,
      max: data.max,
      mean: data.mean,
      std: data.std,
    };
  });

  const sortedFeatures = [...featureArray].sort((a, b) => {
    if (sortBy === 'type') return a.type.localeCompare(b.type);
    return a.name.localeCompare(b.name);
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Feature Schema</CardTitle>
        <CardDescription>
          Detected data types, cardinality, and statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50">
                <TableHead
                  onClick={() => setSortBy('name')}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Feature Name
                    {sortBy === 'name' && <ChevronDown className="h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => setSortBy('type')}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Data Type
                    {sortBy === 'type' && <ChevronDown className="h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead>Cardinality</TableHead>
                <TableHead>Missing %</TableHead>
                <TableHead>Statistics / Top Values</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFeatures.map((feature) => (
                <TableRow key={feature.name} className="border-b border-border/50">
                  <TableCell className="font-medium">{feature.name}</TableCell>
                  <TableCell>
                    <Badge variant={feature.type === 'numeric' ? 'default' : 'secondary'}>
                      {feature.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{feature.cardinality.toLocaleString()}</TableCell>
                  <TableCell>
                    <span
                      className={
                        feature.missing_pct > 10
                          ? 'text-orange-600 dark:text-orange-400'
                          : ''
                      }
                    >
                      {feature.missing_pct.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {feature.type === 'numeric' ? (
                      <div className="space-y-1">
                        {feature.min !== undefined && (
                          <div>Min: <span className="font-medium">{feature.min.toFixed(2)}</span></div>
                        )}
                        {feature.max !== undefined && (
                          <div>Max: <span className="font-medium">{feature.max.toFixed(2)}</span></div>
                        )}
                        {feature.mean !== undefined && (
                          <div>Mean: <span className="font-medium">{feature.mean.toFixed(2)}</span></div>
                        )}
                        {feature.std !== undefined && (
                          <div>Std: <span className="font-medium">{feature.std.toFixed(2)}</span></div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {feature.top_value_stats.slice(0, 3).map((item) => (
                          <Badge
                            key={item.value}
                            variant="outline"
                            className="text-xs"
                            title={item.count > 0 ? `${item.count} rows (${item.pct.toFixed(1)}%)` : undefined}
                          >
                            {item.value}
                            {item.pct > 0 && (
                              <span className="ml-1 text-muted-foreground">
                                {item.pct.toFixed(0)}%
                              </span>
                            )}
                          </Badge>
                        ))}
                        {feature.top_value_stats.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{feature.top_value_stats.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}