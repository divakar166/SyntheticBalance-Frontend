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

interface SchemaDetectionTableProps {
  features: Record<string, any>;
}

export function SchemaDetectionTable({ features }: SchemaDetectionTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'type'>('name');

  const featureArray = Object.entries(features).map(([name, data]) => ({
    name,
    type: data.type,
    cardinality: data.cardinality || data.unique_values || 0,
    missing_pct: data.missing_pct || 0,
    top_values: data.top_values || [],
    min: data.min,
    max: data.max,
    mean: data.mean,
    std: data.std,
  }));

  const sortedFeatures = [...featureArray].sort((a, b) => {
    if (sortBy === 'type') {
      return a.type.localeCompare(b.type);
    }
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
                    {sortBy === 'name' && (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => setSortBy('type')}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Data Type
                    {sortBy === 'type' && (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Cardinality</TableHead>
                <TableHead>Missing %</TableHead>
                <TableHead>Statistics</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFeatures.map((feature) => (
                <TableRow key={feature.name} className="border-b border-border/50">
                  <TableCell className="font-medium">{feature.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={feature.type === 'numeric' ? 'default' : 'secondary'}
                    >
                      {feature.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{feature.cardinality}</TableCell>
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
                          <div>
                            Min: <span className="font-medium">{feature.min.toFixed(2)}</span>
                          </div>
                        )}
                        {feature.max !== undefined && (
                          <div>
                            Max: <span className="font-medium">{feature.max.toFixed(2)}</span>
                          </div>
                        )}
                        {feature.mean && (
                          <div>
                            Mean:{' '}
                            <span className="font-medium">
                              {feature.mean.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {feature.top_values?.slice(0, 3).map((val: string) => (
                          <Badge key={val} variant="outline" className="text-xs">
                            {val}
                          </Badge>
                        ))}
                        {(feature.top_values?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(feature.top_values?.length || 0) - 3} more
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
