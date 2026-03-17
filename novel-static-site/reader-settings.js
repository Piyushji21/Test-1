const settingsToggle = document.getElementById('readerSettingsToggle');
const settingsPanel = document.getElementById('readerSettings');
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
};

let state = { ...defaults };

function safeColor(value, fallback) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(value);
  return valid ? value : fallback;
}

function applyState() {
  if (!chapterRead) return;

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

fontUp?.addEventListener('click', () => {
  state.fontSize = Math.min(28, state.fontSize + 1);
  applyState();
});

lineDown?.addEventListener('click', () => {
  state.lineHeight = Math.max(1.2, Number((state.lineHeight - 0.1).toFixed(1)));
  applyState();
});

lineUp?.addEventListener('click', () => {
  state.lineHeight = Math.min(2.2, Number((state.lineHeight + 0.1).toFixed(1)));
  applyState();
});

resetReaderSettings?.addEventListener('click', () => {
  state = { ...defaults };
  fillControls();
  settingsPanel.classList.add('hidden');
});

saveReaderSettings?.addEventListener('click', () => {
  saveSettings();
  settingsPanel.classList.add('hidden');
});

loadSettings();
fillControls();
