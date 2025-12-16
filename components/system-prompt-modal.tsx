"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SYSTEM_PROMPT, FIXED_TEMPERATURE } from "@/lib/constants"
import { Code, Thermometer, Info } from "lucide-react"

export function SystemPromptModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
          <Code className="h-3 w-3 mr-1" />
          View system prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            System Prompt (shared by all models)
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span>This exact prompt is sent to every model.</span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Thermometer className="h-3 w-3" />
              temp={FIXED_TEMPERATURE}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md flex-shrink-0 mt-2">
          <Info className="h-3.5 w-3.5 flex-shrink-0" />
          <span>This is the exact system prompt used for every model call. Nothing is hidden.</span>
        </div>

        <div className="flex-1 min-h-0 mt-4 overflow-hidden rounded-lg border bg-muted">
          <div className="h-full overflow-y-auto overflow-x-auto p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed">{SYSTEM_PROMPT}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
