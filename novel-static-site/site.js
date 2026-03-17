const STORAGE_KEY = 'myNovelChapters';

function getChapters() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

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

renderChapters();
