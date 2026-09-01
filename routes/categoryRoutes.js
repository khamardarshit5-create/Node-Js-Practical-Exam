const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/categories', categoryController.listCategories);
router.get('/categories/new', categoryController.newCategoryForm);
router.post('/categories', categoryController.createCategory);
router.get('/categories/:id/edit', categoryController.editCategoryForm);
router.post('/categories/:id/update', categoryController.updateCategory);
router.post('/categories/:id/delete', categoryController.deleteCategory);

module.exports = router;
