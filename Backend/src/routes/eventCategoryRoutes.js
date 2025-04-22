const express = require('express');
const router = express.Router();
const eventCategoryController = require('../controllers/eventCategoryController');

// GET all categories
router.get('/', eventCategoryController.getAllCategories);

// GET category by ID
router.get('/:id', eventCategoryController.getCategoryById);

// POST create new category
router.post('/', eventCategoryController.createCategory);

// PUT update category
router.put('/:id', eventCategoryController.updateCategory);

// DELETE category (soft delete)
router.delete('/:id', eventCategoryController.deleteCategory);

module.exports = router; 