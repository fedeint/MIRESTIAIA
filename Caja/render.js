/**
 * render.js — Caja
 * Stats, meseros, ranking y tabla de movimientos (2 columnas: Ingreso / Egreso)
 */

export function fmt(n) {
  return 'S/ ' + n.toFixed(2);
}

/* ── Icono profesional Lucide ── */
const iconUser = `<i data-lucide="user" style="width:40px;height:40px;color:var(--cj-orange)"></i>`;

export function render(transactions, meseros) {
  renderStats(transactions);
  renderMeseros(meseros);
  renderRanking(meseros);
  renderTransactions(transactions);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderStats(transactions) {
  const totalIn  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  document.getElementById('totalIncome').textContent  = fmt(totalIn);
  document.getElementById('totalExpense').textContent = fmt(totalOut);
  document.getElementById('totalCash').textContent    = fmt(Math.max(0, totalIn - totalOut));
}

function renderMeseros(meseros) {
  document.getElementById('meserosGrid').innerHTML = meseros.map(m => {
    const isBusy = m.status === 'busy';
    const statusLabel = isBusy ? 'No Disponible' : 'Disponible';
    const statusClass = isBusy ? 'cj-badge--red' : 'cj-badge--green';
    return `
      <div class="cj-mesero">
        <div class="cj-mesero__avatar">${iconUser}</div>
        <div class="cj-mesero__name">${m.name}</div>
        <div class="cj-mesero__table">${m.mesa}</div>
        <div style="margin-bottom: 8px;">
          <span class="cj-badge ${statusClass}">${statusLabel}</span>
        </div>
        <span class="cj-mesero__tag">${m.products} productos</span>
      </div>
    `;
  }).join('');
}

function renderRanking(meseros) {
  const medals = [
    '<i data-lucide="award" style="width:20px;height:20px;color:#f1c40f"></i>', // Oro
    '<i data-lucide="award" style="width:20px;height:20px;color:#bdc3c7"></i>', // Plata
    '<i data-lucide="award" style="width:20px;height:20px;color:#cd7f32"></i>'  // Bronce
  ];
  document.getElementById('rankingList').innerHTML = meseros.map((m, i) => `
    <div class="cj-ranking-item">
      <div class="cj-ranking-item__pos">
        ${medals[i] || i + 1}
      </div>
      <div class="cj-ranking-item__avatar">${iconUser}</div>
      <div class="cj-ranking-item__name">${m.name}</div>
      <div class="cj-ranking-item__stats">
        <div><span>Mesa</span><strong>${m.mesa.replace('Mesa ', '')}</strong></div>
        <div><span>Productos</span><strong>${m.products}</strong></div>
      </div>
    </div>
  `).join('');
}

function renderTransactions(transactions) {
  const incBody = document.getElementById('incBody');
  const expBody = document.getElementById('expBody');

  const incomes = transactions.filter(t => t.type === 'income').reverse();
  const expenses = transactions.filter(t => t.type === 'expense').reverse();

  const methodIcons = {
    'Yape': '<img src="./icon/Yape_idk9LVt308_1.svg" style="width:14px;height:14px;vertical-align:middle">',
    'Plin': '<img src="./icon/plin-seeklogo.png" style="width:14px;height:14px;vertical-align:middle">',
    'Efectivo': '<i data-lucide="banknote" style="width:14px;height:14px;color:#f1c40f"></i>',
    'Tarjeta': '<img src="./icon/tarjeta.png" style="width:14px;height:14px;vertical-align:middle">'
  };

  if (incomes.length === 0) {
    incBody.innerHTML = '<tr><td colspan="3" class="cj-table__empty">No hay ingresos</td></tr>';
  } else {
    incBody.innerHTML = incomes.map(t => {
      const time = t.time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
      const methodIcon = methodIcons[t.method] || '';
      return `
        <tr>
          <td style="width:80px; font-weight:600; color:var(--color-text-muted)">${time}</td>
          <td>
            <div style="font-weight:700; color:var(--color-text); margin-bottom:2px">${t.concept}</div>
            <div class="cj-method-badge">
              ${methodIcon} ${t.method} ${t.note ? ' · ' + t.note : ''}
            </div>
          </td>
          <td style="text-align:right">
            <div class="cj-tx-amount cj-tx-income">+ ${fmt(t.amount)}</div>
          </td>
        </tr>`;
    }).join('');
  }

  if (expenses.length === 0) {
    expBody.innerHTML = '<tr><td colspan="3" class="cj-table__empty">No hay egresos</td></tr>';
  } else {
    expBody.innerHTML = expenses.map(t => {
      const time = t.time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
      return `
        <tr>
          <td style="width:80px; font-weight:600; color:var(--color-text-muted)">${time}</td>
          <td>
            <div style="font-weight:700; color:var(--color-text); margin-bottom:2px">${t.concept}</div>
            ${t.note ? '<div style="font-size:11px; color:var(--color-text-muted)">' + t.note + '</div>' : ''}
          </td>
          <td style="text-align:right">
            <div class="cj-tx-amount cj-tx-expense">- ${fmt(t.amount)}</div>
          </td>
        </tr>`;
    }).join('');
  }
}
