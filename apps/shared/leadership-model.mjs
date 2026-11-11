import seed from './leadership-seed.json' with { type: 'json' };

export const postFields = ['title', 'person', 'availability'];
export const taskFields = ['title', 'category', 'mission', 'decisions', 'tasks', 'boundary', 'time', 'primary', 'deputy'];
export const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const limits = { title: 120, category: 80, person: 80, availability: 2000, mission: 4000, decisions: 4000, tasks: 8000, boundary: 4000, time: 2000, notes: 12000 };
const text = (value, field) => typeof value === 'string' && value.length <= limits[field];
const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,90}$/.test(value);

export function validateLeadership(value) {
  if (!value || value.id !== seed.id || value.version !== seed.version || !text(value.notes, 'notes') ||
    !Array.isArray(value.posts) || value.posts.length !== 8 || !Array.isArray(value.tasks) || value.tasks.length > 200) throw new Error('Invalid leadership draft');
  const posts = seed.posts.map(base => {
    const matches = value.posts.filter(post => post?.id === base.id);
    if (matches.length !== 1) throw new Error('Invalid post');
    const post = matches[0];
    if (!postFields.every(field => text(post[field], field))) throw new Error('Invalid post fields');
    return { ...base, title: base.fixed ? base.title : post.title, person: post.person, availability: post.availability };
  });
  const ids = new Set(posts.map(post => post.id)); const seen = new Set();
  const tasks = value.tasks.map(task => {
    if (!task || !validId(task.id) || seen.has(task.id) || !taskFields.filter(field => !['primary', 'deputy'].includes(field)).every(field => text(task[field], field)) ||
      ![task.primary, task.deputy].every(id => id === null || ids.has(id)) || (task.primary !== null && task.primary === task.deputy)) throw new Error('Invalid task');
    seen.add(task.id);
    return Object.fromEntries(['id', ...taskFields].map(field => [field, task[field]]));
  });
  return { ...structuredClone(seed), posts, tasks, notes: value.notes };
}
export function createLeadership() { return validateLeadership(seed); }
export function changeKey(change) { return JSON.stringify([change.scope, change.id || '', change.field]); }
export function changeValue(draft, change) {
  if (change.scope === 'notes') return draft.notes;
  const item = draft[change.scope === 'post' ? 'posts' : 'tasks'].find(item => item.id === change.id);
  return change.field === '$item' ? item || null : item?.[change.field] ?? null;
}
export function diffLeadership(before, after) {
  const changes = [];
  const add = (scope, id, field, previous, value) => { if (!equal(previous, value)) changes.push({ scope, id, field, before: previous, value }); };
  add('notes', '', 'notes', before.notes, after.notes);
  for (const post of after.posts) {
    const old = before.posts.find(item => item.id === post.id);
    for (const field of postFields) if (!(field === 'title' && post.fixed)) add('post', post.id, field, old[field], post[field]);
  }
  for (const id of new Set([...before.tasks, ...after.tasks].map(task => task.id))) {
    const old = before.tasks.find(task => task.id === id); const next = after.tasks.find(task => task.id === id);
    if (!old || !next) add('task', id, '$item', old || null, next || null);
    else for (const field of taskFields) add('task', id, field, old[field], next[field]);
  }
  return changes;
}
export function applyLeadership(draft, changes) {
  if (!Array.isArray(changes) || !changes.length || changes.length > 2500) throw new Error('Invalid changes');
  const next = structuredClone(draft); const seen = new Set();
  for (const change of changes) {
    if (!change || typeof change !== 'object' || !['notes', 'post', 'task'].includes(change.scope)) throw new Error('Invalid change');
    const key = changeKey(change); if (seen.has(key)) throw new Error('Duplicate field'); seen.add(key);
    if (change.scope === 'notes') {
      if (change.field !== 'notes') throw new Error('Invalid notes'); next.notes = change.value; continue;
    }
    if (!validId(change.id)) throw new Error('Invalid identifier');
    const list = change.scope === 'post' ? next.posts : next.tasks;
    const index = list.findIndex(item => item.id === change.id);
    if (change.scope === 'task' && change.field === '$item') {
      if (change.value === null) { if (index >= 0) list.splice(index, 1); }
      else {
        if (change.value?.id !== change.id) throw new Error('Invalid task identifier');
        if (index < 0) list.push(change.value); else list[index] = change.value;
      }
    } else {
      if (index < 0 || !(change.scope === 'post' ? postFields : taskFields).includes(change.field)) throw new Error('Invalid field');
      if (change.scope === 'post' && change.field === 'title' && list[index].fixed) throw new Error('Fixed title');
      list[index][change.field] = change.value;
    }
  }
  return validateLeadership(next);
}
