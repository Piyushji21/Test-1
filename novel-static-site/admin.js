const ADMIN_PASSWORD = 'novel123';
const STORAGE_KEY = 'myNovelChapters';

const lockCard = document.getElementById('lockCard');
const adminPanel = document.getElementById('adminPanel');
const previewCard = document.getElementById('previewCard');
const passwordInput = document.getElementById('passwordInput');
const unlockBtn = document.getElementById('unlockBtn');
const lockMessage = document.getElementById('lockMessage');

const chapterNumber = document.getElementById('chapterNumber');
const chapterTitle = document.getElementById('chapterTitle');
const chapterSlug = document.getElementById('chapterSlug');
const chapterFile = document.getElementById('chapterFile');
const chapterText = document.getElementById('chapterText');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const htmlPreview = document.getElementById('htmlPreview');
const exportBtn = document.getElementById('exportBtn');
const importInput = document.getElementById('importInput');

let generatedHtml = '';

function getChapters() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveChapters(chapters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
}

function sanitizeSlug(input) {
  return (input || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toParagraphs(text) {
  if (!text.trim()) {
    return '<p>No chapter content provided.</p>';
  }

  return text
    .split(/\n{2,}/)
    .map((chunk) => `<p>${escapeHtml(chunk.trim()).replace(/\n/g, '<br />')}</p>`)
    .join('\n      ');
}

function buildHtml(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} - My Novel</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <header class="topbar">
      <div class="brand-wrap">
        <span class="brand-icon">📖</span>
        <span class="brand-title">My Novel</span>
      </div>
      <a class="icon-btn" href="../index.html">⌂</a>
    </header>

    <main class="page">
      <article class="card chapter-read">
        <h1>${escapeHtml(title)}</h1>
        ${bodyContent}
      </article>
      <a class="btn-outline" href="../index.html">← Back to all chapters</a>
    </main>
  </body>
</html>`;
}

function unlockAdmin() {
  lockCard.classList.add('hidden');
  adminPanel.classList.remove('hidden');
  previewCard.classList.remove('hidden');
}

unlockBtn.addEventListener('click', () => {
  if (passwordInput.value.trim() === ADMIN_PASSWORD) {
    unlockAdmin();
    lockMessage.textContent = 'Admin unlocked!';
    return;
  }
  lockMessage.textContent = 'Incorrect password. Try again.';
});

chapterFile.addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;

  const text = await file.text();
  chapterText.value = text;

  if (!chapterSlug.value) {
    chapterSlug.value = sanitizeSlug(file.name.replace(/\.[^/.]+$/, ''));
  }
});

generateBtn.addEventListener('click', () => {
  const titleValue = chapterTitle.value.trim() || 'Untitled Chapter';
  const slug = sanitizeSlug(chapterSlug.value.trim()) || `chapter-${chapterNumber.value || 'new'}`;
  const number = Number(chapterNumber.value) || null;
  const content = chapterText.value.trim();
  const isHtmlInput = /<\/?[a-z][\s\S]*>/i.test(content);
  const bodyContent = isHtmlInput ? content : toParagraphs(content);

  generatedHtml = buildHtml(titleValue, bodyContent);
  htmlPreview.textContent = generatedHtml;
  downloadBtn.disabled = false;

  const chapters = getChapters();
  const next = chapters.filter((chapter) => chapter.slug !== slug);
  next.push({
    number,
    title: titleValue,
    slug,
    file: `${slug}.html`,
  });
  next.sort((a, b) => (a.number || 9999) - (b.number || 9999));
  saveChapters(next);
});

downloadBtn.addEventListener('click', () => {
  if (!generatedHtml) return;

  const slug = sanitizeSlug(chapterSlug.value.trim()) || 'new-chapter';
  const fileName = `${slug}.html`;
  const blob = new Blob([generatedHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
});

exportBtn.addEventListener('click', () => {
  const chapters = getChapters();
  const blob = new Blob([JSON.stringify(chapters, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'chapters-manifest.json';
  anchor.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed)) throw new Error('Invalid format');
    saveChapters(parsed);
    lockMessage.textContent = 'Chapters imported successfully.';
  } catch {
    lockMessage.textContent = 'Import failed. Please upload a valid JSON file.';
  }
});
