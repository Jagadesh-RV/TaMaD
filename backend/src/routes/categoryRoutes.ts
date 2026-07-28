import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { categoryCreateSchema, categoryUpdateSchema } from '../middleware/schemas';

const router = Router();

router.use(protect);

router.route('/')
  .get(getCategories)
  .post(validate(categoryCreateSchema), createCategory);

router.route('/:id')
  .put(validate(categoryUpdateSchema), updateCategory)
  .delete(deleteCategory);

export default router;
