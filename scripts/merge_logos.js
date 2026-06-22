const fs = require('fs');
const path = require('path');

const PROJECT = path.resolve(__dirname, '..');

// Load old gstatic logos
const oldFile = path.join(PROJECT, 'js', 'team-logos-data.json');
const oldLogos = JSON.parse(fs.readFileSync(oldFile, 'utf8'));
console.log(`Old logos (gstatic): ${Object.keys(oldLogos).length}`);

// Load new Wikipedia/TheSportsDB logos
const newFile = path.join(PROJECT, 'api', 'team-logos-thesportsdb.json');
const newLogos = JSON.parse(fs.readFileSync(newFile, 'utf8'));

// Convert new format ({source, url} -> url) and count
const merged = { ...oldLogos };
let replaced = 0;
let added = 0;

for (const [name, data] of Object.entries(newLogos)) {
  const cleanName = name.trim();
  if (!cleanName) continue;
  if (data && typeof data === 'object' && data.url) {
    merged[cleanName] = data.url;
    if (oldLogos[cleanName]) {
      replaced++;
    } else {
      added++;
    }
  }
}

fs.writeFileSync(oldFile, JSON.stringify(merged, null, 2), 'utf8');
console.log(`Replaced: ${replaced}, Added: ${added}, Total: ${Object.keys(merged).length}`);

// Remove old test file
const testFile = path.join(PROJECT, 'api', 'team-logos-test.json');
if (fs.existsSync(testFile)) {
  fs.unlinkSync(testFile);
  console.log('Removed team-logos-test.json');
}
