import { Router } from 'express';
import authLogin from './authLogin';
import authLogout from './authLogout';
import accounts from './accounts';
import projects from './projects';
import projectOwner from './projectOwner';
import projectContacts from './projectContacts';
import contactScopes from './contactScopes';
import projectFlags from './projectFlags';
import projectPhotos from './projectPhotos';
import flagPhotos from './flagPhotos';
import reportTemplates from './reportTemplates';
import reportTemplateGenerate from './reportTemplateGenerate';
import projectSchedule from './projectSchedule';
import projectSubscriptions from './projectSubscriptions';
import billing from './billing';
import { authMiddleware } from '../middleware/auth';
import { routePermissions } from '../middleware/permissions';
import { projectAccessMiddleware } from '../middleware/projectAccess';

const router = Router();

router.use('/auth/login', authLogin);
router.use('/auth/logout', authMiddleware(routePermissions['/auth/logout']), authLogout);
router.use('/accounts', authMiddleware(routePermissions['/accounts']), accounts);
router.use('/projects', authMiddleware(routePermissions['/projects']), projects);
router.use(
  '/projects/:project_id/owner',
  authMiddleware(),
  projectAccessMiddleware(routePermissions['/projects/:project_id/owner']),
  projectOwner
);
router.use(
  '/projects/:project_id/contacts',
  authMiddleware(),
  projectAccessMiddleware(routePermissions['/projects/:project_id/contacts']),
  projectContacts
);
router.use(
  '/projects/:project_id/contacts/:project_contact_id/scopes',
  authMiddleware(),
  projectAccessMiddleware(
    routePermissions['/projects/:project_id/contacts/:project_contact_id/scopes']
  ),
  contactScopes
);
router.use(
  '/projects/:project_id/flags',
  authMiddleware(),
  projectAccessMiddleware(routePermissions['/projects/:project_id/flags']),
  projectFlags
);
router.use(
  '/projects/:project_id/photos',
  authMiddleware(),
  projectAccessMiddleware(routePermissions['/projects/:project_id/photos']),
  projectPhotos
);
router.use(
  '/projects/:project_id/flags/:flag_id/photos',
  authMiddleware(),
  projectAccessMiddleware(
    routePermissions['/projects/:project_id/flags/:flag_id/photos']
  ),
  flagPhotos
);
router.use(
  '/projects/:project_id/report-templates',
  authMiddleware(),
  projectAccessMiddleware(routePermissions['/projects/:project_id/report-templates']),
  reportTemplates
);
router.use(
  '/projects/:project_id/report-templates/:template_id/generate',
  authMiddleware(),
  projectAccessMiddleware(
    routePermissions['/projects/:project_id/report-templates/:template_id/generate']
  ),
  reportTemplateGenerate
);
router.use(
  '/projects/:project_id/schedule',
  authMiddleware(),
  projectAccessMiddleware(routePermissions['/projects/:project_id/schedule']),
  projectSchedule
);
router.use(
  '/projects/:project_id/subscriptions',
  authMiddleware(),
  projectAccessMiddleware(routePermissions['/projects/:project_id/subscriptions']),
  projectSubscriptions
);
router.use('/billing', authMiddleware(routePermissions['/billing']), billing);

export default router;
