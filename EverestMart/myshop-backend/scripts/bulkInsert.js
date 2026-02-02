require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Connect to your MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://myshop:Z4SMwcT5kg6yKqvo@myshopcluster.9s41ssa.mongodb.net/myshop?retryWrites=true&w=majority&appName=MyShopCluster';

console.log('🔄 Connecting to MongoDB...\n');

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas!\n');
        return importAllProducts();
    })
    .catch(err => {
        console.error('❌ Connection error:', err.message);
        process.exit(1);
    });

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    brand: String,
    category: String,
    price: Number,
    description: String,
    image: String,
    stock: Number
}, { strict: false, timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Image URLs from Unsplash
const images = {
    rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
    dal: 'https://images.unsplash.com/photo-1596040033229-a0b0f99d9e1b?w=500',
    oil: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
    flour: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
    spice: 'https://images.unsplash.com/photo-1615485500838-32f76d91f4a7?w=500',
    sugar: 'https://images.unsplash.com/photo-1571773273571-e85a78e81a89?w=500',
    tea: 'https://images.unsplash.com/photo-1563822249366-297dd0a60ce2?w=500',
    biscuit: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500',
    chips: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500',
    chocolate: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500',
    juice: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
    milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500',
    butter: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500',
    cheese: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500',
    noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
    bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
    default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'
};

function getImage(name) {
    const n = name.toLowerCase();
    for (const [key, url] of Object.entries(images)) {
        if (n.includes(key)) return url;
    }
    return images.default;
}

function parseCSV(content) {
    const lines = content.split('\r\n').filter(l => l.trim());
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

            if (row.Product_Name) {
                products.push({
                    name: row.Product_Name,
                    brand: row.Brand || 'Generic',
                    category: row.Category || 'Groceries',
                    price: parseInt(row.MRP_Rs) || 100,
                    description: `${row.Product_Name} - ${row.Unit_Size || 'Pack'}`.substring(0, 200),
                    image: getImage(row.Product_Name),
                    stock: 100
                });
            }
        }
    }

    return products;
}

async function importAllProducts() {
    try {
        const baseDir = 'C:\\\\Users\\\\drago\\\\OneDrive\\\\Desktop\\\\EverestMart\\\\EverestMart\\\\Biratnagar-Vendors';

        const files = [
            '02-Groceries-Staples.csv',
            '03-Dairy-Products.csv',
            '04-Snacks-Beverages.csv'
        ];

        let allProducts = [];

        for (const file of files) {
            const filePath = path.join(baseDir, file);
            console.log(`📂 Reading ${file}...`);

            if (!fs.existsSync(filePath)) {
                console.log(`   ⚠️  Not found: ${filePath}`);
                continue;
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            const products = parseCSV(content);

            console.log(`✅ Parsed ${products.length} products`);
            allProducts = allProducts.concat(products);
        }

        console.log(`\n📊 Total: ${allProducts.length} products\n`);

        console.log('🗑️  Deleting existing products...');
        const deleted = await Product.deleteMany({});
        console.log(`   Removed ${deleted.deletedCount} old products\n`);

        console.log('💾 Inserting all products in ONE operation...');
        const result = await Product.insertMany(allProducts, { ordered: false });

        console.log(`\n✅ ========================================`);
        console.log(`✅ SUCCESS! Inserted ${result.length} products`);
        console.log(`✅ ========================================\n`);

        // Show sample
        const sample = await Product.findOne();
        console.log(`📦 Sample: ${sample.name} - ₹${sample.price}`);

        // Count by category
        const stats = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log(`\n📊 By Category:`);
        stats.forEach(s => console.log(`   ${s._id}: ${s.count}`));

        const total = await Product.countDocuments();
        console.log(`\n✅ VERIFIED: ${total} total products in database\n`);

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        mongoose.connection.close();
        process.exit(1);
    }
}
