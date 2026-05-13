/**
 * Calculator App
 */

export async function launch(ctx, options = {}) {
  const { windowManager } = ctx;

  let input = "0";
  let firstNumber = null;
  let operation = null;
  let isIntermediate = false;
  let hasResult = false;

  const container = document.createElement('div');
  container.className = 'calculator-container';
  container.style.cssText = `
    height: 100%;
    background: var(--bg-surface);
    display: flex;
    flex-direction: column;
    color: var(--text-primary);
    font-family: var(--font-main);
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    overflow: hidden;
  `;

  const output = document.createElement('div');
  output.style.cssText = `
    padding: 30px 20px;
    background: var(--bg-input);
    text-align: right;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 4px;
    min-height: 120px;
  `;

  const calculationDisplay = document.createElement('div');
  calculationDisplay.style.cssText = `
    font-size: 14px;
    color: var(--text-tertiary);
    height: 20px;
  `;

  const inputDisplay = document.createElement('div');
  inputDisplay.style.cssText = `
    font-size: 36px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
  `;
  inputDisplay.textContent = "0";

  output.appendChild(calculationDisplay);
  output.appendChild(inputDisplay);
  container.appendChild(output);

  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 1px;
    background: var(--border);
    flex: 1;
  `;
  container.appendChild(grid);

  const buttons = [
    { label: 'C', action: 'reset', type: 'special' },
    { label: '+/-', action: 'negate', type: 'special' },
    { label: '%', action: 'percent', type: 'special' },
    { label: '÷', action: 'op', value: '÷', type: 'op' },
    { label: '7', action: 'num', value: '7' },
    { label: '8', action: 'num', value: '8' },
    { label: '9', action: 'num', value: '9' },
    { label: '×', action: 'op', value: '×', type: 'op' },
    { label: '4', action: 'num', value: '4' },
    { label: '5', action: 'num', value: '5' },
    { label: '6', action: 'num', value: '6' },
    { label: '-', action: 'op', value: '-', type: 'op' },
    { label: '1', action: 'num', value: '1' },
    { label: '2', action: 'num', value: '2' },
    { label: '3', action: 'num', value: '3' },
    { label: '+', action: 'op', value: '+', type: 'op' },
    { label: '0', action: 'num', value: '0', span: 2 },
    { label: '.', action: 'num', value: '.' },
    { label: '=', action: 'calc', type: 'op' }
  ];

  const updateDisplay = () => {
    inputDisplay.textContent = input || (firstNumber !== null ? firstNumber.toString() : "0");
    if (operation) {
      calculationDisplay.textContent = `${firstNumber} ${operation} ${hasResult ? '' : ''}`;
    } else {
      calculationDisplay.textContent = '';
    }
  };

  const calculate = (intermediate = false) => {
    if (firstNumber !== null && input !== null) {
      const a = firstNumber;
      const b = parseFloat(input);
      let result = 0;
      switch (operation) {
        case '×': result = a * b; break;
        case '÷': result = a / b; break;
        case '+': result = a + b; break;
        case '-': result = a - b; break;
      }
      input = result.toString();
      firstNumber = result;
      hasResult = true;
    }
    isIntermediate = intermediate;
    updateDisplay();
  };

  const handleAction = (btn) => {
    if (btn.action === 'num') {
      if (hasResult) {
        input = btn.value === '.' ? '0.' : btn.value;
        hasResult = false;
      } else if (input === "0" && btn.value !== '.') {
        input = btn.value;
      } else if (btn.value === '.' && input.includes('.')) {
        return;
      } else {
        input += btn.value;
      }
    } else if (btn.action === 'op') {
      if (operation && !hasResult) {
        calculate(true);
      }
      firstNumber = parseFloat(input);
      operation = btn.value;
      input = "0";
      hasResult = false;
    } else if (btn.action === 'calc') {
      calculate();
      operation = null;
    } else if (btn.action === 'reset') {
      input = "0";
      firstNumber = null;
      operation = null;
      hasResult = false;
    } else if (btn.action === 'negate') {
      input = (parseFloat(input) * -1).toString();
    } else if (btn.action === 'percent') {
      input = (parseFloat(input) / 100).toString();
    }
    updateDisplay();
  };

  buttons.forEach(btn => {
    const b = document.createElement('button');
    b.textContent = btn.label;
    b.style.cssText = `
      border: none;
      background: ${btn.type === 'op' ? 'var(--accent)' : btn.type === 'special' ? 'var(--bg-surface-active)' : 'var(--bg-surface)'};
      color: ${btn.type === 'op' ? 'white' : 'var(--text-primary)'};
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.1s;
      grid-column: span ${btn.span || 1};
    `;
    b.onmouseover = () => { b.style.filter = 'brightness(1.2)'; };
    b.onmouseout = () => { b.style.filter = 'none'; };
    b.onclick = () => handleAction(btn);
    grid.appendChild(b);
  });

  const win = windowManager.createWindow({
    id: 'calculator',
    title: 'Calculator',
    icon: 'calculator,🧮',
    width: 320,
    height: 480,
    content: container
  });

  // Keyboard support
  const onKeyDown = (e) => {
    if (!win.isActive) return;
    if (e.key >= '0' && e.key <= '9') handleAction({ action: 'num', value: e.key });
    if (e.key === '.') handleAction({ action: 'num', value: '.' });
    if (e.key === 'Enter' || e.key === '=') handleAction({ action: 'calc' });
    if (e.key === '+') handleAction({ action: 'op', value: '+' });
    if (e.key === '-') handleAction({ action: 'op', value: '-' });
    if (e.key === '*') handleAction({ action: 'op', value: '×' });
    if (e.key === '/') handleAction({ action: 'op', value: '÷' });
    if (e.key === 'Escape') handleAction({ action: 'reset' });
    if (e.key === 'Backspace') {
      input = input.length > 1 ? input.slice(0, -1) : "0";
      updateDisplay();
    }
  };

  document.addEventListener('keydown', onKeyDown);
  win.options.onClose = () => document.removeEventListener('keydown', onKeyDown);
}
