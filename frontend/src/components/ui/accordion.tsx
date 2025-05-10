"use client";
import React from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  collapsible?: boolean;
  children: React.ReactNode;
}

export interface AccordionItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface AccordionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={clsx("border-t divide-y", className)} {...props}>
      {children}
    </div>
  );
};

export const AccordionItem: React.FC<AccordionItemProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={clsx("overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
};

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  className,
  ...props
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <button
      className={clsx(
        "w-full flex justify-between items-center px-4 py-3 text-left",
        className
      )}
      onClick={() => setOpen((o) => !o)}
      {...props}
    >
      {children}
      <ChevronDown
        className={clsx("h-4 w-4 transition-transform", open && "rotate-180")}
      />
    </button>
  );
};

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={clsx("px-4 pb-4", className)} {...props}>
      {children}
    </div>
  );
};
