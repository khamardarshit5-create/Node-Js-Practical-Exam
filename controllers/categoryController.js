const mongoose = require('mongoose');
const Category = require('../models/Category');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.listCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    return res.render('categoryList', {
      title: 'Categories',
      categories,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('List categories error:', err.message);
    return res.status(500).render('error', { title: 'Error', message: 'Unable to load categories.' });
  }
};

exports.newCategoryForm = (req, res) => {
  res.render('categoryForm', {
    title: 'Add Category',
    category: null,
    formAction: '/categories',
    error: null
  });
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).render('categoryForm', {
        title: 'Add Category',
        category: req.body,
        formAction: '/categories',
        error: 'Category name is required.'
      });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).render('categoryForm', {
        title: 'Add Category',
        category: req.body,
        formAction: '/categories',
        error: 'A category with that name already exists.'
      });
    }

    await Category.create({ name: name.trim(), description: description ? description.trim() : '' });
    return res.redirect('/categories?success=Category created successfully.');
  } catch (err) {
    console.error('Create category error:', err.message);
    return res.status(500).render('error', { title: 'Error', message: 'Unable to create category.' });
  }
};

exports.editCategoryForm = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Category not found.' });
    }
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Category not found.' });
    }
    return res.render('categoryForm', {
      title: 'Edit Category',
      category,
      formAction: `/categories/${category._id}/update`,
      error: null
    });
  } catch (err) {
    console.error('Edit category form error:', err.message);
    return res.status(500).render('error', { title: 'Error', message: 'Unable to load category.' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Category not found.' });
    }
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Category not found.' });
    }

    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).render('categoryForm', {
        title: 'Edit Category',
        category: { ...req.body, _id: id },
        formAction: `/categories/${id}/update`,
        error: 'Category name is required.'
      });
    }

    category.name = name.trim();
    category.description = description ? description.trim() : '';
    await category.save();

    return res.redirect('/categories?success=Category updated successfully.');
  } catch (err) {
    console.error('Update category error:', err.message);
    return res.status(500).render('error', { title: 'Error', message: 'Unable to update category.' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Category not found.' });
    }
    await Category.findByIdAndDelete(id);
    return res.redirect('/categories?success=Category deleted successfully.');
  } catch (err) {
    console.error('Delete category error:', err.message);
    return res.status(500).render('error', { title: 'Error', message: 'Unable to delete category.' });
  }
};
