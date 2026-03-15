'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useAnalysisStore } from '@/stores/analysisStore'
import { PLATFORMS, type PlatformType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { 
  ChevronLeft, 
  Upload, 
  File, 
  X, 
  Settings, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface UploadSheetsProps {
  onProcess: () => void
}

export function UploadSheets({ onProcess }: UploadSheetsProps) {
  const { 
    selectedPlatforms, 
    uploadedFiles, 
    setUploadedFiles,
    removeFile,
    settings,
    setSettings,
    isProcessing,
    prevStep 
  } = useAnalysisStore()

  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleFileDrop = useCallback((platform: PlatformType, files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const platformInfo = PLATFORMS[platform]
    const validFiles: File[] = []
    
    Array.from(files).forEach(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (platformInfo.fileTypes.includes(ext)) {
        validFiles.push(file)
      }
    })
    
    if (validFiles.length > 0) {
      const existingFiles = uploadedFiles[platform] || []
      // Deliveroo allows multiple files, others replace
      setUploadedFiles(platform, [...existingFiles, ...validFiles])
    }
  }, [uploadedFiles, setUploadedFiles])

  const allPlatformsHaveFiles = selectedPlatforms.every(
    platform => (uploadedFiles[platform]?.length || 0) > 0
  )

  const handleProcess = () => {
    if (allPlatformsHaveFiles) {
      onProcess()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2E1C5F]">Upload Data Sheets</h2>
          <p className="text-gray-500 mt-1">
            Upload the exported files from each platform
          </p>
        </div>

        {/* Settings Button */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 border-[#2E1C5F]/20 hover:bg-[#2E1C5F]/5">
              <Settings className="h-4 w-4 text-[#2E1C5F]" />
              <span className="text-[#2E1C5F]">Settings</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader className="pb-6 border-b border-gray-100">
              <SheetTitle className="text-xl font-bold text-[#2E1C5F] flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF305D]/10 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-[#FF305D]" />
                </div>
                Analysis Settings
              </SheetTitle>
              <p className="text-sm text-gray-500 mt-2">
                Configure calculation parameters for KPI analysis
              </p>
            </SheetHeader>
            
            <div className="space-y-8 mt-8">
              {/* Actual Sales Rate */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Label className="text-base font-semibold text-[#2E1C5F]">
                      Actual Sales Rate
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage of total sales considered as actual sales
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                    <Input
                      type="number"
                      value={settings.actualSalesRate}
                      onChange={(e) => setSettings({ actualSalesRate: Math.min(100, Math.max(0, Number(e.target.value))) })}
                      className="w-14 h-7 text-center font-semibold text-[#FF305D] border-0 p-0 focus-visible:ring-0"
                      min={0}
                      max={100}
                    />
                    <span className="text-sm font-medium text-[#FF305D]">%</span>
                  </div>
                </div>
                <Slider
                  value={[settings.actualSalesRate]}
                  onValueChange={([value]) => setSettings({ actualSalesRate: value })}
                  max={100}
                  min={0}
                  step={1}
                  className="**:[[role=slider]]:bg-[#FF305D] **:[[role=slider]]:border-2 **:[[role=slider]]:border-white **:[[role=slider]]:shadow-mdd **:[[role=slider]]:h-5 **:[[role=slider]]:w-55 [&>span:first-child]:bg-[#FF305D]/20 [&>span:first-child>span]:bg-[#FF305D]"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Food Cost Rate */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Label className="text-base font-semibold text-[#2E1C5F]">
                      Food Cost Rate
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage of actual sales allocated to food cost
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                    <Input
                      type="number"
                      value={settings.foodCostRate}
                      onChange={(e) => setSettings({ foodCostRate: Math.min(100, Math.max(0, Number(e.target.value))) })}
                      className="w-14 h-7 text-center font-semibold text-[#FF305D] border-0 p-0 focus-visible:ring-0"
                      min={0}
                      max={100}
                    />
                    <span className="text-sm font-medium text-[#FF305D]">%</span>
                  </div>
                </div>
                <Slider
                  value={[settings.foodCostRate]}
                  onValueChange={([value]) => setSettings({ foodCostRate: value })}
                  max={100}
                  min={0}
                  step={1}
                  className="**:[[role=slider]]:bg-[#FF305D] **:[[role=slider]]:border-2 **:[[role=slider]]:border-white **:[[role=slider]]:shadow-md **:[[role=slider]]:h-5 **:[[role=slider]]:w-5 [&>span:first-child]:bg-[#FF305D]/20 [&>span:first-child>span]:bg-[#FF305D]"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Tip:</strong> These settings affect the calculation of Actual Sales, Food Cost, 
                  Difference, and Difference Cost KPIs. Adjust them based on your restaurant's operational metrics.
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedPlatforms.map((platformId, index) => {
          const platform = PLATFORMS[platformId]
          const files = uploadedFiles[platformId] || []
          const hasFiles = files.length > 0
          
          return (
            <motion.div
              key={platformId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200
                ${hasFiles 
                  ? 'border-emerald-300 bg-emerald-50/50' 
                  : 'border-gray-200 border-dashed'
                }
              `}
            >
              {/* Platform Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-sm">
                  <Image
                    src={platform.logo}
                    alt={platform.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2E1C5F]">{platform.name}</h3>
                  <p className="text-xs text-gray-400">
                    Accepts: {platform.fileTypes.join(', ')}
                  </p>
                </div>
                {hasFiles && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
              </div>

              {/* Upload Area */}
              <div
                className={`
                  relative rounded-lg p-4 text-center cursor-pointer
                  transition-colors duration-200
                  ${hasFiles 
                    ? 'bg-emerald-100/50 hover:bg-emerald-100' 
                    : 'bg-gray-50 hover:bg-gray-100'
                  }
                `}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add('ring-2', 'ring-[#FF305D]')
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('ring-2', 'ring-[#FF305D]')
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove('ring-2', 'ring-[#FF305D]')
                  handleFileDrop(platformId, e.dataTransfer.files)
                }}
              >
                <input
                  type="file"
                  accept={platform.fileTypes.join(',')}
                  multiple={true}
                  onChange={(e) => handleFileDrop(platformId, e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {hasFiles ? (
                  <div className="space-y-2">
                    {files.map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-left"
                      >
                        <File className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-gray-700 truncate flex-1">
                          {file.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(platformId, fileIndex)
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <p className="text-xs text-emerald-600 mt-2">
                      Click or drag to add more files
                    </p>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Drag & drop or click to upload
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Multiple files supported
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isProcessing}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleProcess}
          disabled={!allPlatformsHaveFiles || isProcessing}
          className="bg-[#FF305D] hover:bg-[#e02850] text-white gap-2 px-8"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Process Data'
          )}
        </Button>
      </div>
    </motion.div>
  )
}
