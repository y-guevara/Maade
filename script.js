
function setDice(diceString, element) {
  document.getElementById('dice-input').value = diceString;

  document.querySelectorAll('.btn-dice').forEach(btn =>
    btn.classList.remove('active')
  );

  if (element) element.classList.add('active');

  document.getElementById('dice-input').focus();
}

function handleRoll(event) {
  event.preventDefault();

  const inputField = document.getElementById('dice-input');
  let rawInput = inputField.value.trim().toLowerCase();

  const isCheat = rawInput.startsWith('.');
  if (isCheat) rawInput = rawInput.substring(1);

  const expression = rawInput.replace(/\s+/g, '');

  // Separa os grupos de dados e o modificador final.
  const match = expression.match(
    /^(.+?)(?:([+-])(\d+)|\*(\d+))?$/
  );

  if (!match) {
    alert('Formato inválido!');
    return;
  }

  const dicePart = match[1];
  const modifierSign = match[2] || (match[4] ? '*' : null);
  const modifierValue = Number(match[3] || match[4] || 0);

  const groups = dicePart.split('+');

  if (!groups.length) {
    alert('Informe pelo menos um grupo de dados.');
    return;
  }

  const allRolls = [];
  const groupDetails = [];
  let total = 0;

  for (const group of groups) {
    const diceMatch = group.match(/^(\d+)?(#)?d(\d+)$/);

    if (!diceMatch) {
      alert('Grupo inválido: ' + group);
      return;
    }

    const count = Number(diceMatch[1] || 1);
    const keepHighest = diceMatch[2] === '#';
    const sides = Number(diceMatch[3]);

    if (count <= 0 || sides <= 0 || count > 100) {
      alert('Quantidade ou lados inválidos. Máximo de 100 dados por grupo.');
      return;
    }

    if (keepHighest && count < 2) {
      alert('Use pelo menos dois dados para escolher o maior.');
      return;
    }

    const rolls = [];

    for (let i = 0; i < count; i++) {
      const roll = isCheat
        ? sides
        : Math.floor(Math.random() * sides) + 1;

      rolls.push(roll);
    }

    const groupTotal = keepHighest
      ? Math.max(...rolls)
      : rolls.reduce((sum, value) => sum + value, 0);

    total += groupTotal;
    allRolls.push(...rolls);

    groupDetails.push(
      `${group}: [${rolls.join(', ')}]` +
      (keepHighest ? ` → maior: ${groupTotal}` : '')
    );
  }

  if (modifierSign === '+') total += modifierValue;
  if (modifierSign === '-') total -= modifierValue;
  if (modifierSign === '*') total *= modifierValue;

  const breakdownText = groupDetails.join(' | ') +
    (modifierSign ? ` ${modifierSign} ${modifierValue}` : '');

  document.getElementById('total-result').textContent = total;
  document.getElementById('result-breakdown').textContent = breakdownText;

  addHistory(rawInput, breakdownText, total);

  // Evento preparado para compartilhar a rolagem com a sala.
  // Na próxima etapa, vamos conectar isso ao chat em tempo real.
  document.dispatchEvent(new CustomEvent('maade:roll', {
    detail: {
      command: rawInput,
      breakdown: breakdownText,
      total: total
    }
  }));
}

function addHistory(command, breakdown, total) {
  const historyList = document.getElementById('history-list');

  const emptyMessage = historyList.querySelector('.empty-history');
  if (emptyMessage) emptyMessage.remove();

  const li = document.createElement('li');
  li.className = 'history-item';

  const details = document.createElement('div');

  const commandSpan = document.createElement('span');
  commandSpan.className = 'history-command';
  commandSpan.textContent = command;

  const detailsSpan = document.createElement('span');
  detailsSpan.className = 'history-details';
  detailsSpan.textContent = breakdown;

  const totalSpan = document.createElement('span');
  totalSpan.className = 'history-total';
  totalSpan.textContent = total;

  details.append(commandSpan, detailsSpan);
  li.append(details, totalSpan);

  historyList.prepend(li);
}
