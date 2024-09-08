// components/BotManagementPanel.tsx
import { BotTierDisplay } from './BotTierDisplay'
import { FuelDisplay } from './FuelDisplay'
// import { ActivateBotButton } from './ActivateBotButton'
// import { AddFuelModal } from './AddFuelModal'

interface BotManagementPanelProps {
  channelId: string;
  botTier: string;
  isActive: boolean;
  onActivate: () => Promise<void>;
}

export function BotManagementPanel({ 
  channelId, 
  botTier, 
  isActive, 
  onActivate, 
}: BotManagementPanelProps) {
  const handleActivate = () => {
    // Refresh bot tier and fuel displays
  }

  const handleFuelAdded = () => {
    // Refresh fuel display
  }

  return (
    <div className="space-y-4">
      <BotTierDisplay channelId={channelId} botTier={botTier} />
      <FuelDisplay 
        channelId={channelId}
      />
      {/* <div className="flex space-x-2">
        <ActivateBotButton channelId={channelId} onActivate={handleActivate} />
        <AddFuelModal channelId={channelId} onFuelAdded={handleFuelAdded} />
      </div> */}
    </div>
  )
}