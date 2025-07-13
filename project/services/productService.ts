interface NutritionData {
  energy_100g?: number;
  fat_100g?: number;
  saturated_fat_100g?: number;
  carbohydrates_100g?: number;
  sugars_100g?: number;
  fiber_100g?: number;
  proteins_100g?: number;
  salt_100g?: number;
  sodium_100g?: number;
}

interface Product {
  code: string;
  product_name: string;
  brands?: string;
  categories?: string;
  image_url?: string;
  nutriments: NutritionData;
  grade: string;
  healthWarnings: string[];
  alternatives?: string[];
}

// Indian products database
const INDIAN_PRODUCTS: { [key: string]: Product } = {
  '8901030865842': {
    code: '8901030865842',
    product_name: 'Maggi 2-Minute Masala Noodles',
    brands: 'Maggi, Nestlé',
    categories: 'Instant noodles',
    image_url: 'https://images.pexels.com/photos/4099236/pexels-photo-4099236.jpeg',
    nutriments: {
      energy_100g: 428,
      fat_100g: 15.5,
      saturated_fat_100g: 7.2,
      carbohydrates_100g: 60.8,
      sugars_100g: 6.5,
      fiber_100g: 3.2,
      proteins_100g: 10.4,
      salt_100g: 3.1,
      sodium_100g: 1240,
    },
    grade: 'D',
    healthWarnings: ['High in sodium', 'High in saturated fat', 'Processed food'],
    alternatives: ['Whole wheat pasta', 'Brown rice noodles', 'Homemade vegetable soup'],
  },
  '8901030113628': {
    code: '8901030113628',
    product_name: 'Parle-G Original Gluco Biscuits',
    brands: 'Parle',
    categories: 'Sweet biscuits',
    image_url: 'https://images.pexels.com/photos/8964851/pexels-photo-8964851.jpeg',
    nutriments: {
      energy_100g: 456,
      fat_100g: 9.2,
      saturated_fat_100g: 4.1,
      carbohydrates_100g: 77.8,
      sugars_100g: 27.0,
      fiber_100g: 2.1,
      proteins_100g: 8.9,
      salt_100g: 0.87,
      sodium_100g: 348,
    },
    grade: 'D',
    healthWarnings: ['High in sugar', 'High in refined carbs'],
    alternatives: ['Oats biscuits', 'Whole grain cookies', 'Nuts and dates'],
  },
  '8901126111156': {
    code: '8901126111156',
    product_name: 'Amul Fresh Milk',
    brands: 'Amul',
    categories: 'Dairy, Milk',
    image_url: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg',
    nutriments: {
      energy_100g: 67,
      fat_100g: 3.5,
      saturated_fat_100g: 2.2,
      carbohydrates_100g: 4.8,
      sugars_100g: 4.8,
      fiber_100g: 0,
      proteins_100g: 3.4,
      salt_100g: 0.1,
      sodium_100g: 40,
    },
    grade: 'A',
    healthWarnings: [],
    alternatives: [],
  },
  '8901030865859': {
    code: '8901030865859',
    product_name: 'Hide & Seek Chocolate Chip Cookies',
    brands: 'Hide & Seek, Parle',
    categories: 'Chocolate cookies',
    image_url: 'https://images.pexels.com/photos/890577/pexels-photo-890577.jpeg',
    nutriments: {
      energy_100g: 502,
      fat_100g: 22.8,
      saturated_fat_100g: 11.2,
      carbohydrates_100g: 68.5,
      sugars_100g: 28.4,
      fiber_100g: 2.8,
      proteins_100g: 6.2,
      salt_100g: 0.92,
      sodium_100g: 368,
    },
    grade: 'F',
    healthWarnings: ['Very high in sugar', 'High in saturated fat', 'High calories'],
    alternatives: ['Dark chocolate', 'Homemade oat cookies', 'Nuts'],
  },
  '8901030113642': {
    code: '8901030113642',
    product_name: 'Bournvita Health Drink',
    brands: 'Bournvita, Mondelez',
    categories: 'Health drinks, Chocolate drinks',
    image_url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    nutriments: {
      energy_100g: 380,
      fat_100g: 2.8,
      saturated_fat_100g: 1.8,
      carbohydrates_100g: 84.2,
      sugars_100g: 70.8,
      fiber_100g: 3.2,
      proteins_100g: 7.5,
      salt_100g: 0.28,
      sodium_100g: 112,
    },
    grade: 'F',
    healthWarnings: ['Very high in sugar', 'Highly processed'],
    alternatives: ['Plain milk with cocoa powder', 'Homemade protein shake', 'Fresh fruit smoothie'],
  },
  '8901030113659': {
    code: '8901030113659',
    product_name: 'Good Day Butter Cookies',
    brands: 'Good Day, Britannia',
    categories: 'Butter cookies',
    image_url: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg',
    nutriments: {
      energy_100g: 518,
      fat_100g: 25.2,
      saturated_fat_100g: 13.8,
      carbohydrates_100g: 65.4,
      sugars_100g: 22.6,
      fiber_100g: 1.8,
      proteins_100g: 6.8,
      salt_100g: 0.78,
      sodium_100g: 312,
    },
    grade: 'F',
    healthWarnings: ['Very high in fat', 'High in sugar', 'High calories'],
    alternatives: ['Whole grain crackers', 'Homemade cookies', 'Roasted nuts'],
  },
};

