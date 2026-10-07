import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <main
      className={`min-w-0 flex-1 overflow-x-hidden bg-[var(--color-bg)] ${className}`}
    >
      <div className="mx-auto w-full max-w-[1800px] px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7 xl:px-8">
        {children}
      </div>
    </main>
  );
}