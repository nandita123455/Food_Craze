const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/recipes
// @desc    Get all recipes
// @access  Public
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find()
            .populate('ingredients.product', 'name price image unit')
            .sort({ createdAt: -1 });
        res.json(recipes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/recipes/:id
// @desc    Get recipe by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('ingredients.product', 'name price image unit unitQuantity stock');

        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        res.json(recipe);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Recipe not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Admin only
router.post('/', adminAuth, async (req, res) => {
    try {
        const newRecipe = new Recipe(req.body);
        const recipe = await newRecipe.save();

        // Populate product details for immediate return
        await recipe.populate('ingredients.product', 'name price image unit');

        res.json(recipe);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/recipes/:id
// @desc    Update a recipe
// @access  Admin only
router.put('/:id', adminAuth, async (req, res) => {
    try {
        let recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        recipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).populate('ingredients.product', 'name price image unit');

        res.json(recipe);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Admin only
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        await Recipe.findByIdAndDelete(req.params.id); // Use findByIdAndDelete instead of recipe.remove() for newer Mongoose versions
        res.json({ msg: 'Recipe removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
