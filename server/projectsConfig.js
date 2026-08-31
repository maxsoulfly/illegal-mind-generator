import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsConfigPath = path.join(dirname, '..', 'src', 'config', 'projects.json');

let cached = null;

// Reads the same bootstrap config the frontend ships (src/config/projects.json)
// directly off disk — never duplicated as data, just read by a second
// runtime. Cached in memory for the life of the process; this file only
// changes with an app deploy/restart, not live user data.
function loadProjectsConfig() {
  if (!cached) {
    cached = JSON.parse(fs.readFileSync(projectsConfigPath, 'utf8'));
  }
  return cached;
}

export function getBaseTags(projectId) {
  const config = loadProjectsConfig();
  return config[projectId]?.tags || {};
}
