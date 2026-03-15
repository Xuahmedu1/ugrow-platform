/**
 * UGROW Form Validators
 * Zod schemas for form validation
 * Ensures consistency between frontend and backend validation
 */

import { z } from 'zod'

// ============================================
// Enum Definitions (must be values, not types)
// ============================================

export enum PlatformType {
  TALABAT = 'talabat',
  KEETA = 'keeta',
  NOON = 'noon',
  SMILES = 'smiles',
  DELIVEROO = 'deliveroo',
  CAREEM = 'careem',
}

export enum RestaurantStatus {
  ACTIVE = 'active',
  HOLD = 'hold',
  DEACTIVATED = 'deactivated',
}

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
}

export enum UserStatus {
  ACTIVE = 'active',
  HOLD = 'hold',
  DEACTIVATED = 'deactivated',
}

// ============================================
// Common Validators
// ============================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .refine(
    (email) => email.endsWith('@ugrow.com'),
    'Email must end with @ugrow.com'
  )

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be at most 50 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens'
  )

export const phoneSchema = z
  .string()
  .regex(
    /^[\d\s\-\+\(\)]+$/,
    'Invalid phone number format'
  )
  .optional()
  .or(z.literal(''))

export const percentageSchema = z
  .number()
  .min(0, 'Percentage must be at least 0')
  .max(100, 'Percentage must be at most 100')

export const dateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Invalid date format (YYYY-MM-DD)'
)

// ============================================
// Auth Validators
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

export type LoginInput = z.infer<typeof loginSchema>

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
)

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ============================================
// Restaurant Validators
// ============================================

export const restaurantSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required').max(200),
  ownerName: z.string().max(200).optional().or(z.literal('')),
  ownerPhone: phoneSchema,
  managerName: z.string().max(200).optional().or(z.literal('')),
  managerPhone: phoneSchema,
  area: z.string().max(200).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  googleMapsUrl: z
    .string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),
  platforms: z
    .array(z.nativeEnum(PlatformType))
    .min(1, 'Select at least one platform'),
  status: z.nativeEnum(RestaurantStatus),
  profileImage: z.instanceof(File).optional().or(z.string().optional()),
})

export type RestaurantInput = z.infer<typeof restaurantSchema>

// Schema for creating restaurant with client credentials
export const createRestaurantWithClientSchema = restaurantSchema.extend({
  clientUsername: usernameSchema,
  clientPassword: z
    .string()
    .min(6, 'Client password must be at least 6 characters'),
  generatePassword: z.boolean().default(false),
})

export type CreateRestaurantWithClientInput = z.infer<
  typeof createRestaurantWithClientSchema
>

// ============================================
// Platform Credentials Validators
// ============================================

