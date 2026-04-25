'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
  min?: number;
  max?: number;
  mean?: number;
  std?: number;
  median?: number;
  q1?: number;
  q3?: number;
  iqr?: number;
  skewness?: number;
  kurtosis?: number;
}

interface FeatureStatisticsDashboardProps {
  features: Record<string, FeatureData>;
}

export function FeatureStatisticsDashboard({
  features,
}: FeatureStatisticsDashboardProps) {
  const featureArray = Object.entries(features).map(([name, data]) => ({
    name,
    type: data.type ?? 'unknown',
    cardinality: data.cardinality ?? data.unique_values ?? 0,
    missing_pct: data.missing_pct ?? 0,
    top_values: data.top_value_stats ?? data.top_values_stats ?? [],
    min: data.min,
    max: data.max,
    mean: data.mean,
    std: data.std,
    median: data.median,
    q1: data.q1,
    q3: data.q3,
    iqr: data.iqr,
    skewness: data.skewness,
    kurtosis: data.kurtosis,
  }));

  if (featureArray.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No features to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Feature Statistics</CardTitle>
        <CardDescription>
          Detailed distribution and statistics for each feature
        </CardDescription>
      </CardHeader>

      <CardContent className="w-full">
        <Tabs defaultValue={featureArray[0]?.name ?? ''} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-6">
            {featureArray.map((feature) => (
              <TabsTrigger
                key={feature.name}
                value={feature.name}
                className="text-xs"
              >
                {feature.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {featureArray.map((feature) => (
            <TabsContent
              key={feature.name}
              value={feature.name}
              className="space-y-4 mt-4 w-full"
            >
              {/* Summary row */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Data Type</p>
                  <Badge variant={feature.type === 'numeric' ? 'default' : 'secondary'}>
                    {feature.type}
                  </Badge>
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Cardinality</p>
                  <p className="text-lg font-bold">{feature.cardinality}</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Missing %</p>
                  <p className="text-lg font-bold">{feature.missing_pct.toFixed(1)}%</p>
                </div>

                {feature.type === 'numeric' && feature.mean !== undefined && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Mean</p>
                    <p className="text-lg font-bold">{feature.mean.toFixed(2)}</p>
                  </div>
                )}
                {feature.type !== 'numeric' && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Unique Values</p>
                    <p className="text-lg font-bold">{feature.cardinality}</p>
                  </div>
                )}
              </div>

              {feature.type === 'numeric' ? (
                <div className="space-y-4">
                  {/* Bar chart: min / Q1 / median / mean / Q3 / max */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Distribution Summary</h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Min', value: feature.min ?? 0 },
                            { name: 'Q1', value: feature.q1 ?? 0 },
                            { name: 'Median', value: feature.median ?? 0 },
                            { name: 'Mean', value: feature.mean ?? 0 },
                            { name: 'Q3', value: feature.q3 ?? 0 },
                            { name: 'Max', value: feature.max ?? 0 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px',
                            }}
                            formatter={(value: number) => value.toFixed(2)}
                          />
                          <Bar
                            dataKey="value"
                            fill="hsl(var(--chart-1))"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Full stats grid */}
                  <div className="grid grid-cols-3 gap-3 text-sm sm:grid-cols-4">
                    {[
                      { label: 'Min', value: feature.min },
                      { label: 'Max', value: feature.max },
                      { label: 'Mean', value: feature.mean },
                      { label: 'Median', value: feature.median },
                      { label: 'Std Dev', value: feature.std },
                      { label: 'Q1', value: feature.q1 },
                      { label: 'Q3', value: feature.q3 },
                      { label: 'IQR', value: feature.iqr },
                      { label: 'Skewness', value: feature.skewness },
                      { label: 'Kurtosis', value: feature.kurtosis },
                    ].map(({ label, value }) => (
                      value !== undefined && value !== null ? (
                        <div key={label} className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="font-semibold">{value.toFixed(3)}</p>
                        </div>
                      ) : null
                    ))}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Data Completeness</p>
                    <Progress value={Math.max(0, Math.min(100, 100 - feature.missing_pct))} className="mt-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(100 - feature.missing_pct).toFixed(1)}% complete
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Top Values</h4>
                    {feature.top_values.length > 0 ? (
                      <div className="space-y-2">
                        {feature.top_values.slice(0, 8).map((item) => (
                          <div key={item.value} className="flex items-center gap-3">
                            <div className="w-32 shrink-0">
                              <p className="truncate text-sm font-medium" title={item.value}>
                                {item.value}
                              </p>
                            </div>
                            {/* Inline bar */}
                            <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                              <div
                                className="h-2 rounded-full bg-primary/70 transition-all"
                                style={{ width: `${Math.min(100, item.pct)}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-muted-foreground w-12 text-right">
                                {item.pct.toFixed(1)}%
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {item.count.toLocaleString()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No value distribution data available</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Data Completeness</p>
                    <Progress value={Math.max(0, Math.min(100, 100 - feature.missing_pct))} className="mt-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(100 - feature.missing_pct).toFixed(1)}% complete
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}