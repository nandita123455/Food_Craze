require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// ========================================
// OPTION 1: MongoDB Atlas (Cloud) ✅ PRODUCTION READY
// ========================================
console.log('\n🔵 TESTING OPTION 1: MongoDB Atlas (Cloud)');
console.log('Connection String:', process.env.MONGODB_URI ? 'Found ✅' : 'Missing ❌');

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    brand: String,
    category: String,
    price: Number,
    description: String,
    image: String,
    stock: Number
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

// Image mapper with Unsplash
const getImage = (name) => {
    const n = name.toLowerCase();
    if (n.includes('rice') || n.includes('basmati')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500';
    if (n.includes('dal') || n.includes('lentil')) return 'https://images.unsplash.com/photo-1596040033229-a0b0f99d9e1b?w=500';
    if (n.includes('oil') && n.includes('mustard')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500';
    if (n.includes('flour') || n.includes('atta')) return 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500';
    if (n.includes('turmeric') || n.includes('spice')) return 'https://images.unsplash.com/photo-1615485500838-32f76d91f4a7?w=500';
    if (n.includes('sugar')) return 'https://images.unsplash.com/photo-1571773273571 -e85a78e81a89?w=500';
    if (n.includes('tea')) return 'https://images.unsplash.com/photo-1563822249366-297dd0a60ce2?w=500';
    if (n.includes('coffee')) return 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500';
    if (n.includes('honey')) return 'https://images.unsplash.com/photo-1587049352846-4a222e784c38?w=500';
    if (n.includes('biscuit') || n.includes('cookie')) return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500';
    if (n.includes('chips')) return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500';
    if (n.includes('chocolate')) return 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500';
    if (n.includes('juice') && n.includes('mango')) return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500';
    if (n.includes('juice') && n.includes('orange')) return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500';
    if (n.includes('juice')) return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500';
    if (n.includes('water')) return 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500';
    if (n.includes('noodles')) return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500';
    if (n.includes('bread')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500';
    if (n.includes('milk')) return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500';
    if (n.includes('butter')) return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500';
    if (n.includes('cheese')) return 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500';
    if (n.includes('yogurt') || n.includes('curd')) return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500';
    if (n.includes('paneer')) return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500';
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
};

// CSV Parser with proper quote handling
function parseCSV(content) {
    const lines = content.split('\r\n').filter(l => l.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const products = [];

    for (let i = 1; i < lines.length; i++) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let char of lines[i]) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        if (values.length >= 3 && values[0] && values[1]) {
            const row = {};
            headers.forEach((h, idx) => {
                row[h] = values[idx] || '';
            });

            if (row.Product_ID && row.Product_Name) {
                products.push({
                    name: row.Product_Name,
                    brand: row.Brand || 'Generic',
                    category: row.Category || 'Groceries',
                    subCategory: row.Sub_Category,
                    price: parseInt(row.MRP_Rs) || 100,
                    description: `${row.Product_Name} - ${row.Unit_Size || 'Pack'}. ${row.Brand || ''}`,
                    image: getImage(row.Product_Name),
                    stock: 100
                });
            }
        }
    }

    return products;
}

// Main import function
async function importProducts() {
    try {
        console.log('\n🔄 Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB Atlas successfully!');
        console.log(`📍 Database: ${mongoose.connection.name}`);

        const files = [
            '02-Groceries-Staples.csv',
            '03-Dairy-Products.csv',
            '04-Snacks-Beverages.csv'
        ];

        let allProducts = [];

        for (const file of files) {
            const filePath = path.join('C:\\Users\\drago\\OneDrive\\Desktop\\EverestMart\\Biratnagar-Vendors', file);
            console.log(`\n📂 Reading ${file}...`);

            const content = fs.readFileSync(filePath, 'utf-8');
            const products = parseCSV(content);

            console.log(`✅ Parsed ${products.length} products`);
            allProducts = allProducts.concat(products);
        }

        console.log(`\n📊 Total products to import: ${allProducts.length}`);
        console.log(`\n🗑️  Clearing existing products...`);

        const deleteResult = await Product.deleteMany({});
        console.log(`   Deleted ${deleteResult.deletedCount} old products`);

        console.log(`\n💾 Inserting ${allProducts.length} new products...`);
        const insertResult = await Product.insertMany(allProducts);
        console.log(`   Inserted ${insertResult.length} products successfully!`);

        // Show sample
        const sample = await Product.findOne();
        console.log(`\n📦 Sample product: ${sample.name} - ₹${sample.price}`);

        // Show category breakdown
        const categories = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        console.log(`\n📊 Products by category:`);
        categories.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count} products`);
        });

        console.log('\n✅ ========================================');
        console.log('✅ IMPORT SUCCESSFUL!');
        console.log(`✅ Total: ${allProducts.length} products imported`);
        console.log('✅ ========================================\n');

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ ========================================');
        console.error('❌ IMPORT FAILED!');
        console.error('❌ Error:', error.message);
        console.error('❌ ========================================\n');
        process.exit(1);
    }
}

// Run
importProducts();
