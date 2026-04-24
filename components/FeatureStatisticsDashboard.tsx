'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FeatureStatisticsDashboardProps {
  features: Record<string, any>;
}

export function FeatureStatisticsDashboard({
  features,
}: FeatureStatisticsDashboardProps) {
  // Convert features object to array format
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

  const displayFeatures = featureArray.slice(0, 10);

  if (displayFeatures.length === 0) {
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
        <Tabs
          defaultValue={displayFeatures[0]?.name || ''}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-6">
            {displayFeatures.map((feature) => (
              <TabsTrigger
                key={feature.name}
                value={feature.name}
                className="text-xs"
              >
                {feature.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {displayFeatures.map((feature) => (
            <TabsContent
              key={feature.name}
              value={feature.name}
              className="space-y-4 mt-4 w-full"
            >
              {/* Feature Header Info */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Data Type</p>
                  <Badge
                    variant={
                      feature.type === 'numeric' ? 'default' : 'secondary'
                    }
                  >
                    {feature.type}
                  </Badge>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Cardinality</p>
                  <p className="text-lg font-bold">{feature.cardinality}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Missing %</p>
                  <p className="text-lg font-bold">
                    {feature.missing_pct.toFixed(1)}%
                  </p>
                </div>
                {feature.type === 'numeric' && feature.mean && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Mean</p>
                    <p className="text-lg font-bold">
                      {feature.mean.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Feature Specific Content */}
              {feature.type === 'numeric' ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Distribution</h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Min', value: feature.min || 0 },
                            { name: 'Mean', value: feature.mean || 0 },
                            { name: 'Max', value: feature.max || 0 },
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
                          />
                          <Bar
                            dataKey="value"
                            fill="hsl(var(--chart-1))"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Min</p>
                        <p className="font-semibold">
                          {feature.min?.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mean</p>
                        <p className="font-semibold">
                          {feature.mean?.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Max</p>
                        <p className="font-semibold">
                          {feature.max?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Data Completeness</p>
                    <Progress
                      value={100 - feature.missing_pct}
                      className="mt-2"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(100 - feature.missing_pct).toFixed(1)}% complete
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Top Values</h4>
                    <div className="space-y-2">
                      {feature.top_values?.slice(0, 5).map((val: string) => (
                        <div key={val} className="flex items-center gap-2">
                          <div className="flex-1">
                            <p className="text-sm">{val}</p>
                          </div>
                          <Badge variant="outline">{val.length} chars</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Data Completeness</p>
                    <Progress
                      value={100 - feature.missing_pct}
                      className="mt-2"
                    />
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
