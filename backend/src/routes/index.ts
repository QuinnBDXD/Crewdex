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

const router = Router();

router.use('/auth/login', authLogin);
router.use('/auth/logout', authLogout);
router.use('/accounts', accounts);
router.use('/projects', projects);
router.use('/projects/:project_id/owner', projectOwner);
router.use('/projects/:project_id/contacts', projectContacts);
router.use('/projects/:project_id/contacts/:project_contact_id/scopes', contactScopes);
router.use('/projects/:project_id/flags', projectFlags);
router.use('/projects/:project_id/photos', projectPhotos);
router.use('/projects/:project_id/flags/:flag_id/photos', flagPhotos);
router.use('/projects/:project_id/report-templates', reportTemplates);
router.use('/projects/:project_id/report-templates/:template_id/generate', reportTemplateGenerate);
router.use('/projects/:project_id/schedule', projectSchedule);
router.use('/projects/:project_id/subscriptions', projectSubscriptions);

export default router;
