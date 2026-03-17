const settingsToggle = document.getElementById('readerSettingsToggle');
const settingsPanel = document.getElementById('readerSettings');
const termEditorToggle = document.getElementById('termEditorToggle');
const termEditor = document.getElementById('termEditor');
const chapterRead = document.querySelector('.chapter-read');
const tabButtons = document.querySelectorAll('[data-tab]');
const settingsPanels = document.querySelectorAll('[data-panel]');

const SETTINGS_KEY = 'myNovelReaderSettings';
const TERMS_KEY = 'myNovelTerms';

const tabButtons = document.querySelectorAll('.settings-tab');
const settingsPanels = document.querySelectorAll('.settings-panel');
const chapterRead = document.querySelector('.chapter-read');

const enableTheme = document.getElementById('enableTheme');
const bgColorPicker = document.getElementById('bgColorPicker');
const bgColorInput = document.getElementById('bgColorInput');
const textColorPicker = document.getElementById('textColorPicker');
const textColorInput = document.getElementById('textColorInput');
const fontDown = document.getElementById('fontDown');
const fontUp = document.getElementById('fontUp');
const lineDown = document.getElementById('lineDown');
const lineUp = document.getElementById('lineUp');
const fontSizeLabel = document.getElementById('fontSizeLabel');
const lineHeightLabel = document.getElementById('lineHeightLabel');
const resetReaderSettings = document.getElementById('resetReaderSettings');
const saveReaderSettings = document.getElementById('saveReaderSettings');
const fontSelect = document.getElementById('fontSelect');
const readerPreview = document.getElementById('readerPreview');

const SETTINGS_KEY = 'myNovelReaderSettings';
const defaults = {
  enabled: false,
  background: '#171311',
  color: '#f5ede4',
  fontSize: 18,
  lineHeight: 1.7,
  fontFamily: 'Segoe UI',
  themeMode: 'dark',
  termColors: 'enabled',
};

let state = { ...defaults };
let terms = [];
const originalContent = chapterRead ? chapterRead.innerHTML : '';

function safeColor(value, fallback) {
  return /^#[0-9a-fA-F]{6}$/.test(value || '') ? value : fallback;
}

function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    state = {
      ...defaults,
      ...parsed,
      background: safeColor(parsed.background, defaults.background),
      color: safeColor(parsed.color, defaults.color),
      fontSize: Math.min(28, Math.max(14, Number(parsed.fontSize) || defaults.fontSize)),
      lineHeight: Math.min(2.2, Math.max(1.2, Number(parsed.lineHeight) || defaults.lineHeight)),
    };
  } catch {
    state = { ...defaults };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
}

function loadTerms() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TERMS_KEY) || '[]');
    terms = Array.isArray(parsed) ? parsed : [];
  } catch {
    terms = [];
  }
}

function saveTerms() {
  localStorage.setItem(TERMS_KEY, JSON.stringify(terms));
}

function activateSegment(group, value) {
  const groupEl = document.querySelector(`[data-setting-group="${group}"]`);
  if (!groupEl) return;
  groupEl.querySelectorAll('.segment').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.value === value);
  });
};

let state = { ...defaults };

function safeColor(value, fallback) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(value);
  return valid ? value : fallback;
}

function applyState() {
  if (!chapterRead) return;

  chapterRead.style.fontFamily = state.fontFamily;
  chapterRead.style.fontSize = `${state.fontSize}px`;
  chapterRead.style.lineHeight = String(state.lineHeight);

  document.body.classList.toggle('theme-light', state.themeMode === 'light');
  document.body.classList.toggle('theme-dark', state.themeMode === 'dark');
  chapterRead.style.fontSize = `${state.fontSize}px`;
  chapterRead.style.lineHeight = String(state.lineHeight);
  chapterRead.style.fontFamily = state.fontFamily;

  if (state.enabled) {
    document.body.style.backgroundColor = state.background;
    document.body.style.color = state.color;
    chapterRead.style.background = '#151b24';
    chapterRead.style.color = state.color;
  } else {
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
    chapterRead.style.color = '';
  }

  const preview = document.getElementById('readerPreview');
  if (preview) {
    preview.style.background = state.enabled ? '#0f141b' : '';
    preview.style.color = state.enabled ? state.color : '';
  }

  const fontSizeLabel = document.getElementById('fontSizeLabel');
  const lineHeightLabel = document.getElementById('lineHeightLabel');
  if (fontSizeLabel) fontSizeLabel.textContent = String(state.fontSize);
  if (lineHeightLabel) lineHeightLabel.textContent = state.lineHeight.toFixed(1);

  document.body.classList.toggle('term-colors-disabled', state.termColors === 'disabled');
  activateSegment('themeMode', state.themeMode);
  activateSegment('termColors', state.termColors);

  applyTerms();
}

