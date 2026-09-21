export function buildBreadcrumbTrail(fileName = '', workspaceName = 'Workspace') {
  const clean = String(fileName || '').replace(/\\/g, '/').trim();
  if (!clean) return [workspaceName];
  const parts = clean.split('/').filter(Boolean);
  return parts.length ? [workspaceName, ...parts] : [workspaceName];
}

export function formatStatusSummary({ line = 1, column = 1, language = 'TEXT', wrap = false, autoRun = true } = {}) {
  const wrapLabel = wrap ? 'WRAP ON' : 'WRAP OFF';
  const autoRunLabel = autoRun ? 'AUTO-RUN' : 'AUTO-RUN OFF';
  return `Ln ${line}, Col ${column} · ${language} · ${wrapLabel} · ${autoRunLabel}`;
}

export function buildRecentDocuments(entries = [], limit = 8) {
  const recent = [];
  const indexByName = new Map();
  for (const entry of entries) {
    const fileName = String(entry?.fileName || '').trim();
    if (!fileName) continue;
    if (indexByName.has(fileName)) {
      recent[indexByName.get(fileName)] = { fileName, code: entry?.code ?? '', savedAt: entry?.savedAt ?? Date.now() };
    } else {
      const position = recent.length;
      indexByName.set(fileName, position);
      recent.push({ fileName, code: entry?.code ?? '', savedAt: entry?.savedAt ?? Date.now() });
    }
  }
  return recent.slice(0, limit);
}

export function toggleBookmark(bookmarks = [], entry = {}) {
  const fileName = String(entry?.fileName || '').trim();
  if (!fileName) return bookmarks;
  const existing = bookmarks.some(item => item.fileName === fileName);
  if (existing) return bookmarks.filter(item => item.fileName !== fileName);
  return [...bookmarks, { fileName, code: entry?.code ?? '', savedAt: entry?.savedAt ?? Date.now() }];
}

export function buildQuickOpenEntries(recent = [], bookmarks = [], templates = []) {
  const items = [];
  recent.forEach(entry => items.push({ type: 'recent', value: entry.fileName, label: entry.fileName, hint: 'recent' }));
  bookmarks.forEach(entry => items.push({ type: 'bookmark', value: entry.fileName, label: entry.fileName, hint: 'bookmark' }));
  templates.forEach(template => items.push({ type: 'template', value: template.name, label: template.label || template.name, hint: 'template' }));
  return items;
}

export function mutateDocumentList(documents = [], { action = 'none', fileName = '', nextName = '' } = {}) {
  if (!fileName) return documents;
  const docs = documents.map(item => Object.assign({}, item));
  if (action === 'duplicate') {
    const target = docs.find(item => item.fileName === fileName);
    if (!target) return docs;
    const base = target.fileName.replace(/\.[^.]+$/, '');
    const ext = target.fileName.match(/\.[^.]+$/)?.[0] || '';
    const duplicateName = `${base}-copy${ext}`;
    return [...docs, Object.assign({}, target, { fileName: duplicateName })];
  }
  if (action === 'rename') {
    return docs.map(item => item.fileName === fileName ? Object.assign({}, item, { fileName: nextName || item.fileName }) : item);
  }
  if (action === 'remove') {
    return docs.filter(item => item.fileName !== fileName);
  }
  return docs;
}

export function createProjectNode(name = 'untitled', kind = 'folder', meta = {}) {
  return { name, kind, ...meta, children: [] };
}

export function collectProjectTree(node) {
  if (!node) return [];
  const collectedChildren = (node.children || []).flatMap(child => collectProjectTree(child));
  return [Object.assign({}, node, { children: collectedChildren })];
}

export function buildProjectTemplateEntries(entries = []) {
  return entries.map((entry, index) => ({
    id: String(entry?.id || entry?.name || `template-${index + 1}`),
    name: String(entry?.name || entry?.id || `template-${index + 1}`),
    label: String(entry?.label || entry?.name || entry?.id || `Template ${index + 1}`),
    description: String(entry?.description || ''),
    kind: 'template'
  }));
}

