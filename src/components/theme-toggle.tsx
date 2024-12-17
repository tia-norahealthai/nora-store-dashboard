"use client"

import { useTheme } from "@/components/providers/theme-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>Dark Mode</Label>
        <div className="text-sm text-muted-foreground">
          Switch between light and dark mode
        </div>
      </div>
      <Switch 
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
    </div>
  )
} 