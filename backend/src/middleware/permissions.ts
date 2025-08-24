export const routePermissions: Record<string, string[]> = {
  '/auth/logout': ['AccountAdmin', 'ProjectOwner', 'ProjectAdmin', 'Viewer'],
  '/accounts': ['AccountAdmin'],
  '/projects': ['AccountAdmin', 'ProjectOwner', 'ProjectAdmin', 'Viewer'],
  '/projects/:project_id/owner': ['AccountAdmin', 'ProjectOwner'],
  '/projects/:project_id/contacts': ['AccountAdmin', 'ProjectOwner', 'ProjectAdmin'],
  '/projects/:project_id/contacts/:project_contact_id/scopes': ['AccountAdmin', 'ProjectOwner', 'ProjectAdmin'],
  '/projects/:project_id/flags': ['AccountAdmin', 'ProjectOwner', 'ProjectAdmin'],
  '/projects/:project_id/photos': ['AccountAdmin', 'ProjectOwner', 'ProjectAdmin'],
  '/projects/:project_id/flags/:flag_id/photos': ['AccountAdmin', 'ProjectOwner', 'ProjectAdmin'],
  '/projects/:project_id/report-templates': ['AccountAdmin', 'ProjectOwner', 'ProjectAdmin'],
  '/projects/:project_id/report-templates/:template_id/generate': ['AccountAdmin', 'ProjectOwner', 'ProjectAdmin', 'Viewer'],
  '/projects/:project_id/schedule': ['AccountAdmin', 'ProjectOwner', 'ProjectAdmin'],
  '/projects/:project_id/subscriptions': ['AccountAdmin', 'ProjectOwner', 'ProjectAdmin'],
  '/billing': ['AccountAdmin']
};
