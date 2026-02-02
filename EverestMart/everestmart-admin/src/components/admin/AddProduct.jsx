import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    unitQuantity: '1',
    brand: '',
    category: 'Vegetables - Leafy',
    stock: '',
    image: ''
  });

  const categories = [
    'Vegetables - Leafy', 'Vegetables - Root', 'Vegetables - Seasonal', 
    'Vegetables - Exotic', 'Vegetables - Organic',
    'Fruits - Fresh', 'Fruits - Dry', 'Fruits - Exotic', 'Fruits - Organic',
    'Dairy - Milk', 'Dairy - Curd & Yogurt', 'Dairy - Paneer & Cheese', 
    'Dairy - Butter & Ghee', 'Dairy - Ice Cream',
    'Rice & Flour', 'Pulses & Lentils', 'Atta & Grains', 'Dry Fruits',
    'Masala & Spices', 'Oil & Ghee', 'Salt & Sugar', 'Jaggery',
    'Tea & Coffee', 'Juices', 'Cold Drinks', 'Energy Drinks', 'Water',
    'Chips & Namkeen', 'Biscuits & Cookies', 'Chocolates', 'Sweets',
    'Instant Noodles', 'Popcorn',
    'Soaps & Body Wash', 'Shampoo & Conditioner', 'Toothpaste', 
    'Face Wash', 'Hair Oil', 'Cosmetics',
    'Detergents', 'Cleaning Supplies', 'Tissues & Napkins', 
    'Garbage Bags', 'Mosquito Repellent',
    'Baby Food', 'Diapers', 'Baby Care Products',
    'Pet Food', 'Pet Accessories',
    'Bread & Buns', 'Cakes & Pastries', 'Cookies',
    'Chicken', 'Mutton', 'Fish', 'Eggs',
    'Frozen Vegetables', 'Frozen Snacks', 'Ice Cream',
    'Health Drinks', 'Protein Supplements', 'Vitamins',
    'Ready to Eat', 'Instant Mixes', 'Noodles & Pasta'
    , // 🌿 VEGETABLES (50+)
    'Vegetables - Leafy Greens', 'Vegetables - Root Vegetables', 'Vegetables - Cruciferous', 
    'Vegetables - Squash & Gourds', 'Vegetables - Beans & Pods', 'Vegetables - Onion Family',
    'Vegetables - Peppers', 'Vegetables - Mushrooms', 'Vegetables - Herbs', 'Vegetables - Organic',
    'Vegetables - Exotic', 'Vegetables - Seasonal', 'Potatoes', 'Tomatoes', 'Onions', 'Garlic',

    // 🍎 FRUITS (50+)
    'Fruits - Citrus', 'Fruits - Tropical', 'Fruits - Berries', 'Fruits - Stone Fruits', 
    'Fruits - Apples & Pears', 'Fruits - Bananas', 'Fruits - Grapes', 'Fruits - Melons',
    'Fruits - Dry Fruits', 'Fruits - Organic', 'Fruits - Exotic', 'Apples', 'Bananas', 'Mangoes',

    // 🥛 DAIRY & EGGS (30+)
    'Dairy - Milk', 'Dairy - Curd & Yogurt', 'Dairy - Paneer & Cheese', 'Dairy - Butter & Ghee',
    'Dairy - Ice Cream', 'Dairy - Cream', 'Eggs - Chicken', 'Eggs - Duck', 'Eggs - Organic',

    // 🥩 MEAT & SEAFOOD (40+)
    'Chicken', 'Mutton', 'Fish - Fresh', 'Fish - Frozen', 'Prawns', 'Crabs', 'Squid',
    'Meat - Processed', 'Eggs', 'Organic Meat',

    // 🥖 BAKERY & READY TO EAT (30+)
    'Bread & Buns', 'Cakes & Pastries', 'Biscuits & Cookies', 'Pizzas', 'Burgers', 
    'Ready to Eat', 'Instant Mixes', 'Noodles & Pasta',

    // 🛒 GROCERIES (100+)
    'Rice', 'Wheat Flour', 'Pulses & Lentils', 'Dry Fruits & Nuts', 'Cooking Oil & Ghee',
    'Masala & Spices', 'Salt & Sugar', 'Tea', 'Coffee', 'Pickles', 'Jams & Honey',
    'Pasta & Noodles', 'Sauces & Ketchup',

    // 🥤 BEVERAGES (30+)
    'Soft Drinks', 'Juices', 'Energy Drinks', 'Health Drinks', 'Water - Bottled',
    'Milkshakes', 'Lassi', 'Smoothies',

    // 🍫 SNACKS (50+)
    'Chips & Namkeen', 'Biscuits', 'Chocolates', 'Candies', 'Wafers', 'Popcorn',
    'Cookies', 'Cakes', 'Pastries', 'Ice Creams',

    // 👕 CLOTHING & APPAREL (100+)
    'Men - T-Shirts', 'Men - Shirts', 'Men - Jeans', 'Men - Trousers', 'Men - Shorts',
    'Men - Formal Wear', 'Men - Innerwear', 'Men - Jackets', 'Men - Footwear',
    'Women - Kurtis', 'Women - Sarees', 'Women - Salwar Suits', 'Women - Dresses',
    'Women - Tops', 'Women - Leggings', 'Women - Innerwear', 'Women - Footwear',
    'Kids - Boys Clothing', 'Kids - Girls Clothing', 'Kids - Footwear',
    'Sports Wear', 'Swimwear', 'Winter Wear', 'Ethnic Wear',

    // 👟 FOOTWEAR (30+)
    'Men - Formal Shoes', 'Men - Casual Shoes', 'Men - Sports Shoes', 'Men - Sandals',
    'Women - Heels', 'Women - Flats', 'Women - Sandals', 'Women - Sports Shoes',
    'Kids - School Shoes', 'Kids - Sports Shoes', 'Slippers', 'Flip Flops',

    // 📱 ELECTRONICS (150+)
    'Mobile Phones', 'Smartphones', 'Feature Phones', 'Mobile Accessories',
    'Laptops', 'Tablets', 'Desktops', 'Monitors', 'Keyboards', 'Mouse',
    'Headphones', 'Earphones', 'Speakers', 'Soundbars', 'Televisions',
    'Refrigerators', 'Washing Machines', 'AC', 'Microwave', 'Kitchen Appliances',
    'Cameras', 'Power Banks', 'Cables & Chargers', 'Smart Watches',
    'Gaming Consoles', 'Drones',

    // 💻 COMPUTER ACCESSORIES (50+)
    'RAM', 'SSD', 'HDD', 'Graphics Cards', 'Motherboards', 'Processors',
    'Cooling Fans', 'Webcams', 'USB Hubs', 'Pen Drives',

    // 🏃 SPORTS & FITNESS (50+)
    'Cricket Bats', 'Cricket Balls', 'Football', 'Basketball', 'Tennis Rackets',
    'Badminton Rackets', 'Gym Wear', 'Yoga Mats', 'Dumbbells', 'Treadmills',
    'Protein Supplements', 'Sports Shoes', 'Sports Watches',

    // 📚 BOOKS & STATIONERY (30+)
    'Fiction Books', 'Non-Fiction', 'Textbooks', 'Children Books', 'Notebooks',
    'Pens', 'Pencils', 'Art Supplies',

    // 🏠 HOME & KITCHEN (100+)
    'Cookware', 'Utensils', 'Kitchen Storage', 'Bed Sheets', 'Curtains',
    'Mattresses', 'Fans', 'LED Bulbs', 'Home Decor', 'Furniture',
    'Cleaning Products', 'Air Fresheners',

    // 💄 PERSONAL CARE (50+)
    'Shampoo', 'Conditioner', 'Soap', 'Body Wash', 'Face Wash', 'Toothpaste',
    'Hair Oil', 'Perfumes', 'Deodorants', 'Cosmetics', 'Skincare',

    // 👶 BABY CARE (30+)
    'Baby Food', 'Diapers', 'Baby Clothes', 'Baby Toys', 'Baby Care Products',

    // 🐶 PET CARE (20+)
    'Pet Food', 'Pet Toys', 'Pet Grooming', 'Pet Beds',

    // 🏥 HEALTH & MEDICINE (30+)
    'Vitamins', 'Pain Relief', 'Cold & Flu', 'Digestive Health', 'First Aid',

    // 🎮 TOYS & GAMES (30+)
    'Action Figures', 'Board Games', 'Puzzles', 'Remote Control Toys',

    // 🎁 GIFTS & FLOWERS (20+)
    'Gift Hampers', 'Flowers', 'Chocolates', 'Greeting Cards',

    // 🚗 CAR ACCESSORIES (30+)
    'Car Care', 'Car Mats', 'Car Perfumes', 'Mobile Holders',

    // 🏍️ BIKE ACCESSORIES (20+)
    'Helmet', 'Riding Gear', 'Bike Care',

    // 📷 PHOTO & GIFTS (20+)
    'Photo Frames', 'Personalized Gifts',

    // 🔧 TOOLS & HARDWARE (30+)
    'Hand Tools', 'Power Tools', 'Electricals', 'Paints', 'Hardware',

    // 🌱 GARDENING (20+)
    'Seeds', 'Pots', 'Fertilizers', 'Garden Tools',

    // ⚽️ MUSICAL INSTRUMENTS (20+)
    'Guitars', 'Keyboards', 'Drums', 'Accessories',

    // 🏋️ FITNESS EQUIPMENT (20+)
    'Dumbbells', 'Treadmills', 'Exercise Bikes', 'Yoga Equipment',

    // 🏥 MEDICAL EQUIPMENT (20+)
    'Oxygen Concentrators', 'Blood Pressure Monitors', 'Thermometers'
  ];

  const units = ['kg', 'g', 'mg', 'liter', 'ml', 'piece', 'dozen', 'pack', 'bundle', 'box', 'bag'];

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/products', product, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('✅ Product added successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h1>➕ Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="product-form">
        {/* Product Name */}
        <div className="form-group">
          <label>Product Name *</label>
          <input 
            type="text" 
            name="name" 
            value={product.name}
            onChange={handleChange}
            placeholder="e.g. Potato, Tata Salt, Fortune Oil"
            required 
          />
        </div>

        {/* Brand (Optional) */}
        <div className="form-group">
          <label>Brand (Optional)</label>
          <input 
            type="text" 
            name="brand" 
            value={product.brand}
            onChange={handleChange}
            placeholder="e.g. Tata, Amul, Fortune"
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label>Category *</label>
          <select name="category" value={product.category} onChange={handleChange} required>
          {categories.map((cat, index) => (
  <option key={`${cat}-${index}`} value={cat}>{cat}</option>  // ✅ UNIQUE KEYS!
))}

          </select>
        </div>

        {/* Price & Unit Row */}
        <div className="form-row">
          <div className="form-group">
            <label>Price (₹) *</label>
            <input 
              type="number" 
              name="price" 
              value={product.price}
              onChange={handleChange}
              placeholder="10"
              min="0"
              step="0.01"
              required 
            />
          </div>

          <div className="form-group">
            <label>Per Unit *</label>
            <select name="unit" value={product.unit} onChange={handleChange} required>
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input 
              type="number" 
              name="unitQuantity" 
              value={product.unitQuantity}
              onChange={handleChange}
              placeholder="1"
              min="0.01"
              step="0.01"
            />
          </div>
        </div>

        <div className="price-preview">
          💰 Price Display: <strong>₹{product.price || 0} per {product.unitQuantity || 1} {product.unit}</strong>
        </div>

        {/* Stock */}
        <div className="form-group">
          <label>Stock Available *</label>
          <input 
            type="number" 
            name="stock" 
            value={product.stock}
            onChange={handleChange}
            placeholder="100"
            min="0"
            required 
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description *</label>
          <textarea 
            name="description" 
            value={product.description}
            onChange={handleChange}
            placeholder="Fresh and organic..."
            rows="4"
            required 
          />
        </div>

        {/* Image URL */}
        <div className="form-group">
          <label>Image URL *</label>
          <input 
            type="url" 
            name="image" 
            value={product.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            required 
          />
          {product.image && (
            <div className="image-preview">
              <img src={product.image} alt="Preview" />
            </div>
          )}
        </div>

        {error && <div className="error">{error}</div>}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? '⏳ Adding...' : '✅ Add Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn-cancel">
            ❌ Cancel
          </button>
        </div>
      </form>

      {/* Example Products */}
      <div className="examples">
        <h3>💡 Examples:</h3>
        <ul>
          <li>Potato - ₹10 per 1 kg</li>
          <li>Fortune Oil - ₹50 per 500 ml</li>
          <li>Amul Milk - ₹25 per 1 liter</li>
          <li>Tata Salt - ₹20 per 1 kg</li>
        </ul>
      </div>
    </div>
  );
};

export default AddProduct;
