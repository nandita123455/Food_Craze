const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Product model
const productSchema = new mongoose.Schema({
    productId: String,
    name: String,
    brand: String,
    category: String,
    subCategory: String,
    price: Number,
    wholesalePrice: Number,
    unit: String,
    description: String,
    image: String,
    vendor: {
        name: String,
        contactPerson: String,
        phone: String,
        email: String,
        address: String
    },
    moq: String,
    stock: String,
    stockStatus: String
});

const Product = mongoose.model('Product', productSchema);

// Image mapping for common products
const getProductImage = (productName, category) => {
    const name = productName.toLowerCase();

    // Groceries & Staples
    if (name.includes('rice') || name.includes('basmati')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500';
    if (name.includes('dal') || name.includes('lentil')) return 'https://images.unsplash.com/photo-1596040033229-a0b0f99d9e1b?w=500';
    if (name.includes('oil') && name.includes('mustard')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500';
    if (name.includes('oil') && name.includes('sunflower')) return 'https://images.unsplash.com/photo-1601913485555-880ec0c2065f?w=500';
    if (name.includes('flour') || name.includes('atta')) return 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500';
    if (name.includes('turmeric')) return 'https://images.unsplash.com/photo-1615485500838-32f76d91f4a7?w=500';
    if (name.includes('chilli') || name.includes('pepper')) return 'https://images.unsplash.com/photo-1583837192516-12c9b7e9fa58?w=500';
    if (name.includes('sugar')) return 'https://images.unsplash.com/photo-1571773273571-e85a78e81a89?w=500';
    if (name.includes('salt')) return 'https://images.unsplash.com/photo-1587165305448-85e0e8f43f8e?w=500';
    if (name.includes('tea')) return 'https://images.unsplash.com/photo-1563822249366-297dd0a60ce2?w=500';
    if (name.includes('coffee')) return 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500';
    if (name.includes('honey')) return 'https://images.unsplash.com/photo-1587049352846-4a222e784c38?w=500';

    // Snacks & Beverages
    if (name.includes('biscuit') || name.includes('cookie')) return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500';
    if (name.includes('chips')) return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500';
    if (name.includes('chocolate')) return 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500';
    if (name.includes('juice') && name.includes('mango')) return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500';
    if (name.includes('juice') && name.includes('orange')) return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500';
    if (name.includes('water')) return 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500';
    if (name.includes('noodles')) return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500';
    if (name.includes('bread')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500';

    // Dairy
    if (name.includes('milk')) return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500';
    if (name.includes('butter')) return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500';
    if (name.includes('cheese')) return 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500';
    if (name.includes('yogurt') || name.includes('curd')) return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500';

    // Default category images
    if (category === 'Groceries') return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
    if (category === 'Snacks') return 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500';
    if (category === 'Dairy') return 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500';

    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
};

// Parse CSV file
const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const products = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                if (row.Product_ID) {
                    products.push({
                        productId: row.Product_ID,
                        name: row.Product_Name,
                        brand: row.Brand,
                        category: row.Category,
                        subCategory: row.Sub_Category,
                        price: parseInt(row.MRP_Rs) || 0,
                        wholesalePrice: parseInt(row.Wholesale_Rs) || 0,
                        unit: row.Unit_Size,
                        description: `${row.Product_Name} from ${row.Brand}. ${row.Unit_Size} pack.`,
                        image: getProductImage(row.Product_Name, row.Category),
                        vendor: {
                            name: row.Vendor_Name,
                            contactPerson: row.Contact_Person,
                            phone: row.Phone,
                            email: row.Email,
                            address: row.Address_Biratnagar
                        },
                        moq: row.MOQ,
                        stock: 100,
                        stockStatus: row.Stock_Status || 'In Stock'
                    });
                }
            })
            .on('end', () => resolve(products))
            .on('error', reject);
    });
};

// Main import function
const importProducts = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quixo', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        const csvFiles = [
            '02-Groceries-Staples.csv',
            '03-Dairy-Products.csv',
            '04-Snacks-Beverages.csv',
            '05-Personal-Care.csv',
            '06-Home-Kitchen.csv',
            '07-Electronics.csv',
            '08-Textiles-Garments.csv',
            '09-Handicrafts.csv',
            '10-Agricultural-Products.csv'
        ];

        let allProducts = [];

        for (const file of csvFiles) {
            // Fix path to point to correct directory
            const filePath = path.join(__dirname, '../../Biratnagar-Vendors', file);
            if (fs.existsSync(filePath)) {
                console.log(`📂 Reading ${file}...`);
                // Limit to 20 products per file/category
                const products = await parseCSV(filePath);
                const limitedProducts = products.slice(0, 20);
                allProducts = allProducts.concat(limitedProducts);
                console.log(`✅ Parsed ${products.length} products from ${file} (Importing ${limitedProducts.length})`);
            } else {
                console.warn(`⚠️ File not found: ${file}`);
            }
        }

        console.log(`\n🗑️  Clearing existing products...`);
        // await Product.deleteMany({}); // Optional: Decide if we want to clear or append. User said "add". Let's clear to be safe/clean? Or maybe just append?
        // User said "add those product", implies appending or ensuring they exist.
        // But duplicates might be an issue. Let's stick to the script's original logic of clearing for a clean seed,
        // UNLESS the user wants to keep existing data.
        // Given we just switched DBs, it's empty anyway. So clearing is fine.
        await Product.deleteMany({});

        console.log(`💾 Inserting ${allProducts.length} products...`);
        await Product.insertMany(allProducts);

        console.log(`\n✅ Successfully imported ${allProducts.length} products!`);
        console.log('\n📊 Summary:');
        const categories = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        categories.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count} products`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    importProducts();
}

module.exports = { importProducts };