export function buildRecentProjects(entries = [], limit = 6) {
  const recent = [];
  const seen = new Set();
  for (const entry of entries) {
    const name = String(entry?.name || entry?.fileName || '').trim();
    const fileName = String(entry?.fileName || '').trim();
    if (!name || !fileName) continue;
    const key = `${name}:${fileName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    recent.push({ name, fileName, savedAt: entry?.savedAt ?? Date.now() });
  }
  return recent.slice(0, limit);
}

export function deleteProjectTreeNode(nodes = [], idToDelete = '') {
  if (!idToDelete) return nodes;
  return nodes.filter(node => {
    if (node.id === idToDelete) return false;
    if (node.children) node.children = deleteProjectTreeNode(node.children, idToDelete);
    return true;
  });
}

export function renameProjectTreeNode(nodes = [], idToRename = '', newName = '') {
  if (!idToRename || !newName) return nodes;
  return nodes.map(node => {
    if (node.id === idToRename) return Object.assign({}, node, { name: newName });
    if (node.children) node.children = renameProjectTreeNode(node.children, idToRename, newName);
    return node;
  });
}

export function moveProjectTreeNode(nodes = [], idToMove = '', targetFolderId = '') {
  if (!idToMove) return nodes;

  let nodeToMove = null;
  
  const removeNode = (list) => {
    return list.filter(node => {
      if (node.id === idToMove) {
        nodeToMove = { ...node };
        return false;
      }
      if (node.children) {
        node.children = removeNode(node.children);
      }
      return true;
    });
  };

  const cleanNodes = removeNode(nodes.map(n => Object.assign({}, n)));
  if (!nodeToMove) return nodes;

  if (!targetFolderId) {
    return [...cleanNodes, nodeToMove];
  }

  const addNode = (list) => {
    return list.map(node => {
      if (node.id === targetFolderId && node.kind === 'folder') {
        return Object.assign({}, node, { children: [...(node.children || []), nodeToMove] });
      }
      if (node.children) {
        return { ...node, children: addNode(node.children) };
      }
      return node;
    });
  };

  return addNode(cleanNodes);
}

export function setProjectTreeNodeTag(nodes = [], nodeId = '', tag = '') {
  if (!nodeId) return nodes;
  return nodes.map(node => {
    if (node.id === nodeId) {
      return Object.assign({}, node, { tag: String(tag || '').trim() });
    }
    if (node.children) {
      return { ...node, children: setProjectTreeNodeTag(node.children, nodeId, tag) };
    }
    return node;
  });
}

export function setProjectTreeNodeNote(nodes = [], nodeId = '', note = '') {
  if (!nodeId) return nodes;
  return nodes.map(node => {
    if (node.id === nodeId) {
      return Object.assign({}, node, { note: String(note || '').trim() });
    }
    if (node.children) {
      return { ...node, children: setProjectTreeNodeNote(node.children, nodeId, note) };
    }
    return node;
  });
}

const TEXT_FILE_EXTENSIONS = /\.(html?|css|js|mjs|cjs|ts|tsx|jsx|vue|svelte|json|jsonc|txt|md|markdown|svg|xml|yml|yaml|toml|ini|env|csv|tsv|py|rb|go|rs|java|c|h|cpp|hpp|cs|php|sh|bat|ps1|sql|graphql|gql|log|gitignore|editorconfig)$/i;

/**
 * Decide whether an uploaded file should be treated as editable text vs. a binary asset.
 * Accepts a plain { name, type } shape so it works with File objects and plain test fixtures alike.
 */
export function isLikelyTextFile(file = {}) {
  const name = String(file.name || '');
  const type = String(file.type || '');
  if (TEXT_FILE_EXTENSIONS.test(name)) return true;
  if (type.startsWith('text/')) return true;
  if (type === 'application/json' || type === 'application/xml' || type === 'application/javascript') return true;
  if (!type && !name.includes('.')) return true; // extensionless text files (README, Dockerfile, etc.)
  return false;
}

/**
 * Insert a (possibly nested, "/"-delimited) uploaded file path into a project tree,
 * creating intermediate folder nodes as needed. Returns a new tree (does not mutate input).
 * `makeId` lets callers/tests supply deterministic ids.
 */
export function insertFileIntoProjectTree(nodes = [], filePath = '', makeId = () => Math.random().toString(36).slice(2)) {
  const parts = String(filePath || '').replace(/\\/g, '/').split('/').filter(Boolean);
  if (!parts.length) return nodes;
  const leaf = parts[parts.length - 1];
  const folderParts = parts.slice(0, -1);

  const clone = list => list.map(node => ({ ...node, children: node.children ? clone(node.children) : node.children }));
  const tree = clone(nodes);

  let level = tree;
  for (const folderName of folderParts) {
    let folder = level.find(node => node.kind === 'folder' && node.name === folderName);
    if (!folder) {
      folder = { id: makeId(), name: folderName, kind: 'folder', children: [] };
      level.push(folder);
    }
    if (!folder.children) folder.children = [];
    level = folder.children;
  }

  const existingFile = level.find(node => node.kind === 'file' && node.name === leaf);
  if (!existingFile) level.push({ id: makeId(), name: leaf, kind: 'file', content: filePath });
  return tree;
}

/**
 * Pick a contextual, locally-generated chat prompt suggestion for an idle input field
 * (no network call). Mirrors the "pause typing, see a suggestion" UX of Google AI Studio.
 * Returns null when nothing fits.
 */
export function pickLocalSuggestion({ draft = '', fileName = 'untitled.html', language = 'TEXT' } = {}) {
  const trimmed = String(draft || '').trim();
  const bank = [
    { test: () => !trimmed, text: `Explain what ${fileName} currently does.` },
    { test: () => !trimmed, text: `Refactor ${fileName} for readability and performance.` },
    { test: () => !trimmed, text: `Find bugs or edge cases in ${fileName}.` },
    { test: () => !trimmed, text: `Add accessibility improvements (ARIA, contrast, focus states) to ${fileName}.` },
    { test: () => !trimmed && /js|ts/i.test(language), text: `Generate unit tests for the functions in ${fileName}.` },
    { test: () => /fix|bug|error|broken/i.test(trimmed), text: `${trimmed} — include the exact console error and the fix.` },
    { test: () => /test/i.test(trimmed) && !/generate|write/i.test(trimmed), text: `Generate unit tests covering: ${trimmed}` },
    { test: () => /style|css|design|theme/i.test(trimmed), text: `${trimmed} — keep it responsive and accessible (contrast, reduced motion).` },
    { test: () => /todo|later on|stub/i.test(trimmed), text: `${trimmed} — implement it fully now, no placeholders.` },
    { test: () => trimmed.length > 0 && trimmed.length < 18 && !/[.?!]$/.test(trimmed), text: `${trimmed} in ${fileName}, and explain the change.` }
  ];
  const match = bank.find(item => { try { return item.test(); } catch { return false; } });
  return match ? match.text : null;
}
