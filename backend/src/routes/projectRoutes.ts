import { Router } from 'express';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projectController';
import { protect } from '../middleware/auth';
import { requireWorkspaceMember, requireEntityWorkspaceMember } from '../middleware/workspaceAuth';
import { validate } from '../middleware/validate';
import { projectCreateSchema, projectUpdateSchema } from '../middleware/schemas';

import Project from '../models/Project';

const router = Router();

router.use(protect); // All project routes require authentication
router.use(requireWorkspaceMember); // Secures collection routes where workspaceId is passed
router.use('/:id', requireEntityWorkspaceMember(Project));

router.route('/')
  .get(getProjects)
  .post(validate(projectCreateSchema), createProject);

router.route('/:id')
  .put(validate(projectUpdateSchema), updateProject)
  .delete(deleteProject);

export default router;
