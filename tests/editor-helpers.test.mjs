import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBreadcrumbTrail, formatStatusSummary, buildRecentDocuments, toggleBookmark, buildQuickOpenEntries, mutateDocumentList, createProjectNode, collectProjectTree, buildProjectTemplateEntries, buildRecentProjects, deleteProjectTreeNode, renameProjectTreeNode, moveProjectTreeNode, setProjectTreeNodeTag, setProjectTreeNodeNote, isLikelyTextFile, insertFileIntoProjectTree, pickLocalSuggestion, crc32, buildZipBytes, parseZipBytes } from '../editor-helpers.js';

test('buildBreadcrumbTrail keeps workspace and file segments', () => {
  assert.deepEqual(buildBreadcrumbTrail('src/app/main.js'), ['Workspace', 'src', 'app', 'main.js']);
  assert.deepEqual(buildBreadcrumbTrail('untitled.html'), ['Workspace', 'untitled.html']);
});

test('formatStatusSummary reports line, column, and mode state', () => {
  assert.equal(formatStatusSummary({ line: 12, column: 8, language: 'HTML', wrap: false, autoRun: true }), 'Ln 12, Col 8 · HTML · WRAP OFF · AUTO-RUN');
  assert.equal(formatStatusSummary({ line: 3, column: 1, language: 'JS', wrap: true, autoRun: false }), 'Ln 3, Col 1 · JS · WRAP ON · AUTO-RUN OFF');
});

test('buildRecentDocuments keeps the latest unique entries', () => {
  const list = buildRecentDocuments([
    { fileName: 'a.html', code: 'A', savedAt: 1 },
    { fileName: 'b.html', code: 'B', savedAt: 2 },
    { fileName: 'a.html', code: 'A2', savedAt: 3 }
  ], 2);

  assert.deepEqual(list.map(item => item.fileName), ['a.html', 'b.html']);
  assert.equal(list[0].code, 'A2');
});

test('toggleBookmark adds and removes an item', () => {
  const added = toggleBookmark([], { fileName: 'notes.md', code: '# hi' });
  assert.equal(added.length, 1);
  assert.equal(added[0].fileName, 'notes.md');

  const removed = toggleBookmark(added, { fileName: 'notes.md', code: '# hi' });
  assert.equal(removed.length, 0);
});

test('buildQuickOpenEntries merges recent, bookmark, and template entries', () => {
  const entries = buildQuickOpenEntries(
    [{ fileName: 'app.js' }],
    [{ fileName: 'notes.md' }],
    [{ name: 'landing', label: 'Landing page' }]
  );

  assert.equal(entries.length, 3);
  assert.equal(entries[0].value, 'app.js');
  assert.equal(entries[1].type, 'bookmark');
  assert.equal(entries[2].label, 'Landing page');
});

test('mutateDocumentList can duplicate, rename, and remove items', () => {
  let docs = [{ fileName: 'index.html', code: '<h1>Hi</h1>' }];
  docs = mutateDocumentList(docs, { action: 'duplicate', fileName: 'index.html' });
  assert.equal(docs.length, 2);
  assert.equal(docs[1].fileName, 'index-copy.html');

  docs = mutateDocumentList(docs, { action: 'rename', fileName: 'index-copy.html', nextName: 'home.html' });
  assert.equal(docs[1].fileName, 'home.html');

  docs = mutateDocumentList(docs, { action: 'remove', fileName: 'home.html' });
  assert.equal(docs.length, 1);
});

test('createProjectNode and collectProjectTree build a simple tree', () => {
  const tree = createProjectNode('src');
  const child = createProjectNode('app.js', 'file', { content: 'console.log(1)' });
  tree.children = [child];
  const collected = collectProjectTree(tree);
  assert.equal(collected[0].name, 'src');
  assert.equal(collected[0].children[0].name, 'app.js');
  assert.equal(collected[0].children[0].kind, 'file');
});

test('collectProjectTree handles grandchildren (3-level deep tree)', () => {
  const root = createProjectNode('project');
  const folder = createProjectNode('src', 'folder');
  const file = createProjectNode('main.js', 'file', { content: '' });
  folder.children = [file];
  root.children = [folder];
  const collected = collectProjectTree(root);
  assert.equal(collected[0].name, 'project');
  assert.equal(collected[0].children[0].name, 'src');
  assert.equal(collected[0].children[0].children[0].name, 'main.js');
  assert.equal(collected[0].children[0].children[0].kind, 'file');
});


