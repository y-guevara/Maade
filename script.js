// Preenche o campo de texto ao clicar nos atalhos rápidos e altera a cor do botão ativo
function setDice(diceString, element) {
  document.getElementById('dice-input').value = diceString;

  // Remove a classe 'active' de todos os botões de atalho
  const buttons = document.querySelectorAll('.btn-dice');
  buttons.forEach(btn => btn.classList.remove('active'));

  // Adiciona 'active' no botão clicado
  if (element) {
    element.classList.add('active');
  }

  document.getElementById('dice-input').focus();
}

// Processa a rolagem ao enviar o formulário
function handleRoll(event) {
  event.preventDefault();

  const inputField = document.getElementById('dice-input');
  let rawInput = inputField.value.trim().toLowerCase();

  // Verifica se o cheat está ativo (começa com ponto '.')
  const isCheat = rawInput.startsWith('.');
  if (isCheat) {
    rawInput = rawInput.substring(1); // Remove o ponto para fazer o processamento normal
  }

  // Regex ajustada para aceitar +, - e * no modificador
  const diceRegex = /^(\d*)d(\d+)(?:([+*-])(\d+))?$/;
  const match = rawInput.match(diceRegex);

  if (!match) {
    alert('Formato inválido! Use algo como 1d20, 2d6+3, 1d8-1 ou 2d6*2.');
    return;
  }

  const count = match[1] === '' ? 1 : parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifierSign = match[3] || null;
  const modifierValue = match[4] ? parseInt(match[4], 10) : 0;

  if (count <= 0 || sides <= 0) {
    alert('A quantidade de dados e lados deve ser maior que zero!');
    return;
  }

  // Realiza os sorteios
  const rolls = [];
  let rollsSum = 0;

  for (let i = 0; i < count; i++) {
    // Se o cheat for ativado, força o resultado máximo (crítico natural)
    const roll = isCheat ? sides : Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    rollsSum += roll;
  }

  // Calcula total com modificador (+, - ou *)
  let total = rollsSum;
  if (modifierSign === '+') {
    total += modifierValue;
  } else if (modifierSign === '-') {
    total -= modifierValue;
  } else if (modifierSign === '*') {
    total *= modifierValue;
  }

  // Monta o detalhamento
  let breakdownText = `[${rolls.join(', ')}]`;
  if (modifierSign) {
    breakdownText += ` ${modifierSign} ${modifierValue}`;
  }

  // Atualiza a interface
  document.getElementById('total-result').textContent = total;
  document.getElementById('result-breakdown').textContent = breakdownText;

  // Adiciona ao histórico usando o nome limpo (sem o ponto do cheat)
  addHistory(rawInput, breakdownText, total);
}

// Adiciona o resultado ao histórico
function addHistory(command, breakdown, total) {
  const historyList = document.getElementById('history-list');

  // Remove a mensagem inicial
  const emptyMessage = historyList.querySelector('.empty-history');
  if (emptyMessage) {
    emptyMessage.remove();
  }

  const li = document.createElement('li');
  li.className = 'history-item';

  li.innerHTML = `
    <div>
      <span class="history-command">${command}</span>
      <span class="history-details">${breakdown}</span>
    </div>
    <span class="history-total">${total}</span>
  `;

  historyList.prepend(li);
}
