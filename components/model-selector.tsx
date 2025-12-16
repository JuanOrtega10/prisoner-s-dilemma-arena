"use client"
import { AVAILABLE_MODELS, type Model } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ModelSelectorProps {
  selectedModels: Model[]
  onSelectionChange: (models: Model[]) => void
}

export function ModelSelector({ selectedModels, onSelectionChange }: ModelSelectorProps) {
  const toggleModel = (model: Model) => {
    const isSelected = selectedModels.some((m) => m.id === model.id)
    if (isSelected) {
      onSelectionChange(selectedModels.filter((m) => m.id !== model.id))
    } else {
      onSelectionChange([...selectedModels, model])
    }
  }

  return (
    <div className="space-y-3">
      {AVAILABLE_MODELS.map((model) => {
        const isSelected = selectedModels.some((m) => m.id === model.id)
        return (
          <div
            key={model.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
              isSelected ? "border-foreground bg-muted" : "border-border hover:border-muted-foreground"
            }`}
            onClick={() => toggleModel(model)}
          >
            <Checkbox checked={isSelected} />
            <div className="flex-1">
              <Label className="font-medium cursor-pointer">{model.displayName}</Label>
              <p className="text-sm text-muted-foreground">{model.provider}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
