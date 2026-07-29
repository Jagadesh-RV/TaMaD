import { Router } from 'express';
import {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
} from '../controllers/organizationController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyToken);

router.post('/', createOrganization);
router.get('/', getMyOrganizations);
router.get('/:id', getOrganizationById);
router.put('/:id', updateOrganization);

export default router;
