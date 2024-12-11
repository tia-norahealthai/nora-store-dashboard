import { configureStore } from '@reduxjs/toolkit'
import menuReducer from './slices/menuSlice'
import customersReducer from './slices/customersSlice'
import ordersReducer from './slices/ordersSlice'
import { useSelector, TypedUseSelectorHook } from 'react-redux'

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    customers: customersReducer,
    orders: ordersReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Use TypedUseSelectorHook for proper typing
export const useStore: TypedUseSelectorHook<RootState> = useSelector 