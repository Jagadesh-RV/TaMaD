import { Router } from 'express';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projectController';
import { protect } from '../middleware/auth';
import { requireWorkspaceMember } from '../middleware/workspaceAuth';
import { validate } from '../middleware/validate';
import { projectCreateSchema, projectUpdateSchema } from '../middleware/schemas';

const router = Router();

router.use(protect); // All project routes require authentication
router.use(requireWorkspaceMember);

router.route('/')
  .get(getProjects)
  .post(validate(projectCreateSchema), createProject);

router.route('/:id')
  .put(validate(projectUpdateSchema), updateProject)
  .delete(deleteProject);

export default router;
