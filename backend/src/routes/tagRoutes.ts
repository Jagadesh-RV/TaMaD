import { Router } from 'express';
import { getTags, createTag, updateTag, deleteTag } from '../controllers/tagController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { tagCreateSchema, tagUpdateSchema } from '../middleware/schemas';

const router = Router();

router.use(protect);

router.route('/')
  .get(getTags)
  .post(validate(tagCreateSchema), createTag);

router.route('/:id')
  .put(validate(tagUpdateSchema), updateTag)
  .delete(deleteTag);

export default router;
