"use client"

import { useEffect, useRef } from 'react'
import { MenuItemData as MenuItemDataType } from '@/types/data-types'

interface MenuItemDataProps {
  item: MenuItemDataType
}

export function MenuItemData({ item }: MenuItemDataProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      // Add basic data attributes
      ref.current.setAttribute('data-menu-item', '')
      ref.current.setAttribute('data-id', item.id)
      ref.current.setAttribute('data-name', item.name)
      ref.current.setAttribute('data-price', String(item.price))
      ref.current.setAttribute('data-description', item.description)
      ref.current.setAttribute('data-category', item.category)
      ref.current.setAttribute('data-status', item.status)

      // Add array data
      if (item.dietary?.length) {
        ref.current.setAttribute('data-dietary', item.dietary.join(','))
      }
      if (item.allergens?.length) {
        ref.current.setAttribute('data-allergens', item.allergens.join(','))
      }

      // Add optional data
      if (item.nutritionalInfo) {
        ref.current.setAttribute('data-nutritional-info', JSON.stringify(item.nutritionalInfo))
      }
    }
  }, [item])

  return <div ref={ref} className="hidden" />
} 