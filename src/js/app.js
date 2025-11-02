"use strict";

const primaryEl = document.querySelector('[data-display="primary"]');
const secondaryEl = document.querySelector('[data-display="secondary"]');
const keypadEl = document.querySelector('[data-component="keypad"]');

const state = {
  displayValue: "0",
  firstOperand: null,
  operator: null,
  awaitingSecondOperand: false,
  lastSecondOperand: null,
  memory: 0,
};

function isError() {
  return state.displayValue === "Error";
}

function trimEndZeros(value) {
  const s = typeof value === "number" ? value.toString() : String(value);
  if (!s.includes(".")) return s;
  return s.replace(/\.0+$|(?<=\.\d*?)0+$/g, "");
}

function symbolForOperator(op) {
  switch (op) {
    case "/": return "÷";
    case "*": return "×";
    default: return op;
  }
}

function symbolForExpression(op) {
  switch (op) {
    case "/": return "÷";
    case "*": return "x"; // visual spec: use 'x' instead of '×' in the top expression
    default: return op;
  }
}

function formatResult(n) {
  if (!isFinite(n)) return "Error";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) return Number(n.toExponential(8)).toString();
  const str = Number(n.toPrecision(12)).toString();
  return trimEndZeros(str);
}

function buildSecondary() {
  const memIndicator = state.memory !== 0 ? " • M" : "";
  const hasOp = state.operator !== null && state.firstOperand !== null;
  if (!hasOp) return memIndicator.trim();

  const left = trimEndZeros(state.firstOperand);
  const op = symbolForExpression(state.operator);
  if (state.awaitingSecondOperand) {
    return `${left} ${op}${memIndicator}`;
  }
  const right = trimEndZeros(state.displayValue);
  return `${left} ${op} ${right}${memIndicator}`;
}

function getPrimaryDisplay() {
  if (isError()) return state.displayValue;
  const hasOp = state.operator !== null && state.firstOperand !== null;
  if (hasOp && !state.awaitingSecondOperand) {
    const second = parseFloat(state.displayValue);
    if (!Number.isNaN(second)) {
      return compute(state.firstOperand, second, state.operator);
    }
  }
  return state.displayValue;
}

function updateDisplays() {
  primaryEl.textContent = getPrimaryDisplay();
  secondaryEl.textContent = buildSecondary() || "\u00A0";
}

function inputDigit(digit) {
  if (isError()) return clearAll();
  if (state.awaitingSecondOperand) {
    state.displayValue = String(digit);
    state.awaitingSecondOperand = false;
  } else {
    state.displayValue = state.displayValue === "0" ? String(digit) : state.displayValue + String(digit);
  }
  updateDisplays();
}

function inputDecimal() {
  if (isError()) return clearAll();
  if (state.awaitingSecondOperand) {
    state.displayValue = "0.";
    state.awaitingSecondOperand = false;
    return updateDisplays();
  }
  if (!state.displayValue.includes(".")) {
    state.displayValue += ".";
    updateDisplays();
  }
}

function toggleSign() {
  if (isError()) return clearAll();
  if (state.displayValue === "0") return;
  state.displayValue = state.displayValue.startsWith("-")
    ? state.displayValue.slice(1)
    : "-" + state.displayValue;
  updateDisplays();
}

function inputPercent() {
  if (isError()) return clearAll();
  const v = parseFloat(state.displayValue);
  if (Number.isNaN(v)) return;
  state.displayValue = formatResult(v / 100);
  updateDisplays();
}

function deleteLast() {
  if (isError()) return clearAll();
  if (state.awaitingSecondOperand) return;
  const s = state.displayValue;
  state.displayValue = (s.length <= 1 || (s.length === 2 && s.startsWith("-"))) ? "0" : s.slice(0, -1);
  updateDisplays();
}

function clearAll() {
  state.displayValue = "0";
  state.firstOperand = null;
  state.operator = null;
  state.awaitingSecondOperand = false;
  state.lastSecondOperand = null;
  updateDisplays();
}

function compute(a, b, op) {
  let res;
  switch (op) {
    case "+": res = a + b; break;
    case "-": res = a - b; break;
    case "*": res = a * b; break;
    case "/": res = (b === 0) ? Infinity : a / b; break;
    case "^": res = Math.pow(a, b); break;
    default: return "Error";
  }
  return formatResult(res);
}

function handleOperator(nextOperator) {
  if (isError()) return clearAll();
  const inputValue = parseFloat(state.displayValue);
  if (Number.isNaN(inputValue)) return;

  if (state.operator && state.awaitingSecondOperand) {
    state.operator = nextOperator;
    return updateDisplays();
  }

  if (state.firstOperand === null) {
    state.firstOperand = inputValue;
  } else if (state.operator) {
    const result = compute(state.firstOperand, inputValue, state.operator);
    state.displayValue = result;
    state.firstOperand = result === "Error" ? null : parseFloat(result);
  }

  state.awaitingSecondOperand = true;
  state.operator = nextOperator;
  updateDisplays();
}

