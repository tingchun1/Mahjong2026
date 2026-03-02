let gameData = JSON.parse(localStorage.getItem('gameMoneyLog_V5')) || [];
const playerIds = ['p1-name', 'p2-name', 'p3-name', 'p4-name'];

window.onload = () => {
  const savedNames = JSON.parse(localStorage.getItem('gamePlayerNames_V5'));
  if (savedNames) savedNames.forEach((n, i) => (document.getElementById(playerIds[i]).value = n));
  render();
};

document.querySelectorAll('.name-edit').forEach((el) => {
  el.onchange = () => {
    const names = playerIds.map((id) => document.getElementById(id).value);
    localStorage.setItem('gamePlayerNames_V5', JSON.stringify(names));
    render();
  };
});

function liveCalc() {
  const base = parseInt(document.getElementById('base-money').value) || 0;
  const point = parseInt(document.getElementById('point-money').value) || 0;
  const currentPoints = [1, 2, 3, 4].map((i) => {
    let val = document.getElementById('i' + i).value.trim();
    return parseInt(val.replace('－', '-')) || 0;
  });

  let tempMoney = calculateMoney(currentPoints, base, point);
  let totals = [0, 0, 0, 0];
  gameData.forEach((round) => round.forEach((s, i) => (totals[i] += s)));
  tempMoney.forEach((m, i) => (totals[i] += m));

  totals.forEach((t, i) => {
    const el = document.getElementById(`p${i + 1}-total`);
    el.innerText = t;
    el.className = `big-score ${t < 0 ? 'red' : t > 0 ? 'green' : ''}`;
  });
}

function calculateMoney(points, base, point) {
  let money = points.map((p) => p * point);
  const winners = points.filter((p) => p > 0);
  const losers = points.filter((p) => p < 0);

  if (winners.length === 1) {
    const winIdx = points.findIndex((p) => p > 0);
    money[winIdx] += losers.length * base;
    points.forEach((p, i) => {
      if (p < 0) money[i] -= base;
    });
  } else if (losers.length === 1) {
    const loseIdx = points.findIndex((p) => p < 0);
    money[loseIdx] -= winners.length * base;
    points.forEach((p, i) => {
      if (p > 0) money[i] += base;
    });
  } else {
    points.forEach((p, i) => {
      if (p > 0) money[i] += base;
      if (p < 0) money[i] -= base;
    });
  }
  return money;
}

// 紀錄此回合 (已拔除確認視窗)
function commitRound() {
  const base = parseInt(document.getElementById('base-money').value) || 0;
  const point = parseInt(document.getElementById('point-money').value) || 0;
  const points = [1, 2, 3, 4].map((i) => {
    let val = document.getElementById('i' + i).value.trim();
    return parseInt(val.replace('－', '-')) || 0;
  });

  const money = calculateMoney(points, base, point);
  const sum = money.reduce((a, b) => a + b, 0);

  if (sum !== 0 && points.some((p) => p !== 0)) {
    alert(`金額不平衡！請檢查台數。`);
    return;
  }

  if (points.every((p) => p === 0)) return;

  gameData.unshift(money);
  localStorage.setItem('gameMoneyLog_V5', JSON.stringify(gameData));
  clearInputs();
}

function clearInputs() {
  [1, 2, 3, 4].forEach((i) => (document.getElementById('i' + i).value = ''));
  render();
}

function render() {
  const container = document.getElementById('log-container');
  container.innerHTML = '';
  let totals = [0, 0, 0, 0];

  gameData.forEach((round, idx) => {
    const row = document.createElement('div');
    row.className = 'log-row';
    row.innerHTML =
      `<span onclick="deleteRound(${idx})" style="color:#ff3b30; font-weight:bold; cursor:pointer;">×</span>
                     <span>${gameData.length - idx}</span>` +
      round
        .map((s) => `<span class="${s < 0 ? 'red' : s > 0 ? 'green' : ''}">${s}</span>`)
        .join('');
    container.appendChild(row);
    round.forEach((s, i) => (totals[i] += s));
  });

  totals.forEach((t, i) => {
    const el = document.getElementById(`p${i + 1}-total`);
    el.innerText = t;
    el.className = `big-score ${t < 0 ? 'red' : t > 0 ? 'green' : ''}`;
  });

  document.getElementById('checksum-display').innerText = `總和校驗: ${totals.reduce(
    (a, b) => a + b,
    0
  )}`;
}

function deleteRound(idx) {
  // 刪除單局維持確認，防止誤觸
  if (confirm('刪除此局？')) {
    gameData.splice(idx, 1);
    localStorage.setItem('gameMoneyLog_V5', JSON.stringify(gameData));
    render();
  }
}

function copyResults() {
  const names = playerIds.map((id) => document.getElementById(id).value);
  const totals = [1, 2, 3, 4].map((i) => document.getElementById(`p${i}-total`).innerText);
  const text = `【統計結算】\n${names[0]}: ${totals[0]}\n${names[1]}: ${totals[1]}\n${names[2]}: ${totals[2]}\n${names[3]}: ${totals[3]}`;
  navigator.clipboard.writeText(text);
  alert('結算已複製！');
}

// 清空所有紀錄 (已拔除確認視窗)
function resetGame() {
  gameData = [];
  localStorage.removeItem('gameMoneyLog_V5');
  render();
}
