'use client';

import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { CheckCircle, ChevronRight } from 'lucide-react';

interface NavigationFooterProps {
  onProceed: () => void;
  isLoaded: boolean;
}

export function NavigationFooter({
  onProceed,
  isLoaded,
}: NavigationFooterProps) {
  return (
    <div className="border-t border-border pt-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Step 1 of 6</span>
              </div>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-semibold">Upload & Explore</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Status Indicator */}
        {isLoaded && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300">
              Dataset loaded ✓
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button
          onClick={onProceed}
          disabled={!isLoaded}
          className="flex-1"
          size="lg"
        >
          Proceed to Training
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
