import { Router } from 'express';
import { getPortfolios, createPortfolio, updatePortfolio, deletePortfolio } from '../controllers/portfolioController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { portfolioCreateSchema, portfolioUpdateSchema } from '../middleware/schemas';

const router = Router();

router.use(protect);

router.route('/')
  .get(getPortfolios)
  .post(validate(portfolioCreateSchema), createPortfolio);

router.route('/:id')
  .put(validate(portfolioUpdateSchema), updatePortfolio)
  .delete(deletePortfolio);

export default router;
