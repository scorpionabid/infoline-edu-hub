
"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import * as ListboxPrimitive from "@radix-ui/react-select"

import { cn } from "@/lib/utils"

const Listbox = ListboxPrimitive.Root

const ListboxTrigger = React.forwardRef<
  React.ElementRef<typeof ListboxPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof ListboxPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <ListboxPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ListboxPrimitive.Icon asChild>
      <ChevronDownIcon className="h-4 w-4 opacity-50" />
    </ListboxPrimitive.Icon>
  </ListboxPrimitive.Trigger>
))
ListboxTrigger.displayName = ListboxPrimitive.Trigger.displayName

const ListboxContent = React.forwardRef<
  React.ElementRef<typeof ListboxPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ListboxPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <ListboxPrimitive.Portal>
    <ListboxPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:animate-in data-[side=left]:animate-in data-[side=right]:animate-in data-[side=top]:animate-in data-[side=bottom]:fade-in-0 data-[side=left]:fade-in-0 data-[side=right]:fade-in-0 data-[side=top]:fade-in-0 data-[side=bottom]:zoom-in-95 data-[side=left]:zoom-in-95 data-[side=right]:zoom-in-95 data-[side=top]:zoom-in-95",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <ListboxPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </ListboxPrimitive.Viewport>
    </ListboxPrimitive.Content>
  </ListboxPrimitive.Portal>
))
ListboxContent.displayName = ListboxPrimitive.Content.displayName

const ListboxItem = React.forwardRef<
  React.ElementRef<typeof ListboxPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ListboxPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <ListboxPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <ListboxPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </ListboxPrimitive.ItemIndicator>
    </span>
    <ListboxPrimitive.ItemText>{children}</ListboxPrimitive.ItemText>
  </ListboxPrimitive.Item>
))
ListboxItem.displayName = ListboxPrimitive.Item.displayName

const ListboxEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex p-2 text-sm text-muted-foreground", className)}
    {...props}
  />
))
ListboxEmpty.displayName = "ListboxEmpty"

const ListboxList = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("py-1", className)} {...props} />
))
ListboxList.displayName = "ListboxList"

export {
  Listbox,
  ListboxContent,
  ListboxEmpty,
  ListboxItem,
  ListboxList,
  ListboxTrigger,
}