function renderTermList() {
  const termList = document.getElementById('termList');
  if (!termList) return;
  if (!terms.length) {
    termList.innerHTML = 'No terms found. Use editor and tap Save.';
    return;
  }

  termList.innerHTML = terms
    .map(
      (term, index) =>
        `<div class="term-item"><strong>${term.from}</strong> → ${term.to} <button type="button" class="term-delete" data-term-index="${index}">Delete</button></div>`,
    )
    .join('');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyTerms() {
  if (!chapterRead) return;

  chapterRead.innerHTML = originalContent;

  const termsEnabled = document.getElementById('enableTermsGlobal');
  if (termsEnabled && !termsEnabled.checked) {
    return;
  }

  if (!terms.length) return;

  const walker = document.createTreeWalker(chapterRead, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((node) => {
    let content = node.nodeValue;
    let replaced = false;

    terms.forEach((term) => {
      if (!term.from || !term.to) return;
      const flags = term.caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(escapeRegExp(term.from), flags);
      if (regex.test(content)) {
        content = content.replace(regex, `<span class="term-highlight">${term.to}</span>`);
        replaced = true;
      }
    });

    if (replaced) {
      const wrapper = document.createElement('span');
      wrapper.innerHTML = content;
      node.parentNode.replaceChild(wrapper, node);
    }
  });
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function setChecked(id, value) {
  const el = document.getElementById(id);
  if (el) el.checked = Boolean(value);
}

function fillControls() {
  setChecked('enableTheme', state.enabled);
  setInputValue('bgColorPicker', state.background);
  setInputValue('bgColorInput', state.background);
  setInputValue('textColorPicker', state.color);
  setInputValue('textColorInput', state.color);
  setInputValue('fontSelect', state.fontFamily);
  applyState();
  renderTermList();
}

settingsToggle?.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));
termEditorToggle?.addEventListener('click', () => termEditor.classList.toggle('hidden'));
    chapterRead.style.background = '';
    chapterRead.style.color = '';
  }

  readerPreview.style.background = state.enabled ? '#0f141b' : '';
  readerPreview.style.color = state.enabled ? state.color : '';

  fontSizeLabel.textContent = String(state.fontSize);
  lineHeightLabel.textContent = state.lineHeight.toFixed(1);
}

function fillControls() {
  enableTheme.checked = state.enabled;
  bgColorPicker.value = state.background;
  bgColorInput.value = state.background;
  textColorPicker.value = state.color;
  textColorInput.value = state.color;
  fontSelect.value = state.fontFamily;
  applyState();
}

function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    state = {
      enabled: Boolean(parsed.enabled),
      background: safeColor(parsed.background, defaults.background),
      color: safeColor(parsed.color, defaults.color),
      fontSize: Math.min(28, Math.max(14, Number(parsed.fontSize) || defaults.fontSize)),
      lineHeight: Math.min(2.2, Math.max(1.2, Number(parsed.lineHeight) || defaults.lineHeight)),
      fontFamily: parsed.fontFamily || defaults.fontFamily,
    };
  } catch {
    state = { ...defaults };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
}

settingsToggle?.addEventListener('click', () => {
  settingsPanel.classList.toggle('hidden');
});

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const tab = button.dataset.tab;
    if (!tab) return;
    tabButtons.forEach((btn) => {
      if (btn.dataset.tab) btn.classList.toggle('active', btn === button);
    });
    settingsPanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === tab));
  });
});

document.querySelectorAll('[data-term-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    const tab = button.dataset.termTab;
    document.querySelectorAll('[data-term-tab]').forEach((btn) => btn.classList.toggle('active', btn === button));
    document.querySelectorAll('[data-term-panel]').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.termPanel === tab);
    });
  });
});

document.querySelectorAll('[data-setting-group] .segment').forEach((button) => {
  button.addEventListener('click', () => {
    const group = button.closest('[data-setting-group]')?.dataset.settingGroup;
    if (!group) return;
    const value = button.dataset.value;
    button.closest('[data-setting-group]').querySelectorAll('.segment').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    state[group] = value;
    applyState();
  });
});

