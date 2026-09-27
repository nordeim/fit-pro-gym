"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        // S7-R7: the reference's shadcn Label base (v3-era, extracted from
        // its bundle): text-sm font-medium leading-none peer-disabled:*.
        // The v4-shadcn base (flex items-center gap-2 select-none
        // group-data-[disabled=true]:* peer-disabled:opacity-50) drifted
        // both the class string and the rendered line-height.
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
}

export { Label };
