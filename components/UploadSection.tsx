'use client';

import { ChangeEvent, DragEvent, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, FileText } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { uploadDataset } from '@/lib/api';

interface UploadSectionProps {
  onUploadComplete: (data: any) => void;
  isLoading: boolean;
  error: string | null;
  onTargetChange: (target: string) => void;
  selectedTarget: string;
}

export function UploadSection({
  onUploadComplete,
  isLoading,
  error,
  onTargetChange,
  selectedTarget,
}: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const parseCSVColumns = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        if (lines.length > 0) {
          const headerLine = lines[0];
          const parsedColumns = headerLine.split(',').map(col => col.trim());
          setColumns(parsedColumns);
          if (parsedColumns.length > 0 && !parsedColumns.includes(selectedTarget)) {
            onTargetChange(parsedColumns[0]);
          }
        }
      } catch (err) {
        console.error('Error parsing CSV columns:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        parseCSVColumns(file);
      }
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      parseCSVColumns(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      const data = await uploadDataset(selectedFile, selectedTarget);
      onUploadComplete(data);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full border-2">
      <CardHeader>
        <CardTitle>Upload & Explore</CardTitle>
        <CardDescription>
          Upload your CSV dataset to analyze features and target distribution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed px-6 py-12 transition-colors ${isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/30 bg-muted/30'
            }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="font-semibold">Drag and drop your CSV file here</p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
          </div>

          <Input
            type="file"
            accept=".csv"
          onChange={handleFileInput}
          disabled={isLoading || isUploading}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        </div>

        {/* File Selection Display */}
        {selectedFile && (
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        )}

        {/* Target Column Selection */}
        {selectedFile && columns.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Target Column
            </label>
          <Select value={selectedTarget} onValueChange={onTargetChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the column to use as your target variable
            </p>
          </div>
        )}

        {/* Error Message */}
        {(error || uploadError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isLoading || isUploading}
          className="w-full"
          size="lg"
        >
          {isLoading || isUploading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Analyzing Dataset...
            </>
          ) : (
            'Upload & Analyze'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
