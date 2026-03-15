import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Restaurant, AccountStatus, PlatformType, PlatformCredential } from '@/lib/types'

interface RestaurantState {
  restaurants: Restaurant[]
  selectedRestaurant: Restaurant | null
  isLoading: boolean
  
  // Actions
  setRestaurants: (restaurants: Restaurant[]) => void
  addRestaurant: (restaurant: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => void
  deleteRestaurant: (id: string) => void
  changeStatus: (id: string, status: AccountStatus) => void
  setSelectedRestaurant: (restaurant: Restaurant | null) => void
  getRestaurantById: (id: string) => Restaurant | undefined
  getActiveRestaurants: () => Restaurant[]
}

// Mock restaurants data
const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Sharea Alkebda',
    ownerName: 'Ahmed Al Maktoum',
    ownerPhone: '+971501234567',
    managerName: 'Khalid Hassan',
    managerPhone: '+971507654321',
    area: 'Deira',
    address: 'Al Rigga Road, Building 45',
    googleMapsUrl: 'https://maps.google.com/?q=25.2666,55.3273',
    profileImage: undefined,
    platforms: ['talabat', 'keeta', 'noon', 'deliveroo'],
    credentials: [
      { platform: 'talabat', email: 'sharea@talabat.com', password: 'talabat123' },
      { platform: 'keeta', email: 'sharea@keeta.com', password: 'keeta123' },
      { platform: 'noon', email: 'sharea@noon.com', password: 'noon123' },
      { platform: 'deliveroo', email: 'sharea@deliveroo.com', password: 'deliveroo123', tabletEmail: 'tablet@deliveroo.com', tabletPassword: 'tablet123' }
    ],
    status: 'active',
    clientUsername: 'sharea',
    clientPassword: 'sharea123',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-10T14:30:00Z'
  },
  {
    id: 'rest-2',
    name: 'Bites Kitchen',
    ownerName: 'Mohammed Ali',
    ownerPhone: '+971502345678',
    managerName: 'Sara Ahmed',
    managerPhone: '+971508765432',
    area: 'Dubai Marina',
    address: 'Marina Walk, Tower B',
    googleMapsUrl: 'https://maps.google.com/?q=25.0805,55.1403',
    profileImage: undefined,
    platforms: ['talabat', 'careem', 'smiles'],
    credentials: [
      { platform: 'talabat', email: 'bites@talabat.com', password: 'talabat456' },
      { platform: 'careem', email: 'bites@careem.com', password: 'careem456' },
      { platform: 'smiles', email: 'bites@smiles.com', password: 'smiles456' }
    ],
    status: 'active',
    clientUsername: 'bites',
    clientPassword: 'bites123',
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-03-08T11:20:00Z'
  },
  {
    id: 'rest-3',
    name: 'Gulf Shawarma',
    ownerName: 'Rashid Bin Saeed',
    ownerPhone: '+971503456789',
    managerName: 'Omar Farouk',
    managerPhone: '+971509876543',
    area: 'Jumeirah',
    address: 'Jumeirah Beach Road',
    googleMapsUrl: 'https://maps.google.com/?q=25.2048,55.2708',
    profileImage: undefined,
    platforms: ['talabat', 'noon'],
    credentials: [
      { platform: 'talabat', email: 'gulf@talabat.com', password: 'talabat789' },
      { platform: 'noon', email: 'gulf@noon.com', password: 'noon789' }
    ],
    status: 'hold',
    clientUsername: 'gulf',
    clientPassword: 'gulf123',
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-03-01T16:45:00Z'
  },
  {
    id: 'rest-4',
    name: 'Al Bahar Grills',
    ownerName: 'Sultan Al Nahyan',
    ownerPhone: '+971504567890',
    managerName: 'Yusuf Ibrahim',
    managerPhone: '+971500987654',
    area: 'Abu Dhabi',
    address: 'Corniche Road',
    googleMapsUrl: 'https://maps.google.com/?q=24.4539,54.3773',
    profileImage: undefined,
    platforms: ['keeta', 'careem'],
    credentials: [
      { platform: 'keeta', email: 'bahar@keeta.com', password: 'keeta999' },
      { platform: 'careem', email: 'bahar@careem.com', password: 'careem999' }
    ],
    status: 'deactivated',
    clientUsername: 'bahar',
    clientPassword: 'bahar123',
    createdAt: '2023-12-10T12:00:00Z',
    updatedAt: '2024-02-15T09:15:00Z'
  }
]

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      restaurants: MOCK_RESTAURANTS,
      selectedRestaurant: null,
      isLoading: false,

      setRestaurants: (restaurants) => set({ restaurants }),

      addRestaurant: (restaurantData) => {
        const newRestaurant: Restaurant = {
          ...restaurantData,
          id: `rest-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        set((state) => ({
          restaurants: [...state.restaurants, newRestaurant]
        }))
      },

      updateRestaurant: (id, updates) => {
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r
          )
        }))
      },

      deleteRestaurant: (id) => {
        set((state) => ({
          restaurants: state.restaurants.filter((r) => r.id !== id)
        }))
      },

      changeStatus: (id, status) => {
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r.id === id
              ? { ...r, status, updatedAt: new Date().toISOString() }
              : r
          )
        }))
      },

      setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),

      getRestaurantById: (id) => {
        return get().restaurants.find((r) => r.id === id)
      },

      getActiveRestaurants: () => {
        return get().restaurants.filter((r) => r.status === 'active')
      }
    }),
    {
      name: 'ugrow-restaurant-storage'
    }
  )
)
