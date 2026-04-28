'use client';

import { SyntheticDataSummary } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SyntheticDataTableProps {
  syntheticData: SyntheticDataSummary[];
  onDelete: (data: SyntheticDataSummary) => void;
}

export function SyntheticDataTable({ syntheticData, onDelete }: SyntheticDataTableProps) {
  if (syntheticData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generated Synthetic Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No synthetic data generated yet.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Train a model and use it to generate synthetic data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Synthetic Data ({syntheticData.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rows</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syntheticData.map((data) => (
                <TableRow key={data.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">Synthetic Data</span>
                      <span className="text-xs text-muted-foreground font-mono">{data.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{data.n_rows.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        data.status === 'completed'
                          ? 'default'
                          : data.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {data.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {data.created_at ? (
                      <span className="text-sm">
                        {new Date(data.created_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(data)}
                          className="text-destructive focus:text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