function equals() {
  if (isError()) return clearAll();
  if (state.operator === null) return;

  const secondOperand = state.awaitingSecondOperand
    ? (state.lastSecondOperand ?? state.firstOperand)
    : parseFloat(state.displayValue);

  state.lastSecondOperand = secondOperand;

  const result = compute(state.firstOperand, secondOperand, state.operator);
  state.displayValue = result;
  state.firstOperand = result === "Error" ? null : parseFloat(result);
  state.operator = null;
  state.awaitingSecondOperand = false;
  updateDisplays();
}

function square() {
  if (isError()) return clearAll();
  const v = parseFloat(state.displayValue);
  if (Number.isNaN(v)) return;
  state.displayValue = formatResult(v * v);
  updateDisplays();
}

function sqrt() {
  if (isError()) return clearAll();
  const v = parseFloat(state.displayValue);
  if (v < 0) { state.displayValue = "Error"; return updateDisplays(); }
  state.displayValue = formatResult(Math.sqrt(v));
  updateDisplays();
}

function reciprocal() {
  if (isError()) return clearAll();
  const v = parseFloat(state.displayValue);
  if (v === 0) { state.displayValue = "Error"; return updateDisplays(); }
  state.displayValue = formatResult(1 / v);
  updateDisplays();
}

function startPower() { handleOperator('^'); }

function memoryClear() { state.memory = 0; updateDisplays(); }
function memoryRecall() {
  state.displayValue = trimEndZeros(state.memory);
  state.awaitingSecondOperand = false;
  updateDisplays();
}
function memoryAdd() {
  const v = parseFloat(state.displayValue);
  if (!Number.isNaN(v)) { state.memory += v; updateDisplays(); }
}
function memorySubtract() {
  const v = parseFloat(state.displayValue);
  if (!Number.isNaN(v)) { state.memory -= v; updateDisplays(); }
}

keypadEl.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  switch (action) {
    case "digit": inputDigit(btn.dataset.digit); break;
    case "decimal": inputDecimal(); break;
    case "operator": handleOperator(btn.dataset.operator); break;
    case "equals": equals(); break;
    case "clear": clearAll(); break;
    case "delete": deleteLast(); break;
    case "sign": toggleSign(); break;
    case "percent": inputPercent(); break;
    case "square": square(); break;
    case "sqrt": sqrt(); break;
    case "reciprocal": reciprocal(); break;
    case "power": startPower(); break;
    case "memory-clear": memoryClear(); break;
    case "memory-recall": memoryRecall(); break;
    case "memory-add": memoryAdd(); break;
    case "memory-subtract": memorySubtract(); break;
    default: break;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key >= '0' && e.key <= '9') { inputDigit(e.key); return; }
  switch (e.key) {
    case '.': inputDecimal(); break;
    case '+': case '-': case '*': case '/': handleOperator(e.key); break;
    case '^': startPower(); break;
    case 'Enter': case '=': equals(); break;
    case 'Backspace': deleteLast(); break;
    case 'Escape': clearAll(); break;
    case '%': inputPercent(); break;
    default: break;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const themeStorageKey = "calc-theme";
  const availableThemes = ["theme-teal","theme-rose","theme-amber","theme-violet","theme-sky"];
  const themeSelectEl = document.querySelector('[data-theme-select]');
  const metaThemeEl = document.querySelector('meta[name="theme-color"]');
  const swatchInputs = document.querySelectorAll('[data-theme-option]');

  function updateMetaThemeColor() {
    if (!metaThemeEl) return;
    const cssPrimary = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    if (cssPrimary) metaThemeEl.setAttribute("content", cssPrimary);
  }

  function applyThemeClass(themeClassName) {
    const body = document.body;
    availableThemes.forEach(cls => body.classList.remove(cls));
    body.classList.add(themeClassName);
    updateMetaThemeColor();
  }

  function initializeTheme() {
    const saved = localStorage.getItem(themeStorageKey) || "theme-teal";
    applyThemeClass(saved);
    if (themeSelectEl) themeSelectEl.value = saved;
    swatchInputs.forEach(input => { input.checked = (input.value === saved); });
  }

  function handleThemeChange(evt) {
    const selected = evt.target.value;
    if (!availableThemes.includes(selected)) return;
    applyThemeClass(selected);
    localStorage.setItem(themeStorageKey, selected);
    swatchInputs.forEach(input => { input.checked = (input.value === selected); });
  }

  function handleThemeOptionChange(evt) {
    const selected = evt.target.value;
    if (!availableThemes.includes(selected)) return;
    applyThemeClass(selected);
    localStorage.setItem(themeStorageKey, selected);
    if (themeSelectEl) themeSelectEl.value = selected;
  }

  if (themeSelectEl) themeSelectEl.addEventListener("change", handleThemeChange);
  swatchInputs.forEach(input => input.addEventListener("change", handleThemeOptionChange));
  initializeTheme();
});

updateDisplays();



