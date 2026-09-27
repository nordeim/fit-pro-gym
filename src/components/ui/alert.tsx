import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * shadcn-style Alert, base classes extracted from the reference's live DOM
 * (its login error box). The reference renders errors as
 *   <div role="alert" class="relative w-full border p-4 … bg-red-50/70
 *    border-red-200 rounded-xl"><div class="text-red-700 text-sm …">…
 */
function Alert({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full border p-4",
        "[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
        "text-foreground",
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("[&_p]:leading-relaxed text-sm font-medium", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("[&_p]:leading-relaxed text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
