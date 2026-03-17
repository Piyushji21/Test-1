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
      <div class=\"reader-actions\">
        <button id=\"readerSettingsToggle\" class=\"icon-btn\" type=\"button\" aria-label=\"Reader settings\">⚙</button>
        <a class=\"icon-btn\" href=\"../index.html\" aria-label=\"Back to home\">⌂</a>
      </div>
    </header>

    <section id=\"readerSettings\" class=\"reader-settings hidden\">
      <div class=\"settings-tabs\">
        <button type=\"button\" class=\"settings-tab\" data-tab=\"term\">Term</button>
        <button type=\"button\" class=\"settings-tab\" data-tab=\"text\">Text</button>
        <button type=\"button\" class=\"settings-tab active\" data-tab=\"reader\">Reader</button>
      </div>

      <div class=\"settings-panel\" data-panel=\"term\">
        <h3>Terms Style</h3>
        <div class=\"segmented\">
          <button class=\"segment active\" type=\"button\">Bold On</button>
          <button class=\"segment\" type=\"button\">Underline Off</button>
          <button class=\"segment\" type=\"button\">Italic Off</button>
        </div>
        <h3>System Terms</h3>
        <div class=\"segmented\">
          <button class=\"segment active\" type=\"button\">Default</button>
          <button class=\"segment\" type=\"button\">Colored</button>
        </div>
        <h3>Preview</h3>
        <div class=\"settings-preview\">“This is the <span class=\"term-blue\">Otsutsuki Clan</span> and <span class=\"term-green\">Chakra</span>.”</div>
      </div>

      <div class=\"settings-panel\" data-panel=\"text\">
        <h3>Brackets Style</h3>
        <div class=\"segmented\">
          <button class=\"segment active\" type=\"button\">【Corner】</button>
          <button class=\"segment\" type=\"button\">[Regular]</button>
          <button class=\"segment\" type=\"button\">『Semi-Corner』</button>
        </div>

        <label class=\"switch-row\">
          <input id=\"autoPunc\" type=\"checkbox\" checked />
          <span>Auto Fix English Punctuation</span>
        </label>

        <label for=\"fontSelect\">Custom Font</label>
        <select id=\"fontSelect\" class=\"reader-select\">
          <option value=\"Segoe UI\">Nunito Sans</option>
          <option value=\"Roboto, sans-serif\">Roboto</option>
          <option value=\"Georgia, serif\">Lora</option>
        </select>
      </div>

      <div class=\"settings-panel active\" data-panel=\"reader\">
        <h3>Custom Theme Creator</h3>
        <label class=\"switch-row\">
          <input id=\"enableTheme\" type=\"checkbox\" />
          <span>Enable Custom Theme</span>
        </label>

        <label for=\"bgColorInput\">Background Color</label>
        <div class=\"color-row\">
          <input id=\"bgColorPicker\" type=\"color\" value=\"#171311\" />
          <input id=\"bgColorInput\" type=\"text\" value=\"#171311\" />
        </div>

        <label for=\"textColorInput\">Text Color</label>
        <div class=\"color-row\">
          <input id=\"textColorPicker\" type=\"color\" value=\"#f5ede4\" />
          <input id=\"textColorInput\" type=\"text\" value=\"#f5ede4\" />
        </div>

        <label>Font Size</label>
        <div class=\"segmented font-size-control\">
          <button id=\"fontDown\" class=\"segment\" type=\"button\">A-</button>
          <span id=\"fontSizeLabel\" class=\"segment active\">18</span>
          <button id=\"fontUp\" class=\"segment\" type=\"button\">A+</button>
        </div>

        <label>Line Height</label>
        <div class=\"segmented line-height-control\">
          <button id=\"lineDown\" class=\"segment\" type=\"button\">Height -</button>
          <span id=\"lineHeightLabel\" class=\"segment active\">1.7</span>
          <button id=\"lineUp\" class=\"segment\" type=\"button\">Height +</button>
        </div>

        <h3>Preview</h3>
        <div id=\"readerPreview\" class=\"settings-preview\">
          \"Welcome to <span class=\"term-green\">wtr-lab</span>,\" she said. It's a journey worth taking!
        </div>
      </div>

      <div class=\"settings-footer\">
        <button id=\"resetReaderSettings\" type=\"button\" class=\"btn-secondary\">Cancel</button>
        <button id=\"saveReaderSettings\" type=\"button\" class=\"btn-primary\">Save Changes</button>
      </div>
    </section>

    <main class=\"page\">
      <article class=\"card chapter-read\">
        <h1>{$safeTitle}</h1>
        {$bodyContent}
      </article>
      <a class=\"btn-outline\" href=\"../index.html\">← Back to all chapters</a>
    </main>

    <script src=\"../reader-settings.js\"></script>
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
