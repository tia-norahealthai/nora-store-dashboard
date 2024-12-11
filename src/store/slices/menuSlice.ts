import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import type { MenuItem } from '@/types/store'

interface MenuState {
  items: MenuItem[]
  categories: string[]
  isLoading: boolean
  error: string | null
}

// Async thunks for API operations
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenuItems',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return initialState.items // For now, return initial items
  }
)

export const deleteMenuItem = createAsyncThunk(
  'menu/deleteMenuItem',
  async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return id
  }
)

const initialState: MenuState = {
  items: [
    {
      id: "1",
      name: "CHICKEN AL PASTOR",
      description: "Brown rice, chicken al pastor, guacamole, roasted corn, fajita veggies, cilantro, chipotle dressing",
      price: 14.99,
      category: "Specials",
      dietary: ["gluten-free", "nut-free"],
      status: "available",
      imageUrl: "https://images.squarespace-cdn.com/content/v1/5f8f0db6242e4c70d3ae47ef/de260585-2017-42b5-bde3-9ef4591ac7cf/chicken-al-pastor.jpg?format=1000w",
      allergens: ["Nut"],
      nutritionalInfo: {
        calories: 850,
        protein: 45,
        carbs: 65,
        fat: 35
      }
    },
    {
        id: "2",
        name: "CHICKEN BROCCOLI",
        description: "Brown rice, chicken al pastor, guacamole, roasted corn, fajita veggies, cilantro, chipotle dressing",
        price: 14.99,
        category: "Specials",
        dietary: ["gluten-free", "nut-free"],
        status: "available",
        imageUrl: "https://images.squarespace-cdn.com/content/v1/5f8f0db6242e4c70d3ae47ef/de260585-2017-42b5-bde3-9ef4591ac7cf/chicken-al-pastor.jpg?format=1000w",
        allergens: ["Nut"],
        nutritionalInfo: {
          calories: 850,
          protein: 45,
          carbs: 65,
          fat: 35
        }
      }
    // Add more initial items as needed
  ],
  categories: ["Specials", "Mains", "Sides", "Drinks"],
  isLoading: false,
  error: null
}

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenuItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.items = action.payload
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch menu items'
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
      })
  }
})

export type MenuSlice = {
  menu: MenuState
}

export const { setMenuItems, setCategories, setLoading, setError } = menuSlice.actions
export default menuSlice.reducer 