import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function convertToUnsplashImageUrl(url: string): string {
  try {
    if (url.includes('images.unsplash.com')) {
      return url;
    }
    
    if (url.includes('unsplash.com/photos/')) {
      const photoId = url.split('/').pop()?.split('-')[0] || '';
      return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80`;
    }
    
    return url;
  } catch (error) {
    console.error('Error converting image URL:', error);
    return url;
  }
}

export function AddMenuItemForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const newItem = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category'),
      image_url: convertToUnsplashImageUrl(formData.get('image_url') as string),
      status: 'active',
      ingredients: (formData.get('ingredients') as string).split(',').map(i => i.trim()),
      preparation_time: parseInt(formData.get('preparation_time') as string),
    };

    try {
      const { error } = await supabase
        .from('menu_items')
        .insert([newItem]);

      if (error) throw error;

      setIsOpen(false);
      // Optionally refresh the page or update the list
      window.location.reload();
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Error adding menu item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Menu Item</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Menu Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input 
              id="price" 
              name="price" 
              type="number" 
              step="0.01" 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" name="image_url" type="url" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ingredients">
              Ingredients (comma-separated)
            </Label>
            <Input id="ingredients" name="ingredients" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preparation_time">
              Preparation Time (minutes)
            </Label>
            <Input 
              id="preparation_time" 
              name="preparation_time" 
              type="number" 
              required 
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Item'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 