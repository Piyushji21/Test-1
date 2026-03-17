const chapterForm = document.getElementById('chapterForm');
const chapterNumber = document.getElementById('chapterNumber');
const chapterTitle = document.getElementById('chapterTitle');
const chapterSlug = document.getElementById('chapterSlug');
const chapterFile = document.getElementById('chapterFile');
const chapterText = document.getElementById('chapterText');
const submitChapterBtn = document.getElementById('submitChapterBtn');
const formMessage = document.getElementById('formMessage');

function sanitizeSlug(input) {
  return (input || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function setMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle('error-text', isError);
  formMessage.classList.toggle('success-text', !isError && message.length > 0);
}

chapterTitle.addEventListener('input', () => {
  if (!chapterSlug.value.trim()) {
    chapterSlug.value = sanitizeSlug(chapterTitle.value);
  }
});

chapterFile.addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  if (!chapterSlug.value.trim()) {
    chapterSlug.value = sanitizeSlug(file.name.replace(/\.[^/.]+$/, ''));
  }

  if (file.type.includes('text') || /\.(txt|html?)$/i.test(file.name)) {
    const text = await file.text();
    chapterText.value = text;
  }
});

chapterForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const content = chapterText.value.trim();
  const selectedFile = chapterFile.files[0];

  if (!selectedFile && !content) {
    setMessage('Please upload a file or paste chapter content before submitting.', true);
    return;
  }

  chapterSlug.value = sanitizeSlug(chapterSlug.value) || `chapter-${chapterNumber.value}`;
  const formData = new FormData(chapterForm);

  submitChapterBtn.disabled = true;
  setMessage('Publishing chapter...');

  try {
    const response = await fetch(chapterForm.action, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      setMessage(result.message || 'Failed to upload chapter.', true);
      return;
    }

    setMessage(`Chapter published successfully: chapters/${result.file}`);
    chapterForm.reset();
  } catch (error) {
    setMessage('Upload failed. Ensure your host supports PHP and upload.php is reachable.', true);
  } finally {
    submitChapterBtn.disabled = false;
  }
});
