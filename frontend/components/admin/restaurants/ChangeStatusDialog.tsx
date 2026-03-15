'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Restaurant, AccountStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle2, PauseCircle, XCircle } from 'lucide-react'

interface ChangeStatusDialogProps {
  isOpen: boolean
  onClose: () => void
  restaurant: Restaurant | null
  onConfirm: (status: AccountStatus) => void
}

const statusOptions: { value: AccountStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { 
    value: 'active', 
    label: 'Active', 
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: 'text-emerald-600'
  },
  { 
    value: 'hold', 
    label: 'On Hold', 
    icon: <PauseCircle className="h-5 w-5" />,
    color: 'text-amber-600'
  },
  { 
    value: 'deactivated', 
    label: 'Deactivated', 
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-red-600'
  }
]

export function ChangeStatusDialog({ 
  isOpen, 
  onClose, 
  restaurant, 
  onConfirm 
}: ChangeStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus | null>(null)

  const handleConfirm = () => {
    if (selectedStatus && restaurant) {
      onConfirm(selectedStatus)
      setSelectedStatus(null)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedStatus(null)
    onClose()
  }

  if (!restaurant) return null

  const currentStatus = statusOptions.find(s => s.value === restaurant.status)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#2E1C5F]">
            Change Restaurant Status
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Update the status for <span className="font-medium text-[#2E1C5F]">{restaurant.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Current Status */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">Current Status:</span>
            <span className={`flex items-center gap-1.5 font-medium ${currentStatus?.color}`}>
              {currentStatus?.icon}
              {currentStatus?.label}
            </span>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2E1C5F]">
              New Status
            </label>
            <Select
              value={selectedStatus || ''}
              onValueChange={(value: AccountStatus) => setSelectedStatus(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    disabled={option.value === restaurant.status}
                  >
                    <span className={`flex items-center gap-2 ${option.color}`}>
                      {option.icon}
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warning for deactivation */}
          {selectedStatus === 'deactivated' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg"
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Warning</p>
                <p>Deactivating this restaurant will prevent the client from logging in and accessing their data.</p>
              </div>
            </motion.div>
          )}

          {/* Warning for hold */}
          {selectedStatus === 'hold' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg"
            >
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Note</p>
                <p>Putting this restaurant on hold will temporarily prevent the client from logging in.</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedStatus || selectedStatus === restaurant.status}
            className="bg-[#2E1C5F] hover:bg-[#3d2878] text-white"
          >
            Confirm Change
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
