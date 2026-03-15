// English-only translation system for UGROW

// All UI translations (English only)
const translations: Record<string, string> = {
  // Navigation
  'nav.restaurants': 'Restaurant Management',
  'nav.analysis': 'Data Analysis',
  'nav.reports': 'My Reports',
  'nav.savedReports': 'Saved Reports',
  'nav.credentials': 'Platform Credentials',
  'nav.about': 'About UGROW',
  'nav.contact': 'Contact',
  'nav.logout': 'Logout',
  
  // Auth
  'auth.login': 'Login',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.invalidCredentials': 'Invalid email or password',
  'auth.accountOnHold': 'Your account is currently on hold. Please contact support.',
  'auth.accountDeactivated': 'Your account has been deactivated. Please contact support.',
  
  // Restaurants
  'restaurants.title': 'Restaurant Management',
  'restaurants.add': 'Add Restaurant',
  'restaurants.edit': 'Edit Restaurant',
  'restaurants.delete': 'Delete Restaurant',
  'restaurants.view': 'View Details',
  'restaurants.changeStatus': 'Change Status',
  'restaurants.active': 'Active',
  'restaurants.hold': 'On Hold',
  'restaurants.deactivated': 'Deactivated',
  
  // Analysis
  'analysis.title': 'Data Analysis',
  'analysis.selectRestaurant': 'Select Restaurant',
  'analysis.selectDateRange': 'Select Date Range',
  'analysis.selectPlatforms': 'Select Platforms',
  'analysis.uploadSheets': 'Upload Sheets',
  'analysis.from': 'From',
  'analysis.to': 'To',
  'analysis.next': 'Next',
  'analysis.back': 'Back',
  'analysis.process': 'Process Data',
  'analysis.settings': 'Settings',
  'analysis.actualSalesRate': 'Actual Sales Rate',
  'analysis.foodCostRate': 'Food Cost Rate',
  
  // KPIs
  'kpi.numOrders': 'Number of Orders',
  'kpi.totalSales': 'Total Sales',
  'kpi.discount': 'Discount',
  'kpi.earnings': 'Earnings',
  'kpi.actualSales': 'Actual Sales',
  'kpi.netRevenue': 'Net Revenue',
  'kpi.expenses': 'Expenses',
  'kpi.difference': 'Difference',
  'kpi.foodCost': 'Food Cost',
  'kpi.differenceCost': 'Difference Cost',
  'kpi.total': 'Total',
  
  // Actions
  'action.save': 'Save',
  'action.cancel': 'Cancel',
  'action.export': 'Export to Excel',
  'action.exportMaster': 'Export Master Sheet',
  'action.saveReport': 'Save Report',
  
  // Common
  'common.loading': 'Loading...',
  'common.noData': 'No data available',
  'common.search': 'Search...',
  'common.currency': 'AED',
  'common.comingSoon': 'Coming Soon'
}

// Simple translation hook
export const useTranslation = () => {
  const t = (key: string): string => {
    return translations[key] || key
  }
  
  return { t }
}
