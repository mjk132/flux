"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-danger/10">
        <span className="text-3xl font-bold text-danger">!</span>
      </div>
      <h1 className="mb-3 text-2xl font-bold text-white">
        حدث خطأ ما
      </h1>
      <p className="mb-6 max-w-md text-gray-text">
        عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
      </p>
      <Button onClick={reset} variant="secondary">
        <RefreshCw className="ml-2 h-4 w-4" />
        حاول مرة أخرى
      </Button>
    </div>
  );
}