document.getElementById('enableTheme')?.addEventListener('change', (e) => {
  state.enabled = e.target.checked;
  applyState();
});

document.getElementById('bgColorPicker')?.addEventListener('input', (e) => {
  state.background = e.target.value;
  setInputValue('bgColorInput', state.background);
  applyState();
});

document.getElementById('bgColorInput')?.addEventListener('change', (e) => {
  state.background = safeColor(e.target.value, state.background);
  setInputValue('bgColorInput', state.background);
  setInputValue('bgColorPicker', state.background);
  applyState();
});

document.getElementById('textColorPicker')?.addEventListener('input', (e) => {
  state.color = e.target.value;
  setInputValue('textColorInput', state.color);
  applyState();
});

document.getElementById('textColorInput')?.addEventListener('change', (e) => {
  state.color = safeColor(e.target.value, state.color);
  setInputValue('textColorInput', state.color);
  setInputValue('textColorPicker', state.color);
  applyState();
});

document.getElementById('fontSelect')?.addEventListener('change', (e) => {
  state.fontFamily = e.target.value;
  applyState();
});

document.getElementById('fontDown')?.addEventListener('click', () => {
    tabButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    settingsPanels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.panel === tab);
    });
  });
});

enableTheme?.addEventListener('change', () => {
  state.enabled = enableTheme.checked;
  applyState();
});

bgColorPicker?.addEventListener('input', () => {
  state.background = bgColorPicker.value;
  bgColorInput.value = state.background;
  applyState();
});

bgColorInput?.addEventListener('change', () => {
  state.background = safeColor(bgColorInput.value, state.background);
  bgColorPicker.value = state.background;
  bgColorInput.value = state.background;
  applyState();
});

textColorPicker?.addEventListener('input', () => {
  state.color = textColorPicker.value;
  textColorInput.value = state.color;
  applyState();
});

textColorInput?.addEventListener('change', () => {
  state.color = safeColor(textColorInput.value, state.color);
  textColorPicker.value = state.color;
  textColorInput.value = state.color;
  applyState();
});

fontSelect?.addEventListener('change', () => {
  state.fontFamily = fontSelect.value;
  applyState();
});

fontDown?.addEventListener('click', () => {
  state.fontSize = Math.max(14, state.fontSize - 1);
  applyState();
});

document.getElementById('fontUp')?.addEventListener('click', () => {
fontUp?.addEventListener('click', () => {
  state.fontSize = Math.min(28, state.fontSize + 1);
  applyState();
});

document.getElementById('lineDown')?.addEventListener('click', () => {
lineDown?.addEventListener('click', () => {
  state.lineHeight = Math.max(1.2, Number((state.lineHeight - 0.1).toFixed(1)));
  applyState();
});

document.getElementById('lineUp')?.addEventListener('click', () => {
lineUp?.addEventListener('click', () => {
  state.lineHeight = Math.min(2.2, Number((state.lineHeight + 0.1).toFixed(1)));
  applyState();
});

document.getElementById('resetReaderSettings')?.addEventListener('click', () => {
resetReaderSettings?.addEventListener('click', () => {
  state = { ...defaults };
  fillControls();
  settingsPanel.classList.add('hidden');
});

document.getElementById('saveReaderSettings')?.addEventListener('click', () => {
saveReaderSettings?.addEventListener('click', () => {
  saveSettings();
  settingsPanel.classList.add('hidden');
});

document.getElementById('saveTermBtn')?.addEventListener('click', () => {
  const from = document.getElementById('termFrom')?.value.trim();
  const to = document.getElementById('termTo')?.value.trim();
  const caseSensitive = document.getElementById('termCaseSensitive')?.checked;
  const thisNovelOnly = document.getElementById('termNovelOnly')?.checked;

  if (!from || !to) return;

  terms.push({ from, to, caseSensitive, thisNovelOnly });
  saveTerms();
  renderTermList();
  applyTerms();

  document.getElementById('termFrom').value = '';
  document.getElementById('termTo').value = '';
});

document.getElementById('termList')?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const index = target.dataset.termIndex;
  if (typeof index === 'undefined') return;
  terms.splice(Number(index), 1);
  saveTerms();
  renderTermList();
  applyTerms();
});

document.getElementById('closeTermEditor')?.addEventListener('click', () => {
  termEditor.classList.add('hidden');
});

document.getElementById('enableTermsGlobal')?.addEventListener('change', () => {
  applyTerms();
});

loadSettings();
loadTerms();
loadSettings();
fillControls();
