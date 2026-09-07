import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "card-glass rounded-xl p-5",
        hover && "hover:bg-white/5 transition-colors cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
