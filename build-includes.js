#!/usr/bin/env node
/* build-includes.js
 *
 * Builds src/ into the REPOSITORY ROOT, resolving <!-- @@include name.html -->
 * against src/includes/. The root is what GitHub Pages serves (branch: main,
 * folder: / (root)), so index.html, pages/, modules/, css/, js/ and assets/
 * at the top level are generated output. Edit src/, never the root copies.
 *
 * Run from the project root:  node build-includes.js
 *
 * Deliberately dependency-free: a wireframe pack should still build in three
 * years when nobody remembers which node_modules it wanted.
 */

const fs = require('fs');
const path = require('path');

const root = __dirname;
const srcDir = path.join(root, 'src');
const outDir = root;
const includesDir = path.join(srcDir, 'includes');

if (!fs.existsSync(srcDir)) {
  console.error('No src/ directory found. Run this from the project root.');
  process.exit(1);
}

/* Clear only what the build generates, so deleted pages do not linger and
 * get published. Source, requirements and repo files are never touched. */
const GENERATED = ['index.html', 'pages', 'modules', 'css', 'js', 'assets'];
for (const g of GENERATED) fs.rmSync(path.join(outDir, g), { recursive: true, force: true });
/* GitHub Pages: serve files as-is, no Jekyll processing. */
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

for (const dir of ['css', 'js', 'assets']) {
  copyDir(path.join(srcDir, dir), path.join(outDir, dir));
}

const includes = {};
if (fs.existsSync(includesDir)) {
  for (const file of fs.readdirSync(includesDir).filter((f) => f.endsWith('.html'))) {
    includes[file] = fs.readFileSync(path.join(includesDir, file), 'utf8');
  }
}

/* Includes may themselves include, up to a sane depth. */
function resolve(content, depth = 0) {
  if (depth > 5) return content;
  let changed = false;
  const out = content.replace(/[ \t]*<!--\s*@@include\s+([\w.-]+)\s*-->/g, (match, name) => {
    if (!includes[name]) {
      console.warn(`  ! missing include: ${name}`);
      return match;
    }
    changed = true;
    return includes[name];
  });
  return changed ? resolve(out, depth + 1) : out;
}

/* Pages nested one level deep need ../ on their asset paths; the hub at the
 * root does not. Authoring every page with root-relative paths and rewriting
 * here means a page can be moved between folders without hand-editing links. */
function depthPrefix(relativePath) {
  const depth = relativePath.split(path.sep).length - 1;
  return depth === 0 ? './' : '../'.repeat(depth);
}

let count = 0;
function build(from, relativePath) {
  const resolved = resolve(fs.readFileSync(from, 'utf8'))
    .replace(/(href|src)="~\//g, `$1="${depthPrefix(relativePath)}`);
  const target = path.join(outDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, resolved, 'utf8');
  count += 1;
}

function walk(dir, base = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      if (['includes', 'css', 'js', 'assets'].includes(entry.name)) continue;
      walk(full, rel);
    } else if (entry.name.endsWith('.html')) {
      build(full, rel);
    }
  }
}

walk(srcDir);
console.log(`Built ${count} page(s) into the repository root`);
