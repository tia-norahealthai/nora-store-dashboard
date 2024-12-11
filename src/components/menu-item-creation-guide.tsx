import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function MenuItemCreationGuide({ onComplete }: { onComplete: (data: any) => void }) {
  const [step, setStep] = useState(1)
  const [itemData, setItemData] = useState({
    name: '',
    price: '',
    category: '',
    description: ''
  })

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      onComplete(itemData)
    }
  }

  return (
    <div className="space-y-4">
      {step === 1 && (
        <div className="space-y-2">
          <Label>What's the name of the dish?</Label>
          <Input
            value={itemData.name}
            onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
            placeholder="e.g., Margherita Pizza"
          />
        </div>
      )}
      {/* Add similar sections for other steps */}
      <Button onClick={handleNext}>
        {step < 4 ? 'Next' : 'Create Item'}
      </Button>
    </div>
  )
} 