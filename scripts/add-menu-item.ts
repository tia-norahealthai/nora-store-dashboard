const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xyhqystoebgvqjqgmqng.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5aHF5c3RvZWJndnFqcWdtcW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDMxMTQyNDAsImV4cCI6MjAxODY5MDI0MH0.qDPHvFKt6PliFqXKbQqoO_1Ow9EgOFxzXWHZQZPDYXw'
);

async function addMenuItem() {
  try {
    const menuItem = {
      restaurant_id: '41d83f5b-930b-49ec-8792-8d6601512e40',
      name: 'Mediterranean Quinoa Bowl',
      description: 'Fresh and nutritious bowl with quinoa, roasted vegetables, feta cheese, and herb-infused olive oil dressing',
      category: 'Bowls',
      price: 15.99,
      type: 'main',
      dietary: ['vegetarian', 'gluten-free'],
      allergens: ['dairy', 'nuts'],
      ingredients: ['quinoa', 'bell peppers', 'zucchini', 'feta cheese', 'olive oil', 'herbs', 'pine nuts'],
      preparation_time: 20,
      calories: 450,
      protein: 18,
      carbohydrates: 52,
      fat: 22,
      fiber: 8,
      cuisine_type: 'Mediterranean',
      healthy_score: 85,
      availability: true,
      available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      available_times: ['afternoon', 'evening']
    };

    const { data, error } = await supabase
      .from('menu_items')
      .insert([menuItem])
      .select()
      .single();

    if (error) throw error;
    console.log('Menu item created:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

addMenuItem(); 