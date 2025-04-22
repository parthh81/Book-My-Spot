const EventCategory = require('../models/EventCategory');

// Get all event categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await EventCategory.find({ isActive: true }).sort('id');
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching event categories:', error);
    res.status(500).json({ message: 'Failed to fetch event categories' });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    // Check if the ID is numeric (as our schema uses number for id)
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    const category = await EventCategory.findOne({ id: categoryId, isActive: true });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    console.error(`Error fetching category with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch category' });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    // Ensure id is provided and is unique
    if (!req.body.id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }
    
    const existingCategory = await EventCategory.findOne({ id: req.body.id });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this ID already exists' });
    }
    
    const newCategory = new EventCategory(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({ message: 'Failed to create category', error: error.message });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    const category = await EventCategory.findOneAndUpdate(
      { id: categoryId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    console.error(`Error updating category with ID ${req.params.id}:`, error);
    res.status(400).json({ message: 'Failed to update category', error: error.message });
  }
};

// Delete category (soft delete by setting isActive to false)
const deleteCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    const category = await EventCategory.findOneAndUpdate(
      { id: categoryId },
      { isActive: false },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(`Error deleting category with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

// Initialize default categories if none exist
const initializeDefaultCategories = async () => {
  // This function has been intentionally disabled to remove sample data initialization
  console.log('Category initialization has been disabled');
  return [];
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  initializeDefaultCategories
}; 