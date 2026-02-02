const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_URL = `http://localhost:5000`http://localhost:5000'}/api';

// Image mapping
const getImage = (name) => {
    const n = name.toLowerCase();
    if (n.includes('rice')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500';
    if (n.includes('dal')) return 'https://images.unsplash.com/photo-1596040033229-a0b0f99d9e1b?w=500';
    if (n.includes('oil')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500';
    if (n.includes('flour')) return 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500';
    if (n.includes('tea')) return 'https://images.unsplash.com/photo-1563822249366-297dd0a60ce2?w=500';
    if (n.includes('biscuit')) return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500';
    if (n.includes('chips')) return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500';
    if (n.includes('chocolate')) return 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500';
    if (n.includes('juice')) return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500';
    if (n.includes('milk')) return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500';
    if (n.includes('butter')) return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500';
    if (n.includes('cheese')) return 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500';
    if (n.includes('noodles')) return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500';
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
};

// Parse CSV
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
                    description: `${row.Product_Name} - ${row.Unit_Size || 'Pack'}`,
                    image: getImage(row.Product_Name),
                    stock: 100
                });
            }
        }
    }

    return products;
}

async function seedProducts() {
    try {
        console.log('\n🚀 Starting Product Import via API...\n');

        // Use absolute path
        const baseDir = 'C:\\Users\\drago\\OneDrive\\Desktop\\EverestMart\\EverestMart\\Biratnagar-Vendors';

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
                console.log(`   ⚠️  File not found: ${filePath}`);
                continue;
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            const products = parseCSV(content);

            console.log(`✅ Parsed ${products.length} products`);
            allProducts = allProducts.concat(products);
        }

        console.log(`\n📊 Total: ${allProducts.length} products to import\n`);

        // Delete existing products first
        console.log('🗑️  Clearing existing products via API...');
        try {
            await axios.delete(`${API_URL}/products/all`);
            console.log('✅ Cleared');
        } catch (err) {
            console.log('⚠️  Could not clear (endpoint may not exist)');
        }

        // Import in batches to avoid timeout
        console.log(`\n💾 Importing products in batches...\n`);
        const batchSize = 50;
        let imported = 0;

        for (let i = 0; i < allProducts.length; i += batchSize) {
            const batch = allProducts.slice(i, i + batchSize);
            process.stdout.write(`   Batch ${Math.floor(i / batchSize) + 1}: Importing ${batch.length} products... `);

            try {
                await axios.post(`${API_URL}/products/bulk`, { products: batch });
                imported += batch.length;
                console.log('✅');
            } catch (error) {
                // Try one by one if bulk fails
                console.log('⚠️  Bulk failed, trying individual...');
                for (const product of batch) {
                    try {
                        await axios.post(`${API_URL}/products`, product);
                        imported++;
                    } catch (e) {
                        console.log(`❌ Failed: ${product.name}`);
                    }
                }
            }

            // Small delay to avoid overwhelming server
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`\n✅ ========================================`);
        console.log(`✅ SUCCESS! Imported ${imported} products`);
        console.log(`✅ ========================================\n`);

    } catch (error) {
        console.error('\n❌ Import failed:', error.message);
    }
}

seedProducts();
