import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import storage from './storage/local';

interface Photo {
  id: string;
  projectId: string;
  filename: string;
  storageKey: string;
  metadata?: Record<string, unknown>;
}

interface FlagPhotoLink {
  id: string;
  flagId: string;
  photoId: string;
}

const photos: Photo[] = [];
const flagPhotoLinks: FlagPhotoLink[] = [];

const app = express();
app.use(express.json({ limit: '10mb' }));

// POST /projects/:project_id/photos
app.post('/projects/:project_id/photos', async (req, res) => {
  const { project_id } = req.params as { project_id: string };
  const { filename, data, metadata } = req.body;
  if (!filename || !data) {
    return res.status(400).json({ error: 'filename and data required' });
  }
  try {
    const buffer = Buffer.from(data, 'base64');
    const storageKey = await storage.save(buffer, filename);
    const photo: Photo = {
      id: uuidv4(),
      projectId: project_id,
      filename,
      storageKey,
      metadata,
    };
    photos.push(photo);
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: 'unable to save photo' });
  }
});

// POST /projects/:project_id/flags/:flag_id/photos
app.post('/projects/:project_id/flags/:flag_id/photos', (req, res) => {
  const { project_id, flag_id } = req.params as { project_id: string; flag_id: string };
  const { photoId } = req.body;
  const photo = photos.find((p) => p.id === photoId && p.projectId === project_id);
  if (!photo) {
    return res.status(404).json({ error: 'photo not found for project' });
  }
  const link: FlagPhotoLink = { id: uuidv4(), flagId: flag_id, photoId };
  flagPhotoLinks.push(link);
  res.status(201).json(link);
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export { app, photos, flagPhotoLinks };