export const lookupProduct = async (barcode: string): Promise<Product | null> => {
  try {
    // First, check our Indian products database
    if (INDIAN_PRODUCTS[barcode]) {
      return INDIAN_PRODUCTS[barcode];
    }

    // Then try OpenFoodFacts API
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.status === 0 || !data.product) {
      return null;
    }

    const product = data.product;
    
    // Calculate grade based on nutrition
    const grade = calculateNutritionalGrade(product.nutriments || {});
    
    // Generate health warnings
    const healthWarnings = generateHealthWarnings(product.nutriments || {});
    
    // Generate alternatives
    const alternatives = generateAlternatives(product.categories_tags || []);

    return {
      code: barcode,
      product_name: product.product_name || 'Unknown Product',
      brands: product.brands,
      categories: product.categories,
      image_url: product.image_url,
      nutriments: product.nutriments || {},
      grade,
      healthWarnings,
      alternatives,
    };
  } catch (error) {
    console.error('Error looking up product:', error);
    return null;
  }
};

const calculateNutritionalGrade = (nutriments: NutritionData): string => {
  let score = 0;
  
  // Energy (calories per 100g)
  const energy = nutriments.energy_100g || 0;
  if (energy > 500) score += 3;
  else if (energy > 350) score += 2;
  else if (energy > 200) score += 1;
  
  // Total fat
  const fat = nutriments.fat_100g || 0;
  if (fat > 20) score += 3;
  else if (fat > 10) score += 2;
  else if (fat > 5) score += 1;
  
  // Saturated fat
  const saturatedFat = nutriments.saturated_fat_100g || 0;
  if (saturatedFat > 10) score += 3;
  else if (saturatedFat > 5) score += 2;
  else if (saturatedFat > 2) score += 1;
  
  // Sugar
  const sugar = nutriments.sugars_100g || 0;
  if (sugar > 25) score += 3;
  else if (sugar > 15) score += 2;
  else if (sugar > 5) score += 1;
  
  // Sodium
  const sodium = nutriments.sodium_100g || 0;
  if (sodium > 1000) score += 3;
  else if (sodium > 500) score += 2;
  else if (sodium > 200) score += 1;
  
  // Fiber (positive score)
  const fiber = nutriments.fiber_100g || 0;
  if (fiber > 6) score -= 2;
  else if (fiber > 3) score -= 1;
  
  // Protein (positive score)
  const protein = nutriments.proteins_100g || 0;
  if (protein > 15) score -= 2;
  else if (protein > 8) score -= 1;
  
  // Convert score to grade
  if (score <= 2) return 'A';
  if (score <= 5) return 'B';
  if (score <= 8) return 'C';
  if (score <= 12) return 'D';
  return 'F';
};

const generateHealthWarnings = (nutriments: NutritionData): string[] => {
  const warnings = [];
  
  const sugar = nutriments.sugars_100g || 0;
  const fat = nutriments.fat_100g || 0;
  const saturatedFat = nutriments.saturated_fat_100g || 0;
  const sodium = nutriments.sodium_100g || 0;
  const energy = nutriments.energy_100g || 0;
  
  if (sugar > 25) warnings.push('Very high in sugar');
  else if (sugar > 15) warnings.push('High in sugar');
  else if (sugar > 5) warnings.push('Contains added sugar');
  
  if (saturatedFat > 10) warnings.push('Very high in saturated fat');
  else if (saturatedFat > 5) warnings.push('High in saturated fat');
  
  if (sodium > 1000) warnings.push('Very high in sodium');
  else if (sodium > 500) warnings.push('High in sodium');
  
  if (fat > 20) warnings.push('High in fat');
  
  if (energy > 500) warnings.push('High in calories');
  
  return warnings;
};

const generateAlternatives = (categories: string[]): string[] => {
  const alternatives = [];
  
  if (categories.some(cat => cat.includes('biscuit') || cat.includes('cookie'))) {
    alternatives.push('Whole grain crackers', 'Homemade oat cookies', 'Nuts and seeds');
  }
  
  if (categories.some(cat => cat.includes('noodle') || cat.includes('pasta'))) {
    alternatives.push('Whole wheat pasta', 'Brown rice noodles', 'Vegetable soup');
  }
  
  if (categories.some(cat => cat.includes('chocolate') || cat.includes('candy'))) {
    alternatives.push('Dark chocolate (70%+)', 'Fresh fruits', 'Nuts');
  }
  
  if (categories.some(cat => cat.includes('drink') || cat.includes('beverage'))) {
    alternatives.push('Fresh fruit juice', 'Coconut water', 'Herbal tea');
  }
  
  return alternatives.slice(0, 3); // Limit to 3 alternatives
};

export const getHealthWarningsForUser = (product: Product, userConditions: string[]): string[] => {
  const warnings = [...product.healthWarnings];
  const nutriments = product.nutriments;
  
  if (userConditions.includes('Diabetes')) {
    const sugar = nutriments.sugars_100g || 0;
    if (sugar > 5) {
      warnings.push('⚠️ HIGH SUGAR - Not recommended for diabetics');
    }
  }
  
  if (userConditions.includes('Hypertension')) {
    const sodium = nutriments.sodium_100g || 0;
    if (sodium > 400) {
      warnings.push('⚠️ HIGH SODIUM - May affect blood pressure');
    }
  }
  
  if (userConditions.includes('High Cholesterol')) {
    const saturatedFat = nutriments.saturated_fat_100g || 0;
    if (saturatedFat > 5) {
      warnings.push('⚠️ HIGH SATURATED FAT - May affect cholesterol');
    }
  }
  
  if (userConditions.includes('Obesity')) {
    const energy = nutriments.energy_100g || 0;
    if (energy > 400) {
      warnings.push('⚠️ HIGH CALORIES - Consider portion control');
    }
  }
  
  return [...new Set(warnings)]; // Remove duplicates
};