export const platformCredentialSchema = z.object({
  platform: z.nativeEnum(PlatformType),
  credentialType: z.enum(['portal', 'tablet']).default('portal'),
  loginEmail: z.string().min(1, 'Login email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export type PlatformCredentialInput = z.infer<typeof platformCredentialSchema>

// ============================================
// Analysis Validators
// ============================================

export const analysisSettingsSchema = z.object({
  actualSalesRate: percentageSchema.default(75),
  foodCostRate: percentageSchema.default(30),
})

export type AnalysisSettingsInput = z.infer<typeof analysisSettingsSchema>

export const platformSettingsSchema = z.record(
  z.nativeEnum(PlatformType),
  analysisSettingsSchema
)

export type PlatformSettingsInput = z.infer<typeof platformSettingsSchema>

export const dateRangeSchema = z.object({
  from: dateSchema,
  to: dateSchema,
}).refine(
  (data) => {
    const fromDate = new Date(data.from)
    const toDate = new Date(data.to)
    return fromDate <= toDate
  },
  {
    message: 'End date must be after start date',
    path: ['to'],
  }
)

export type DateRangeInput = z.infer<typeof dateRangeSchema>

export const analysisWizardSchema = z.object({
  restaurantId: z.string().uuid('Please select a restaurant'),
  dateRange: dateRangeSchema,
  platforms: z
    .array(z.nativeEnum(PlatformType))
    .min(1, 'Select at least one platform'),
  settings: platformSettingsSchema,
  files: z.record(z.array(z.instanceof(File))).refine(
    (files) => Object.values(files).some((arr) => arr.length > 0),
    'Please upload at least one file'
  ),
})

export type AnalysisWizardInput = z.infer<typeof analysisWizardSchema>

// ============================================
// File Upload Validators
// ============================================

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ACCEPTED_FILE_TYPES: Record<PlatformType, string[]> = {
  [PlatformType.TALABAT]: ['.xlsx'],
  [PlatformType.KEETA]: ['.xlsx'],
  [PlatformType.NOON]: ['.csv'],
  [PlatformType.SMILES]: ['.xls'],
  [PlatformType.DELIVEROO]: ['.csv'],
  [PlatformType.CAREEM]: ['.xlsx'],
}

export const fileUploadSchema = (platform: PlatformType) =>
  z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `File size must be less than 10MB`
    )
    .refine(
      (file) => {
        const acceptedTypes = ACCEPTED_FILE_TYPES[platform]
        return acceptedTypes.some((type) =>
          file.name.toLowerCase().endsWith(type)
        )
      },
      `Invalid file type for ${platform}. Accepted: ${ACCEPTED_FILE_TYPES[
        platform
      ].join(', ')}`
    )

// ============================================
// Report Validators
// ============================================

export const saveReportSchema = z.object({
  restaurantId: z.string().uuid(),
  dateFrom: dateSchema,
  dateTo: dateSchema,
  platforms: z.array(z.nativeEnum(PlatformType)),
  settings: analysisSettingsSchema,
  results: z.array(
    z.object({
      platform: z.nativeEnum(PlatformType),
      kpi: z.object({
        numOrders: z.number(),
        totalSales: z.number(),
        discount: z.number(),
        earnings: z.number(),
        actualSales: z.number(),
        netRevenue: z.number(),
        expenses: z.number(),
        difference: z.number(),
        foodCost: z.number(),
        differenceCost: z.number(),
      }),
    })
  ),
  totalKPI: z.object({
    numOrders: z.number(),
    totalSales: z.number(),
    discount: z.number(),
    earnings: z.number(),
    actualSales: z.number(),
    netRevenue: z.number(),
    expenses: z.number(),
    difference: z.number(),
    foodCost: z.number(),
    differenceCost: z.number(),
  }),
})

export type SaveReportInput = z.infer<typeof saveReportSchema>

// ============================================
// User Management Validators (Admin)
// ============================================

export const createUserSchema = z.object({
  username: usernameSchema,
  email: z.string().optional(), // Will be auto-generated as username@ugrow.com
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional(),
  role: z.nativeEnum(UserRole).default(UserRole.CLIENT),
  restaurantId: z.string().uuid().optional(),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = createUserSchema.partial().omit({
  password: true, // Password updates handled separately
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

// ============================================
// Status Change Validators
// ============================================

export const statusChangeSchema = z.object({
  id: z.string().uuid(),
  status: z.union([
    z.nativeEnum(UserStatus),
    z.nativeEnum(RestaurantStatus),
  ]),
  reason: z.string().optional(),
})

export type StatusChangeInput = z.infer<typeof statusChangeSchema>

// ============================================
// Helper Functions
// ============================================

/**
 * Validate file for specific platform
 */
export function validatePlatformFile(
  file: File,
  platform: PlatformType
): { valid: boolean; error?: string } {
  const schema = fileUploadSchema(platform)
  const result = schema.safeParse(file)
  
  if (!result.success) {
    return {
      valid: false,
      error: result.error.errors[0]?.message || 'Invalid file',
    }
  }
  
  return { valid: true }
}

/**
 * Validate email domain
 */
export function validateUgrowEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

/**
 * Format validation errors for display
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    errors[path] = err.message
  })
  
  return errors
}