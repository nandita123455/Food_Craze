const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const Product = require('../models/Product');

const seedData = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Seed Categories
        console.log('🌱 Seeding Categories...');
        // await Category.deleteMany({}); // Optional: clear existing? Maybe better to upsert.

        const categories = [
            { name: 'Groceries', icon: '🛒' },
            { name: 'Dairy', icon: '🥛' },
            { name: 'Snacks', icon: '🍪' },
            { name: 'Personal Care', icon: '🧴' },
            { name: 'Home & Kitchen', icon: '🏠' },
            { name: 'Electronics', icon: '🔌' },
            { name: 'Textiles', icon: '👕' },
            { name: 'Handicrafts', icon: '🎨' },
            { name: 'Agriculture', icon: '🌾' }
        ];

        for (const cat of categories) {
            // Generate slug manually as middleware might not trigger on findOneAndUpdate
            cat.slug = cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

            await Category.findOneAndUpdate(
                { name: cat.name },
                cat,
                { upsert: true, new: true, runValidators: true }
            );
        }
        console.log(`✅ Seeded/Updated ${categories.length} categories`);

        // 2. Seed Recipes
        console.log('👨‍🍳 Seeding Recipes...');
        await Recipe.deleteMany({}); // Clear existing recipes to avoid dupes for now

        // Find products for ingredients
        const rice = await Product.findOne({ name: /rice/i });
        const oil = await Product.findOne({ name: /oil/i });
        const salt = await Product.findOne({ name: /salt/i });
        const tea = await Product.findOne({ name: /tea/i });
        const sugar = await Product.findOne({ name: /sugar/i });
        const milk = await Product.findOne({ name: /milk/i });

        const recipes = [
            {
                name: 'Classic Vegetable Fried Rice',
                description: 'A quick and delicious fried rice recipe using fresh vegetables and premium basmati rice.',
                image: 'https://images.unsplash.com/photo-1603133872878-684f208fb74b?w=800',
                prepareTime: '20 mins',
                difficulty: 'Easy',
                instructions: [
                    'Cook the basmati rice and let it cool.',
                    'Heat oil in a wok or large pan.',
                    'Stir fry chopped vegetables (carrots, peas, beans) for 3-4 mins.',
                    'Add the cooked rice and mix well.',
                    'Add salt, soy sauce, and pepper to taste.',
                    'Garnish with spring onions and serve hot.'
                ],
                ingredients: []
            },
            {
                name: 'Traditional Masala Chai',
                description: 'The authentic taste of Nepal in a cup. Perfect for morning refreshment.',
                image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800',
                prepareTime: '10 mins',
                difficulty: 'Easy',
                instructions: [
                    'Boil water with crushed ginger and cardamom.',
                    'Add tea leaves and simmer for 2 mins.',
                    'Add milk and sugar, bring to a boil.',
                    'Strain and serve hot with biscuits.'
                ],
                ingredients: []
            }
        ];

        // Add ingredients if products exist
        if (rice) recipes[0].ingredients.push({ product: rice._id, quantity: 2, unit: 'cups' });
        if (oil) recipes[0].ingredients.push({ product: oil._id, quantity: 2, unit: 'tbsp' });
        if (salt) recipes[0].ingredients.push({ product: salt._id, quantity: 1, unit: 'tsp' });

        if (tea) recipes[1].ingredients.push({ product: tea._id, quantity: 2, unit: 'tsp' });
        if (sugar) recipes[1].ingredients.push({ product: sugar._id, quantity: 2, unit: 'tsp' });
        if (milk) recipes[1].ingredients.push({ product: milk._id, quantity: 1, unit: 'cup' });

        await Recipe.insertMany(recipes);
        console.log(`✅ Seeded ${recipes.length} recipes`);

        console.log('🎉 Seeding completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        if (error.errors) console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
        process.exit(1);
    }
};

seedData();
