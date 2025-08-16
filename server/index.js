const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// simple CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const dataDir = path.join(__dirname, 'data');
const projectFile = path.join(dataDir, 'project.json');
const contactsFile = path.join(dataDir, 'contacts.json');
const flagsFile = path.join(dataDir, 'flags.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.get('/api/project', (req, res) => {
  const data = readJson(projectFile);
  res.json(data);
});

app.post('/api/contact', (req, res) => {
  const contacts = readJson(contactsFile);
  contacts.push({ ...req.body, timestamp: new Date().toISOString() });
  writeJson(contactsFile, contacts);
  res.json({ success: true });
});

app.post('/api/flag', (req, res) => {
  const flags = readJson(flagsFile);
  flags.push({ ...req.body, timestamp: new Date().toISOString() });
  writeJson(flagsFile, flags);
  res.json({ success: true });
});

// serve built frontend if present
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
