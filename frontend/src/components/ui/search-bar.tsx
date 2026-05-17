import * as React from "react"
import { Search } from "lucide-react"

import { Input, InputProps } from "./input"
import { cn } from "@/lib/utils"

const SearchBar = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          className="pl-9 placeholder:text-muted-foreground/70"
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
SearchBar.displayName = "SearchBar"

export { SearchBar }
