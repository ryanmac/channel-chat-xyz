"use client"

import * as React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const CardCollapsible = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
CardCollapsible.displayName = "CardCollapsible"

const CardCollapsibleHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onToggle?: () => void; isCollapsed?: boolean }
>(({ className, onToggle, isCollapsed, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-row items-center justify-between p-6 cursor-pointer", className)}
    onClick={onToggle}
    {...props}
  >
    <div className="flex flex-col space-y-1.5 flex-grow">{children}</div>
    <div className="flex-shrink-0 ml-4">
      {isCollapsed ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronUp className="h-4 w-4" />
      )}
    </div>
  </div>
))
CardCollapsibleHeader.displayName = "CardCollapsibleHeader"

const CardCollapsibleTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardCollapsibleTitle.displayName = "CardCollapsibleTitle"

const CardCollapsibleDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardCollapsibleDescription.displayName = "CardCollapsibleDescription"

const CardCollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isCollapsed?: boolean }
>(({ className, isCollapsed, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "p-6 pt-0 overflow-hidden transition-all duration-200 ease-in-out",
      isCollapsed ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100",
      className
    )} 
    {...props} 
  />
))
CardCollapsibleContent.displayName = "CardCollapsibleContent"

const CardCollapsibleFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardCollapsibleFooter.displayName = "CardCollapsibleFooter"

export { 
  CardCollapsible, 
  CardCollapsibleHeader, 
  CardCollapsibleFooter, 
  CardCollapsibleTitle, 
  CardCollapsibleDescription, 
  CardCollapsibleContent 
}