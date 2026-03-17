const STORAGE_KEY = 'myNovelChapters';

function getLocalChapters() {
function getChapters() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

async function getChapters() {
  try {
    const response = await fetch('data/chapters.json', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (error) {
    // Fallback to local storage for static-only preview mode.
  }

  return getLocalChapters();
}

function renderChapters(chapters) {
  const list = document.getElementById('chapterList');
  const count = document.getElementById('chapterCount');
function renderChapters() {
  const list = document.getElementById('chapterList');
  const count = document.getElementById('chapterCount');
  const chapters = getChapters();

  count.textContent = `${chapters.length} chapter${chapters.length === 1 ? '' : 's'} available`;

  if (!chapters.length) {
    list.innerHTML = '<li class="empty">No chapters yet</li>';
    return;
  }

  list.innerHTML = chapters
    .map((chapter) => {
      const number = chapter.number ? `Chapter ${chapter.number}: ` : '';
      return `<li><a href="chapters/${chapter.file}">${number}${chapter.title}</a></li>`;
    })
    .join('');
}

(async () => {
  const chapters = await getChapters();
  renderChapters(chapters);
})();
renderChapters();
