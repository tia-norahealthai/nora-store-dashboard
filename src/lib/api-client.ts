import { MenuItem } from '@/types/store';

export const apiClient = {
  async getMenuItems(): Promise<MenuItem[]> {
    const response = await fetch('/api/db');
    if (!response.ok) {
      throw new Error('Failed to fetch menu items');
    }
    return response.json();
  },

  async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const response = await fetch('/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error('Failed to create menu item');
    }
    return response.json();
  }
}; 