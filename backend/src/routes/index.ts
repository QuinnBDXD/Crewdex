import { Router } from 'express';
import requireRole from '../auth/requireRole';

const router = Router();

// Auth
router.post('/auth/login', requireRole('public'), (req, res) => {
  res.json({ session: {} });
});

router.post('/auth/logout', requireRole('authenticated'), (req, res) => {
  res.json({ ok: true });
});

// Projects
router.post('/projects', requireRole(['AccountAdmin', 'ProjectOwner', 'ProjectAdmin']), (req, res) => {
  res.json({});
});

router.post('/projects/:project_id/owner', requireRole(['AccountAdmin', 'ProjectOwner']), (req, res) => {
  res.json({});
});

router.get('/projects', requireRole('authenticated'), (req, res) => {
  res.json([]);
});

// Contacts & Scopes
router.post('/projects/:project_id/contacts', requireRole(['ProjectOwner', 'ProjectAdmin']), (req, res) => {
  res.json({});
});

router.post('/projects/:project_id/contacts/:project_contact_id/scopes', requireRole(['ProjectOwner', 'ProjectAdmin']), (req, res) => {
  res.json({});
});

router.get('/projects/:project_id/contacts/:project_contact_id/scopes', requireRole('authenticated'), (req, res) => {
  res.json([]);
});

// Flags & Photos
router.post('/projects/:project_id/flags', requireRole('authenticated'), (req, res) => {
  res.json({});
});

router.post('/projects/:project_id/photos', requireRole('authenticated'), (req, res) => {
  res.json({});
});

router.post('/projects/:project_id/flags/:flag_id/photos', requireRole('authenticated'), (req, res) => {
  res.json({});
});

// Reports
router.post('/projects/:project_id/report-templates', requireRole(['ProjectOwner', 'ProjectAdmin']), (req, res) => {
  res.json({});
});

router.post('/projects/:project_id/report-templates/:template_id/generate', requireRole('authenticated'), (req, res) => {
  res.json({});
});

// Schedule
router.post('/projects/:project_id/schedule', requireRole(['ProjectOwner', 'ProjectAdmin']), (req, res) => {
  res.json({});
});

router.get('/projects/:project_id/schedule', requireRole('authenticated'), (req, res) => {
  res.json([]);
});

// Notifications
router.post('/projects/:project_id/subscriptions', requireRole('authenticated'), (req, res) => {
  res.json({});
});

export default router;