test('buildProjectTemplateEntries and buildRecentProjects normalize project data', () => {
  const templates = buildProjectTemplateEntries([
    { id: 'landing', label: 'Landing page', description: 'Marketing shell' },
    { name: 'dashboard', description: 'Analytics UI' }
  ]);

  assert.equal(templates.length, 2);
  assert.equal(templates[0].id, 'landing');
  assert.equal(templates[1].label, 'dashboard');

  const recent = buildRecentProjects([
    { name: 'Landing page', fileName: 'landing.html', savedAt: 1 },
    { name: 'Landing page', fileName: 'landing.html', savedAt: 2 },
    { name: 'Dashboard', fileName: 'dashboard.html', savedAt: 3 }
  ], 2);

  assert.equal(recent.length, 2);
  assert.equal(recent[0].name, 'Landing page');
  assert.equal(recent[1].name, 'Dashboard');
});

test('deleteProjectTreeNode, renameProjectTreeNode, and moveProjectTreeNode manage tree correctly', () => {
  let tree = [
    { id: 'folder-1', name: 'src', kind: 'folder', children: [
      { id: 'file-1', name: 'app.js', kind: 'file', content: '' }
    ]},
    { id: 'folder-2', name: 'assets', kind: 'folder', children: [] }
  ];

  // Test rename
  tree = renameProjectTreeNode(tree, 'file-1', 'main.js');
  assert.equal(tree[0].children[0].name, 'main.js');

  // Test move
  tree = moveProjectTreeNode(tree, 'file-1', 'folder-2');
  assert.equal(tree[0].children.length, 0);
  assert.equal(tree[1].children[0].name, 'main.js');

  // Test delete
  tree = deleteProjectTreeNode(tree, 'file-1');
  assert.equal(tree[1].children.length, 0);
});

test('setProjectTreeNodeTag and setProjectTreeNodeNote add/update properties', () => {
  let tree = [
    { id: 'folder-1', name: 'src', kind: 'folder', children: [
      { id: 'file-1', name: 'app.js', kind: 'file', content: '' }
    ]}
  ];

  // Test set tag
  tree = setProjectTreeNodeTag(tree, 'file-1', 'important');
  assert.equal(tree[0].children[0].tag, 'important');

  // Test set note
  tree = setProjectTreeNodeNote(tree, 'file-1', 'This is a crucial file.');
  assert.equal(tree[0].children[0].note, 'This is a crucial file.');

  // Test clear tag
  tree = setProjectTreeNodeTag(tree, 'file-1', '');
  assert.equal(tree[0].children[0].tag, '');
});

test('isLikelyTextFile recognizes text extensions, mime types, and extensionless files', () => {
  assert.equal(isLikelyTextFile({ name: 'index.html' }), true);
  assert.equal(isLikelyTextFile({ name: 'notes.md' }), true);
  assert.equal(isLikelyTextFile({ name: 'data.json', type: 'application/json' }), true);
  assert.equal(isLikelyTextFile({ name: 'README' }), true); // extensionless, no mime
  assert.equal(isLikelyTextFile({ name: 'script.py' }), true);
  assert.equal(isLikelyTextFile({ name: 'photo.png', type: 'image/png' }), false);
  assert.equal(isLikelyTextFile({ name: 'archive.zip', type: 'application/zip' }), false);
  assert.equal(isLikelyTextFile({ name: 'clip.mp4', type: 'video/mp4' }), false);
});

test('insertFileIntoProjectTree creates nested folders and avoids duplicate leaves', () => {
  let id = 0;
  const makeId = () => `id-${id++}`;
  let tree = insertFileIntoProjectTree([], 'src/components/Button.jsx', makeId);
  assert.equal(tree[0].name, 'src');
  assert.equal(tree[0].kind, 'folder');
  assert.equal(tree[0].children[0].name, 'components');
  assert.equal(tree[0].children[0].children[0].name, 'Button.jsx');
  assert.equal(tree[0].children[0].children[0].kind, 'file');

  // A second file in the same folder should reuse the existing folder node, not create a sibling.
  tree = insertFileIntoProjectTree(tree, 'src/components/Card.jsx', makeId);
  assert.equal(tree.length, 1);
  assert.equal(tree[0].children[0].children.length, 2);

  // A root-level file (no folders) is appended directly.
  tree = insertFileIntoProjectTree(tree, 'README.md', makeId);
  assert.ok(tree.some(node => node.name === 'README.md' && node.kind === 'file'));

  // Re-adding the same path is a no-op (no duplicate leaf).
  const before = JSON.stringify(tree);
  tree = insertFileIntoProjectTree(tree, 'README.md', makeId);
  assert.equal(JSON.stringify(tree), before);
});

