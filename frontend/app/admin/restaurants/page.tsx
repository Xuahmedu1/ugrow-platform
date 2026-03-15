'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRestaurantStore } from '@/stores/restaurantStore'
import { useTranslation } from '@/stores/languageStore'
import type { Restaurant, AccountStatus } from '@/lib/types'
import { RestaurantCard } from '@/components/admin/restaurants/RestaurantCard'
import { RestaurantForm } from '@/components/admin/restaurants/RestaurantForm'
import { RestaurantDetail } from '@/components/admin/restaurants/RestaurantDetail'
import { ChangeStatusDialog } from '@/components/admin/restaurants/ChangeStatusDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Filter } from 'lucide-react'

type FilterStatus = 'all' | AccountStatus

export default function RestaurantsPage() {
  const { t } = useTranslation()
  const { restaurants, addRestaurant, updateRestaurant, changeStatus } = useRestaurantStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)

  // Filter restaurants
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.area?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddNew = () => {
    setSelectedRestaurant(null)
    setIsFormOpen(true)
  }

  const handleEdit = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsFormOpen(true)
  }

  const handleView = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsDetailOpen(true)
  }

  const handleChangeStatus = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsStatusDialogOpen(true)
  }

  const handleSaveRestaurant = (data: Partial<Restaurant>) => {
    if (selectedRestaurant) {
      updateRestaurant(selectedRestaurant.id, data)
    } else {
      addRestaurant(data as Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>)
    }
  }

  const handleConfirmStatusChange = (newStatus: AccountStatus) => {
    if (selectedRestaurant) {
      changeStatus(selectedRestaurant.id, newStatus)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-[#2E1C5F]">
          {t('restaurants.title')}
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your restaurant clients and their platform credentials
        </p>
      </motion.div>

      {/* Filters & Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select
            value={statusFilter}
            onValueChange={(value: FilterStatus) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="hold">On Hold</SelectItem>
              <SelectItem value="deactivated">Deactivated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Button */}
        <Button
          onClick={handleAddNew}
          className="bg-[#FF305D] hover:bg-[#e02850] text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('restaurants.add')}
        </Button>
      </motion.div>

      {/* Restaurant Grid */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant, index) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              index={index}
              onEdit={handleEdit}
              onView={handleView}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No restaurants found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first restaurant'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button
              onClick={handleAddNew}
              className="mt-4 bg-[#FF305D] hover:bg-[#e02850] text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Restaurant
            </Button>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <RestaurantForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveRestaurant}
        restaurant={selectedRestaurant}
      />

      <RestaurantDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        restaurant={selectedRestaurant}
      />

      <ChangeStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        restaurant={selectedRestaurant}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  )
}
