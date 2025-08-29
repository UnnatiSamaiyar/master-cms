"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { FallbackProps } from "react-error-boundary";

export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <div role="alert" className="my-2">
      <p className="leading-7" style={{ color: "red" }}>
        {error.name}:{error.message}
      </p>
      <Button onClick={() => resetErrorBoundary()} className="my-2">
        Reset
      </Button>
    </div>
  );
}
