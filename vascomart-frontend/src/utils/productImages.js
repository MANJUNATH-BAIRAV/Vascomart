// Base URL for product images
const IMAGE_BASE_URL = '/images';

// Map of product names to their image filenames (without path)
const productImageMap = {
  // Audio
  'earbuds': 'Earbuds.jpg',
  'gaming headset': 'Gaming Headset.jpg',
  'in-ear headphones': 'In-Ear Headphones.jpg',
  'headphones': 'In-Ear Headphones.jpg',
  'speaker': 'Speaker.jpg',
  'sport earphones': 'Sport Earphones.jpg',
  'bluetooth speaker': 'Bluetooth Speaker.jpg',
  
  // Computer Accessories
  'bluetooth keyboard': 'Bluetooth Keyboard.jpg',
  'charging pad': 'Charging Pad.jpg',
  'compact mouse': 'Compact Mouse.jpg',
  'cooling pad': 'Cooling Pad.jpg',
  'dvd drive': 'DVD Drive.jpg',
  'external hard drive': 'External Hard Drive.jpg',
  'fast charger': 'Fast Charger.jpg',
  'gaming controller': 'Gaming Controller.jpg',
  'hub adapter': 'Hub Adapter.jpg',
  'keyboard mouse combo': 'Keyboard Mouse Combo.jpg',
  'keyboard': 'Keyboard.jpg',
  'laptop stand': 'Laptop Stand.jpg',
  'monitor': 'Monitor.jpg',
  'mouse': 'Mouse.jpg',
  'mousepad': 'Mousepad.jpg',
  'power adapter': 'Power Adapter.jpg',
  'powerbank': 'Powerbank.jpg',
  'power bank': 'Powerbank.jpg',
  'presenter remote': 'Presenter Remote.jpg',
  'ssd drive': 'SSD drive.jpg',
  'trackpad': 'Trackpad.jpg',
  'webcam': 'Webcam.jpg',
  'external dvd drive': 'DVD Drive.jpg',
  
  // Phones
  'iphone': 'iphone.jpg',
  
  // Test Products
  'testproduct': 'Test Product.jpg',
  'test product': 'Test Product.jpg',
  'testproduct1': 'Test Product1.jpg',
  'test product1': 'Test Product1.jpg',
  'test product 1': 'Test Product1.jpg',
  
  // Health & Fitness
  'fitness tracker': 'Fitness Tracker.jpg',
  'smart scale': 'Smart Scale.jpg',
  
  // Photography
  'tripod': 'Tripod.jpg',
  
  // Custom Products
  'strawhat': 'strawhat.jpg',
  
  // Default image (will be used if no match is found)
  'default': 'pexels-mikhail-nilov-6893384.jpg'
};

// Create a normalized version of the product name for matching
const normalizeProductName = (name) => {
  if (!name) return '';
  return name.toString().toLowerCase().trim();
};

export const getProductImage = (productName) => {
  if (!productName) return `${IMAGE_BASE_URL}/pexels-mikhail-nilov-6893384.jpg`;
  
  const normalized = normalizeProductName(productName);
  console.log('Looking up image for product:', productName, 'Normalized:', normalized);
  
  // Try to find a match in the product image map
  const imageFile = productImageMap[normalized];
  
  if (imageFile) {
    const imagePath = `${IMAGE_BASE_URL}/${encodeURIComponent(imageFile)}`;
    console.log('Found match, returning:', imagePath);
    return imagePath;
  }
  
  console.log('No match found, using default image');
  return `${IMAGE_BASE_URL}/pexels-mikhail-nilov-6893384.jpg`;
};

// For backward compatibility
export default Object.fromEntries(
  Object.entries(productImageMap).map(([key, value]) => [
    key,
    key === 'default' ? `${IMAGE_BASE_URL}/${value}` : `${IMAGE_BASE_URL}/${encodeURIComponent(value)}`
  ])
);