test('insertFileIntoProjectTree does not mutate the input tree', () => {
  const original = [{ id: 'a', name: 'src', kind: 'folder', children: [] }];
  const snapshot = JSON.parse(JSON.stringify(original));
  insertFileIntoProjectTree(original, 'src/app.js', () => 'x');
  assert.deepEqual(original, snapshot);
});

test('pickLocalSuggestion offers a contextual idea when the draft is empty', () => {
  const suggestion = pickLocalSuggestion({ draft: '', fileName: 'game.js', language: 'JAVASCRIPT' });
  assert.match(suggestion, /game\.js/);
});

test('pickLocalSuggestion sharpens a bug-shaped draft into a fuller prompt', () => {
  const suggestion = pickLocalSuggestion({ draft: 'fix the login bug', fileName: 'auth.js', language: 'JAVASCRIPT' });
  assert.match(suggestion, /fix the login bug/);
  assert.match(suggestion, /console error/);
});

test('pickLocalSuggestion returns null when nothing in the bank matches', () => {
  const longNeutralDraft = 'Please write a complete deployment runbook covering every environment and rollback step.';
  const suggestion = pickLocalSuggestion({ draft: longNeutralDraft, fileName: 'ops.md', language: 'MARKDOWN' });
  assert.equal(suggestion, null);
});

test('crc32 matches a known reference value', () => {
  // Standard reference: CRC32("123456789") === 0xCBF43926
  const bytes = new TextEncoder().encode('123456789');
  assert.equal(crc32(bytes), 0xcbf43926);
});

test('buildZipBytes/parseZipBytes round-trips a multi-file project', () => {
  const files = { 'index.html': '<h1>Hi</h1>', 'src/app.js': 'console.log(1)', 'notes.md': '# Notes' };
  const zipBytes = buildZipBytes(files);
  assert.ok(zipBytes instanceof Uint8Array);
  assert.ok(zipBytes.length > 0);
  const parsed = parseZipBytes(zipBytes);
  assert.deepEqual(parsed, files);
});

test('buildZipBytes produces a valid ZIP signature and EOCD record', () => {
  const zipBytes = buildZipBytes({ 'a.txt': 'hi' });
  const view = new DataView(zipBytes.buffer);
  assert.equal(view.getUint32(0, true), 0x04034b50); // local file header signature
  // EOCD signature must appear somewhere near the end
  let found = false;
  for (let i = zipBytes.length - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) { found = true; break; }
  }
  assert.ok(found, 'EOCD signature not found');
});

test('parseZipBytes reports deflate (method 8) entries via onDeflate instead of throwing', () => {
  // Hand-crafted minimal ZIP with a "deflate" method flag (8) — content is irrelevant since
  // this only tests that STORE-parsing correctly routes non-STORE entries to the callback.
  const stored = buildZipBytes({ 'store.txt': 'plain' });
  // Flip the method field (offset 8 in local header, offset 10 in central header) to 8 to simulate deflate.
  const view = new DataView(stored.buffer);
  view.setUint16(8, 8, true); // local header method
  // Find central header (search for signature) and flip its method field too.
  for (let i = 0; i < stored.length - 4; i++) {
    if (view.getUint32(i, true) === 0x02014b50) { view.setUint16(i + 10, 8, true); break; }
  }
  const deflateNames = [];
  const parsed = parseZipBytes(stored, (name) => deflateNames.push(name));
  assert.deepEqual(parsed, {});
  assert.deepEqual(deflateNames, ['store.txt']);
});

test('parseZipBytes throws a clear error for non-ZIP data', () => {
  const garbage = new TextEncoder().encode('not a zip file at all');
  assert.throws(() => parseZipBytes(garbage), /Invalid ZIP/);
});
