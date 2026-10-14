// Builds index.html from templates/home.html plus content/*.md (legal pages,
// shown via #slug), wrapped in templates/layout.html.
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const root = path.join(__dirname, '..');
const layout = fs.readFileSync(path.join(root, 'templates', 'layout.html'), 'utf8');
const home = fs.readFileSync(path.join(root, 'templates', 'home.html'), 'utf8');
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

const legal = fs.readdirSync(contentDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const slug = path.basename(file, '.md');
    const { body } = parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
    return `<article class="legal" id="${slug}">\n${marked.parse(body)}</article>`;
  })
  .join('\n');

const html = layout
  .replace('{{title}}', 'Leonhart – Der ultimative Kickertisch')
  .replace('{{description}}', 'Der ITSF-zertifizierte Leonhart Kickertisch – handgefertigt in Bayern, jetzt auch in der Schweiz erhältlich.')
  .replace('{{content}}', () => home)
  .replace('{{legal}}', () => legal);
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('built index.html');
