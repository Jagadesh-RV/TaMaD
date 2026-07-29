import { Router } from 'express';
import {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
} from '../controllers/organizationController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/', createOrganization);
router.get('/', getMyOrganizations);
router.get('/:id', getOrganizationById);
router.put('/:id', updateOrganization);

export default router;
