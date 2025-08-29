import { cn } from "@/lib/utils";
import React from "react";

const BulletedList = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("mt-4 ml-6 list-disc [&>li]:mt-2", className)}
    {...props}
  />
));

export default BulletedList;
