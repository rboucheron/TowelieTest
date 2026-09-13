import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Button, Input } from '@/components/ui'

export interface OrderedStepsFieldProps {
  value: string[]
  onChange: (steps: string[]) => void
}

export function OrderedStepsField({ value, onChange }: OrderedStepsFieldProps) {
  const steps = value.length > 0 ? value : ['']

  function updateStep(index: number, text: string) {
    const next = [...steps]
    next[index] = text
    onChange(next)
  }

  function addStep() {
    onChange([...steps, ''])
  }

  function removeStep(index: number) {
    const next = steps.filter((_, i) => i !== index)
    onChange(next.length > 0 ? next : [''])
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= steps.length) return
    const next = [...steps]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {index + 1}
          </span>
          <Input
            value={step}
            onChange={(event) => updateStep(index, event.target.value)}
            placeholder={`Step ${index + 1}`}
          />
          <div className="flex shrink-0 gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => moveStep(index, -1)}
              disabled={index === 0}
              aria-label="Move step up"
            >
              <ChevronUp className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => moveStep(index, 1)}
              disabled={index === steps.length - 1}
              aria-label="Move step down"
            >
              <ChevronDown className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeStep(index)}
              disabled={steps.length === 1}
              aria-label="Remove step"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addStep}
        className="gap-1.5"
      >
        <Plus className="size-3.5" /> Add step
      </Button>
    </div>
  )
}
