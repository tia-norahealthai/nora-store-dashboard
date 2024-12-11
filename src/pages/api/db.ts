import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { data: menuItems, error } = await supabase
          .from('menu_items')
          .select('*');

        if (error) throw error;
        res.status(200).json(menuItems);
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch menu items' });
      }
      break;

    case 'POST':
      try {
        const { name, description, price, category, image_url } = req.body;
        const { data, error } = await supabase
          .from('menu_items')
          .insert([
            { name, description, price, category, image_url }
          ])
          .select()
          .single();

        if (error) throw error;
        res.status(201).json(data);
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to create menu item' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}