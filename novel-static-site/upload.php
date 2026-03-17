<?php
header('Content-Type: application/json');

$adminPassword = 'novel123';
$chaptersDir = __DIR__ . '/chapters';
$manifestFile = __DIR__ . '/data/chapters.json';

function respond($success, $message, $extra = []) {
    http_response_code($success ? 200 : 400);
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $extra));
    exit;
}

function sanitize_slug($value) {
    $slug = strtolower(trim($value));
    $slug = preg_replace('/[^a-z0-9-]+/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    return trim($slug, '-');
}

function escape_html($value) {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function text_to_paragraphs($text) {
    $text = trim($text);
    if ($text === '') {
        return "<p>No chapter content provided.</p>";
    }

    $chunks = preg_split('/\R{2,}/', $text);
    $parts = [];

    foreach ($chunks as $chunk) {
        $line = nl2br(escape_html(trim($chunk)));
        if ($line !== '') {
            $parts[] = "<p>{$line}</p>";
        }
    }

    return implode("\n        ", $parts);
}

function build_html($title, $bodyContent) {
    $safeTitle = escape_html($title);

    return "<!DOCTYPE html>
<html lang=\"en\">
  <head>
    <meta charset=\"UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>{$safeTitle} - My Novel</title>
    <link rel=\"stylesheet\" href=\"../styles.css\" />
  </head>
  <body>
    <header class=\"topbar\">
      <div class=\"brand-wrap\">
        <span class=\"brand-icon\">📖</span>
        <span class=\"brand-title\">My Novel</span>
      </div>
      <a class=\"icon-btn\" href=\"../index.html\">⌂</a>
    </header>

    <main class=\"page\">
      <article class=\"card chapter-read\">
        <h1>{$safeTitle}</h1>
        {$bodyContent}
      </article>
      <a class=\"btn-outline\" href=\"../index.html\">← Back to all chapters</a>
    </main>
  </body>
</html>";
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method.');
}

$password = isset($_POST['adminPassword']) ? trim($_POST['adminPassword']) : '';
if ($password !== $adminPassword) {
    respond(false, 'Invalid admin password.');
}

$chapterNumber = isset($_POST['chapterNumber']) ? intval($_POST['chapterNumber']) : 0;
$chapterTitle = isset($_POST['chapterTitle']) ? trim($_POST['chapterTitle']) : '';
$slugInput = isset($_POST['chapterSlug']) ? trim($_POST['chapterSlug']) : '';
$chapterText = isset($_POST['chapterText']) ? trim($_POST['chapterText']) : '';

if ($chapterNumber <= 0) {
    respond(false, 'Chapter number is required.');
}

if ($chapterTitle === '') {
    respond(false, 'Chapter title is required.');
}

$slug = sanitize_slug($slugInput);
if ($slug === '') {
    $slug = 'chapter-' . $chapterNumber;
}

$fileBody = '';
if (isset($_FILES['chapterFile']) && $_FILES['chapterFile']['error'] !== UPLOAD_ERR_NO_FILE) {
    if ($_FILES['chapterFile']['error'] !== UPLOAD_ERR_OK) {
        respond(false, 'File upload failed.');
    }

    $name = $_FILES['chapterFile']['name'];
    $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (!in_array($extension, ['txt', 'html', 'htm'])) {
        respond(false, 'Only .txt, .html, or .htm files are allowed.');
    }

    $fileBody = file_get_contents($_FILES['chapterFile']['tmp_name']);
    if ($fileBody === false) {
        respond(false, 'Unable to read uploaded file.');
    }
}

$content = trim($chapterText);
if ($fileBody !== '') {
    $content = trim($fileBody);
}

if ($content === '') {
    respond(false, 'Please upload a file or paste chapter content.');
}

$isHtmlInput = preg_match('/<\/?[a-z][\s\S]*>/i', $content) === 1;
$bodyContent = $isHtmlInput ? $content : text_to_paragraphs($content);
$chapterHtml = build_html($chapterTitle, $bodyContent);

if (!is_dir($chaptersDir) && !mkdir($chaptersDir, 0755, true)) {
    respond(false, 'Unable to create chapters directory.');
}

$fileName = $slug . '.html';
$chapterPath = $chaptersDir . '/' . $fileName;
if (file_put_contents($chapterPath, $chapterHtml) === false) {
    respond(false, 'Unable to save chapter file to hosting.');
}

$manifest = [];
if (file_exists($manifestFile)) {
    $existing = file_get_contents($manifestFile);
    $decoded = json_decode($existing, true);
    if (is_array($decoded)) {
        $manifest = $decoded;
    }
}

$filtered = [];
foreach ($manifest as $entry) {
    if (!isset($entry['slug']) || $entry['slug'] !== $slug) {
        $filtered[] = $entry;
    }
}

$filtered[] = [
    'number' => $chapterNumber,
    'title' => $chapterTitle,
    'slug' => $slug,
    'file' => $fileName
];

usort($filtered, function ($a, $b) {
    return intval($a['number']) <=> intval($b['number']);
});

if (!is_dir(dirname($manifestFile)) && !mkdir(dirname($manifestFile), 0755, true)) {
    respond(false, 'Unable to create data directory.');
}

if (file_put_contents($manifestFile, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)) === false) {
    respond(false, 'Chapter saved, but failed to update manifest.');
}

respond(true, 'Chapter uploaded successfully.', ['file' => $fileName]);
