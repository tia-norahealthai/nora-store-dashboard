export function handleMenuQuery(query: string, menuData: any) {
  // Helper functions for common menu queries
  const isVegetarian = (item: any) => 
    item.dietary?.includes('vegetarian')

  const getAllergens = (item: any) => 
    item.allergens?.join(', ')

  const getNutritionalInfo = (item: any) => 
    item.nutritionalInfo ? 
      `Calories: ${item.nutritionalInfo.calories}, Protein: ${item.nutritionalInfo.protein}g, Carbs: ${item.nutritionalInfo.carbs}g, Fat: ${item.nutritionalInfo.fat}g` 
      : 'Nutritional information not available'

  // Common query patterns
  if (query.toLowerCase().includes('vegetarian')) {
    return `This item is ${isVegetarian(menuData) ? '' : 'not '}vegetarian.`
  }

  if (query.toLowerCase().includes('allergen')) {
    return `This item contains the following allergens: ${getAllergens(menuData)}`
  }

  if (query.toLowerCase().includes('nutrition') || query.toLowerCase().includes('calories')) {
    return getNutritionalInfo(menuData)
  }

  // Default response with basic item info
  return `${menuData.name} - ${menuData.description}. Price: $${menuData.price}`
} 