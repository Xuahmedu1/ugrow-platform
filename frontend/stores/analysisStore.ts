import { create } from "zustand";
import type {
  Restaurant,
  PlatformType,
  AnalysisSettings,
  PlatformKPIResult,
  KPIResult,
} from "@/lib/types";

interface AnalysisState {
  // Wizard state
  step: number;
  selectedRestaurant: Restaurant | null;
  dateFrom: string;
  dateTo: string;
  selectedPlatforms: PlatformType[];
  uploadedFiles: Record<PlatformType, File[]>;
  settings: AnalysisSettings;

  // Results
  results: PlatformKPIResult[];
  totalKPI: KPIResult | null;
  isProcessing: boolean;
  processingProgress: number;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  setDateRange: (from: string, to: string) => void;
  setSelectedPlatforms: (platforms: PlatformType[]) => void;
  togglePlatform: (platform: PlatformType) => void;
  setUploadedFiles: (platform: PlatformType, files: File[]) => void;
  removeFile: (platform: PlatformType, fileIndex: number) => void;
  setSettings: (settings: Partial<AnalysisSettings>) => void;
  setResults: (results: PlatformKPIResult[], totalKPI: KPIResult) => void;
  setProcessing: (isProcessing: boolean, progress?: number) => void;
  reset: () => void;
}

const initialSettings: AnalysisSettings = {
  actualSalesRate: 100,
  foodCostRate: 35,
};

const initialState = {
  step: 1,
  selectedRestaurant: null,
  dateFrom: "",
  dateTo: "",
  selectedPlatforms: [] as PlatformType[],
  uploadedFiles: {} as Record<PlatformType, File[]>,
  settings: initialSettings,
  results: [] as PlatformKPIResult[],
  totalKPI: null as KPIResult | null,
  isProcessing: false,
  processingProgress: 0,
};

export const useAnalysisStore = create<AnalysisState>()((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  nextStep: () => {
    const { step } = get();
    if (step < 4) {
      set({ step: step + 1 });
    }
  },

  prevStep: () => {
    const { step } = get();
    if (step > 1) {
      set({ step: step - 1 });
    }
  },

  setSelectedRestaurant: (restaurant) =>
    set({
      selectedRestaurant: restaurant,
      // Reset platforms when restaurant changes
      selectedPlatforms: [],
      uploadedFiles: {
        talabat: [],
        keeta: [],
        noon: [],
        smiles: [],
        deliveroo: [],
        careem: []
      },
    }),

  setDateRange: (from, to) =>
    set({
      dateFrom: from,
      dateTo: to,
    }),

  setSelectedPlatforms: (platforms) => set({ selectedPlatforms: platforms }),

  togglePlatform: (platform) => {
    const { selectedPlatforms, uploadedFiles } = get();
    if (selectedPlatforms.includes(platform)) {
      // Remove platform and its files
      const newFiles = { ...uploadedFiles };
      delete newFiles[platform];
      set({
        selectedPlatforms: selectedPlatforms.filter((p) => p !== platform),
        uploadedFiles: newFiles,
      });
    } else {
      set({
        selectedPlatforms: [...selectedPlatforms, platform],
      });
    }
  },

  setUploadedFiles: (platform, files) => {
    const { uploadedFiles } = get();
    set({
      uploadedFiles: {
        ...uploadedFiles,
        [platform]: files,
      },
    });
  },

  removeFile: (platform, fileIndex) => {
    const { uploadedFiles } = get();
    const platformFiles = uploadedFiles[platform] || [];
    const newFiles = platformFiles.filter((_, index) => index !== fileIndex);
    set({
      uploadedFiles: {
        ...uploadedFiles,
        [platform]: newFiles,
      },
    });
  },

  setSettings: (newSettings) => {
    const { settings } = get();
    set({ settings: { ...settings, ...newSettings } });
  },

  setResults: (results, totalKPI) =>
    set({
      results,
      totalKPI,
    }),

  setProcessing: (isProcessing, progress = 0) =>
    set({
      isProcessing,
      processingProgress: progress,
    }),

  reset: () => set(initialState),
}));
