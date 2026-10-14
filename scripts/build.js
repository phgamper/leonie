// Renders content/*.md into <slug>/index.html using templates/page.html.
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const root = path.join(__dirname, '..');
const template = fs.readFileSync(path.join(root, 'templates', 'page.html'), 'utf8');
const contentDir = path.join(root, 'content');

function parse(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('Missing front matter');
  const meta = {};
  match[1].split('\n').forEach((line) => {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
  return { meta, body: match[2] };
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

fs.readdirSync(contentDir)
  .filter((file) => file.endsWith('.md'))
  .forEach((file) => {
    const slug = path.basename(file, '.md');
    const { meta, body } = parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
    const html = template
      .replace(/{{slug}}/g, slug)
      .replace(/{{title}}/g, escapeHtml(meta.title || slug))
      .replace('{{content}}', () => marked.parse(body));
    const outDir = path.join(root, slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log(`built ${slug}/index.html`);
  });
