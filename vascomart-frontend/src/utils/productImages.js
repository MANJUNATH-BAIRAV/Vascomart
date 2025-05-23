const productImages = {
  // Audio
  'Earbuds': '/images/Earbuds.jpg',
  'Gaming Headset': '/images/Gaming Headset.jpg',
  'In-Ear Headphones': '/images/In-Ear Headphones.jpg',
  'Speaker': '/images/Speaker.jpg',
  'Sport Earphones': '/images/Sport Earphones.jpg',
  'Bluetooth Speaker': '/images/Bluetooth Speaker.jpg',
  
  // Computer Accessories
  'Bluetooth Keyboard': '/images/Bluetooth Keyboard.jpg',
  'Charging Pad': '/images/Charging Pad.jpg',
  'Compact Mouse': '/images/Compact Mouse.jpg',
  'Cooling Pad': '/images/Cooling Pad.jpg',
  'DVD Drive': '/images/DVD Drive.jpg',
  'External Hard Drive': '/images/External Hard Drive.jpg',
  'Fast Charger': '/images/Fast Charger.jpg',
  'Gaming Controller': '/images/Gaming Controller.jpg',
  'Hub Adapter': '/images/Hub Adapter.jpg',
  'Keyboard Mouse Combo': '/images/Keyboard Mouse Combo.jpg',
  'Keyboard': '/images/Keyboard.jpg',
  'Laptop Stand': '/images/Laptop Stand.jpg',
  'Monitor': '/images/Monitor.jpg',
  'Mouse': '/images/Mouse.jpg',
  'Mousepad': '/images/Mousepad.jpg',
  'Power Adapter': '/images/Power Adapter.jpg',
  'Powerbank': '/images/Powerbank.jpg',
  'Presenter Remote': '/images/Presenter Remote.jpg',
  'SSD drive': '/images/SSD drive.jpg',
  'Trackpad': '/images/Trackpad.jpg',
  'Webcam': '/images/Webcam.jpg',
  
  // Health & Fitness
  'Fitness Tracker': '/images/Fitness Tracker.jpg',
  'Smart Scale': '/images/Smart Scale.jpg',
  
  // Photography
  'Tripod': '/images/Tripod.jpg',
  
  // Test Products
  'Test Product': '/images/Test Product.jpg',
  'Test Product1': '/images/Test Product1.jpg',
  
  // Custom Products
  'Strawhat': '/images/strawhat.jpg',
  
  // Default image (will be used if no match is found)
  'default': '/images/pexels-mikhail-nilov-6893384.jpg'
};

export const getProductImage = (productName) => {
  if (!productName) return productImages['default'];
  
  // First try exact match
  if (productImages[productName]) {
    return productImages[productName];
  }
  
  // Then try case-insensitive exact match
  const nameLower = productName.toLowerCase();
  const matchedKey = Object.keys(productImages).find(key => 
    key.toLowerCase() === nameLower
  );
  
  return matchedKey ? productImages[matchedKey] : productImages['default'];
};

export default productImages;
