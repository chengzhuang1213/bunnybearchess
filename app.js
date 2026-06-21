const totalCells = 40;
const desktopCols = 8;
const mobileCols = 5;
const maxRounds = 40;

const pieces = [
  { name: "小白", value: 100, level: 10, image: "assets/pieces/01-xiaobai.png" },
  { name: "小鸡毛", value: 90, level: 9, image: "assets/pieces/02-xiaojimao.png" },
  { name: "库洛米", value: 80, level: 8, image: "assets/pieces/03-kuromi.png" },
  { name: "玉桂狗", value: 70, level: 7, image: "assets/pieces/04-cinnamoroll.png" },
  { name: "美乐蒂", value: 60, level: 6, image: "assets/pieces/05-melody.png" },
  { name: "布丁", value: 50, level: 5, image: "assets/pieces/06-pudding.png" },
  { name: "Kitty猫", value: 40, level: 4, image: "assets/pieces/07-kitty.png" },
  { name: "一二", value: 30, level: 3, image: "assets/pieces/08-yier.png" },
  { name: "布布", value: 20, level: 2, image: "assets/pieces/09-bubu.png" },
  { name: "哆啦A梦", value: 10, level: 1, image: "assets/pieces/10-doraemon.png" }
];

const avatars = [
  "assets/avatars/avatar-01.png",
  "assets/avatars/avatar-02.png",
  "assets/avatars/avatar-03.png",
  "assets/avatars/avatar-04.png",
  "assets/avatars/avatar-05.png",
  "assets/avatars/avatar-06.png",
  "assets/avatars/avatar-07.png",
  "assets/avatars/avatar-08.png",
  "assets/avatars/avatar-09.png",
  "assets/avatars/avatar-10.png",
  "assets/avatars/avatar-11.png"
];

const defaultNames = {
  A: "超可爱兔",
  B: "熊王"
};

const aiNames = {
  normal: "AI熊王",
  hell1: "地狱AI Lv1",
  hell2: "地狱AI Lv2"
};

const defeatTexts = [
  "被打的落花流水",
  "已俯首称臣",
  "被打的屁滚尿流",
  "被打到怀疑人生",
  "输得明明白白",
  "被安排得服服帖帖",
  "被打得找不着北",
  "被一套带走",
  "输到只想重开",
  "被打得毫无还手之力",
  "被教育得很彻底",
  "被打到沉默不语",
  "败得干干净净"
];

const statsStorageKey = "blindBoxChessStats";

const state = {
  board: [],
  currentPlayer: "A",
  round: 1,
  selected: null,
  scores: { A: 0, B: 0 },
  camps: { A: "red", B: "blue" },
  gameOver: false,
  gameMode: "twoPlayer",
  aiMode: null,
  aiThinking: false,
  aiTimer: null,
  pendingResultWinner: null,
  pendingResultRecorded: false,
  history: [],
  players: {
    A: { name: defaultNames.A, avatar: avatars[0] },
    B: { name: defaultNames.B, avatar: avatars[1] }
  },
  setupPlayer: "A",
  setupAvatar: avatars[0]
};

const homeScreenEl = document.querySelector("#homeScreen");
const setupScreenEl = document.querySelector("#setupScreen");
const gameShellEl = document.querySelector(".game-shell");
const twoPlayerButtonEl = document.querySelector("#twoPlayerButton");
const aiButtonEl = document.querySelector("#aiButton");
const dataButtonEl = document.querySelector("#dataButton");
const rulesButtonEl = document.querySelector("#rulesButton");
const aiModePanelEl = document.querySelector("#aiModePanel");
const aiModeButtonEls = document.querySelectorAll(".ai-mode-button");
const dataPanelEl = document.querySelector("#dataPanel");
const redWinRateEl = document.querySelector("#redWinRate");
const blueWinRateEl = document.querySelector("#blueWinRate");
const statsTotalEl = document.querySelector("#statsTotal");
const homeMessageEl = document.querySelector("#homeMessage");
const setupBackButtonEl = document.querySelector("#setupBackButton");
const setupStepEl = document.querySelector("#setupStep");
const setupTitleEl = document.querySelector("#setupTitle");
const playerNameInputEl = document.querySelector("#playerNameInput");
const avatarPickerEl = document.querySelector("#avatarPicker");
const setupErrorEl = document.querySelector("#setupError");
const setupNextButtonEl = document.querySelector("#setupNextButton");
const boardEl = document.querySelector("#board");
const chainTrackEl = document.querySelector("#chainTrack");
const scoreAEl = document.querySelector("#scoreA");
const scoreBEl = document.querySelector("#scoreB");
const roundTextEl = document.querySelector("#roundText");
const turnTextEl = document.querySelector("#turnText");
const messageTextEl = document.querySelector("#messageText");
const campAEl = document.querySelector("#playerACamp");
const campBEl = document.querySelector("#playerBCamp");
const playerACardEl = document.querySelector("#playerACard");
const playerBCardEl = document.querySelector("#playerBCard");
const playerANameEl = document.querySelector("#playerAName");
const playerBNameEl = document.querySelector("#playerBName");
const playerAAvatarEl = document.querySelector("#playerAAvatar");
const playerBAvatarEl = document.querySelector("#playerBAvatar");
const playerAHiddenRosterEl = document.querySelector("#playerAHiddenRoster");
const playerBHiddenRosterEl = document.querySelector("#playerBHiddenRoster");
const undoButtonEl = document.querySelector("#undoButton");
const restartButtonEl = document.querySelector("#restartButton");
const homeButtonEl = document.querySelector("#homeButton");
const resultModalEl = document.querySelector("#resultModal");
const resultTitleEl = document.querySelector("#resultTitle");
const resultLineEl = document.querySelector("#resultLine");
const resultCloseButtonEl = document.querySelector("#resultCloseButton");
const rulesModalEl = document.querySelector("#rulesModal");
const rulesCloseButtonEl = document.querySelector("#rulesCloseButton");

function makeDeck() {
  const deck = [];
  for (const color of ["red", "blue"]) {
    for (const piece of pieces) {
      for (let copy = 0; copy < 2; copy += 1) {
        deck.push({
          id: `${color}-${piece.name}-${copy}`,
          color,
          name: piece.name,
          rank: pieces.findIndex((item) => item.name === piece.name),
          value: piece.value,
          level: piece.level,
          image: piece.image,
          revealed: false
        });
      }
    }
  }
  return shuffle(deck);
}

function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function startGame(options = {}) {
  if (state.aiTimer) {
    window.clearTimeout(state.aiTimer);
    state.aiTimer = null;
  }
  state.gameMode = options.gameMode || state.gameMode || "twoPlayer";
  state.aiMode = Object.prototype.hasOwnProperty.call(options, "aiMode") ? options.aiMode : state.aiMode;
  state.aiThinking = false;
  const deck = makeDeck();
  state.board = deck.map((piece, index) => ({
    piece
  }));
  state.currentPlayer = "A";
  state.round = 1;
  state.selected = null;
  state.scores = { A: 0, B: 0 };
  state.camps = { A: "red", B: "blue" };
  state.gameOver = false;
  state.history = [];
  document.body.classList.remove("game-over");
  closeResultModal();
  state.pendingResultWinner = null;
  state.pendingResultRecorded = false;
  const advantageMessage = applyAiOpeningAdvantage();
  setMessage(advantageMessage || "请选择一个木箱翻开。");
  render();
}

function createSnapshot() {
  return {
    board: state.board.map((cell) => ({
      piece: cell.piece ? { ...cell.piece } : null
    })),
    currentPlayer: state.currentPlayer,
    round: state.round,
    selected: null,
    scores: { ...state.scores },
    camps: { ...state.camps },
    gameOver: state.gameOver,
    message: messageTextEl.textContent
  };
}

function saveHistory() {
  state.history.push(createSnapshot());
}

function undoLastAction() {
  if (state.aiTimer) {
    window.clearTimeout(state.aiTimer);
    state.aiTimer = null;
  }
  state.aiThinking = false;
  let snapshot = state.history.pop();
  if (state.gameMode === "ai" && snapshot?.currentPlayer === "B" && state.history.length > 0) {
    snapshot = state.history.pop();
  }
  if (!snapshot) {
    setMessage("现在还没有可以悔棋的步骤。");
    render();
    return;
  }

  state.board = snapshot.board;
  state.currentPlayer = snapshot.currentPlayer;
  state.round = snapshot.round;
  state.selected = snapshot.selected;
  state.scores = snapshot.scores;
  state.camps = snapshot.camps;
  state.gameOver = snapshot.gameOver;
  document.body.classList.toggle("game-over", state.gameOver);
  closeResultModal();
  setMessage(`已悔棋，回到${campName(state.camps[state.currentPlayer])}回合。`);
  render();
}

function showScreen(screenName) {
  homeScreenEl.classList.toggle("is-hidden", screenName !== "home");
  setupScreenEl.classList.toggle("is-hidden", screenName !== "setup");
  gameShellEl.classList.toggle("is-hidden", screenName !== "game");
  if (screenName !== "game") closeResultModal();
}

function openRulesModal() {
  rulesModalEl.classList.remove("is-hidden");
}

function closeRulesModal() {
  rulesModalEl.classList.add("is-hidden");
}

function returnHome() {
  if (state.aiTimer) {
    window.clearTimeout(state.aiTimer);
    state.aiTimer = null;
  }
  state.aiThinking = false;
  state.selected = null;
  closeResultModal();
  aiModePanelEl.classList.add("is-hidden");
  dataPanelEl.classList.add("is-hidden");
  homeMessageEl.textContent = "请选择对战模式";
  showScreen("home");
}

function startAiGame(aiMode) {
  state.players.A = {
    name: state.players.A.name || defaultNames.A,
    avatar: state.players.A.avatar || avatars[0]
  };
  state.players.B = {
    name: aiNames[aiMode],
    avatar: avatars[1]
  };
  startGame({ gameMode: "ai", aiMode });
  showScreen("game");
}

function openSetup(player) {
  state.setupPlayer = player;
  state.setupAvatar = state.players[player].avatar || avatars[player === "A" ? 0 : 1];
  if (player === "B" && state.setupAvatar === state.players.A.avatar) {
    state.setupAvatar = avatars.find((avatar) => avatar !== state.players.A.avatar) || avatars[0];
  }
  setupStepEl.textContent = `玩家 ${player} 设置`;
  setupTitleEl.textContent = player === "A" ? "玩家 A，起个 ID" : "玩家 B，起个 ID";
  playerNameInputEl.value = state.players[player].name || defaultNames[player];
  playerNameInputEl.placeholder = player === "A" ? "例如：兔兔队长" : "例如：熊熊高手";
  setupNextButtonEl.textContent = player === "A" ? "下一步：设置玩家 B" : "开始游戏";
  setupErrorEl.textContent = "";
  renderAvatarPicker();
  showScreen("setup");
  window.setTimeout(() => playerNameInputEl.focus(), 0);
}

function renderAvatarPicker() {
  avatarPickerEl.innerHTML = "";
  avatars.forEach((avatar, index) => {
    const isTakenByA = state.setupPlayer === "B" && state.players.A.avatar === avatar;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "avatar-option";
    button.classList.toggle("selected", state.setupAvatar === avatar);
    button.classList.toggle("disabled", isTakenByA);
    button.disabled = isTakenByA;
    button.setAttribute("aria-label", isTakenByA ? `头像 ${index + 1}，玩家 A 已选择` : `头像 ${index + 1}`);
    button.innerHTML = `<img src="${avatar}" alt="头像 ${index + 1}">`;
    button.addEventListener("click", () => {
      if (isTakenByA) return;
      state.setupAvatar = avatar;
      renderAvatarPicker();
    });
    avatarPickerEl.append(button);
  });
}

function saveSetupAndContinue() {
  const player = state.setupPlayer;
  const name = playerNameInputEl.value.trim();
  if (!name) {
    setupErrorEl.textContent = "请先输入玩家 ID";
    playerNameInputEl.focus();
    return;
  }

  state.players[player] = {
    name,
    avatar: state.setupAvatar
  };

  if (player === "A") {
    openSetup("B");
    return;
  }

  startGame({ gameMode: "twoPlayer", aiMode: null });
  showScreen("game");
}

function applyAiOpeningAdvantage() {
  if (state.gameMode !== "ai") return "";
  const bonusPieces = {
    normal: [],
    hell1: ["小白"],
    hell2: ["小白", "小鸡毛"]
  }[state.aiMode] || [];

  for (const pieceName of bonusPieces) {
    const cell = state.board.find((item) => (
      item.piece
      && item.piece.color === state.camps.B
      && item.piece.name === pieceName
      && !item.piece.revealed
    ));
    if (cell) {
      cell.piece.revealed = true;
    }
  }

  if (state.aiMode === "hell1") return "地狱一级：AI 开局自带翻开的蓝方小白。";
  if (state.aiMode === "hell2") return "地狱二级：AI 开局自带翻开的蓝方小白和小鸡毛。";
  return "人机对战开始，请选择一个木箱翻开。";
}

function renderChain() {
  chainTrackEl.innerHTML = "";
  pieces.forEach((piece, index) => {
    const group = document.createElement("span");
    group.className = "chain-piece";

    const tile = document.createElement("span");
    tile.className = "chain-image-tile";
    tile.title = `${piece.name}（${piece.value}分）`;

    const image = document.createElement("img");
    image.className = "chain-image";
    image.src = piece.image;
    image.alt = piece.name;
    tile.append(image);

    const caption = document.createElement("span");
    caption.className = "chain-caption";
    caption.textContent = piece.name;
    tile.append(caption);
    group.append(tile);

    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "➜";
    group.append(arrow);

    chainTrackEl.append(group);

    if (index === pieces.length - 1) {
      const end = document.createElement("span");
      end.className = "chain-image-tile";
      end.title = "小白（闭环目标）";
      end.innerHTML = `
        <img class="chain-image" src="${pieces[0].image}" alt="小白">
        <span class="chain-caption">小白</span>
      `;
      chainTrackEl.append(end);
    }
  });

  const loop = document.createElement("div");
  loop.className = "chain-loop";
  chainTrackEl.append(loop);
}

function render() {
  boardEl.innerHTML = "";

  state.board.forEach((cell, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cell";
    button.disabled = state.aiThinking || (state.gameMode === "ai" && state.currentPlayer === "B");
    button.dataset.index = index;
    button.setAttribute("aria-label", describeCell(cell, index));

    if (state.selected === index) {
      button.classList.add("selected");
    }

    if (state.selected !== null && isLegalDestination(state.selected, index)) {
      button.classList.add("move-target");
    }

    if (!cell.piece) {
      button.innerHTML = `<span class="empty" aria-hidden="true"></span>`;
    } else if (!cell.piece.revealed) {
      button.innerHTML = `<span class="crate" aria-hidden="true"></span>`;
    } else {
      button.innerHTML = `
        <span class="piece ${cell.piece.color}">
          <img class="piece-image" src="${cell.piece.image}" alt="${cell.piece.name}">
        </span>
        <span class="piece-name">${cell.piece.name}</span>
        <span class="piece-level">${cell.piece.level}</span>
      `;
    }

    button.addEventListener("click", () => handleCellClick(index));
    boardEl.append(button);
  });

  scoreAEl.textContent = state.scores.A;
  scoreBEl.textContent = state.scores.B;
  roundTextEl.textContent = `第 ${state.round} / ${maxRounds} 轮`;
  turnTextEl.textContent = state.gameOver ? "游戏结束" : `${campName(state.camps[state.currentPlayer])}回合`;
  turnTextEl.classList.toggle("red-turn", state.currentPlayer === "A" && !state.gameOver);
  turnTextEl.classList.toggle("blue-turn", state.currentPlayer === "B" && !state.gameOver);
  campAEl.textContent = campName(state.camps.A);
  campBEl.textContent = campName(state.camps.B);
  playerANameEl.textContent = state.players.A.name;
  playerBNameEl.textContent = state.players.B.name;
  playerAAvatarEl.src = state.players.A.avatar;
  playerBAvatarEl.src = state.players.B.avatar;
  playerAAvatarEl.alt = `${state.players.A.name} 头像`;
  playerBAvatarEl.alt = `${state.players.B.name} 头像`;
  if (playerAHiddenRosterEl) renderHiddenRoster(playerAHiddenRosterEl, state.camps.A);
  if (playerBHiddenRosterEl) renderHiddenRoster(playerBHiddenRosterEl, state.camps.B);
  undoButtonEl.disabled = state.history.length === 0;

  playerACardEl.classList.toggle("active", state.currentPlayer === "A" && !state.gameOver);
  playerBCardEl.classList.toggle("active", state.currentPlayer === "B" && !state.gameOver);
  playerACardEl.classList.toggle("red-side", state.camps.A === "red");
  playerACardEl.classList.toggle("blue-side", state.camps.A === "blue");
  playerBCardEl.classList.toggle("red-side", state.camps.B === "red");
  playerBCardEl.classList.toggle("blue-side", state.camps.B === "blue");
}

function renderHiddenRoster(container, color) {
  container.innerHTML = "";
  const counts = countUnrevealedPieces(color);

  for (const piece of pieces) {
    const chip = document.createElement("span");
    chip.className = "roster-chip";
    const count = counts[piece.name] || 0;
    chip.classList.toggle("empty-count", count === 0);
    chip.textContent = `${piece.name}x${count}`;
    container.append(chip);
  }
}

function countUnrevealedPieces(color) {
  const counts = Object.fromEntries(pieces.map((piece) => [piece.name, 0]));
  for (const cell of state.board) {
    if (cell.piece && cell.piece.color === color && !cell.piece.revealed) {
      counts[cell.piece.name] += 1;
    }
  }
  return counts;
}

function describeCell(cell, index) {
  const position = indexToPosition(index);
  if (!cell.piece) return `第 ${position.row + 1} 行第 ${position.col + 1} 列，空格`;
  if (!cell.piece.revealed) return `第 ${position.row + 1} 行第 ${position.col + 1} 列，未开启木箱`;
  return `第 ${position.row + 1} 行第 ${position.col + 1} 列，${campName(cell.piece.color)}${cell.piece.name}`;
}

function handleCellClick(index) {
  if (state.gameOver || state.aiThinking || (state.gameMode === "ai" && state.currentPlayer === "B")) return;
  const cell = state.board[index];

  if (cell.piece && !cell.piece.revealed) {
    revealCell(index);
    return;
  }

  if (state.selected !== null) {
    if (state.selected === index) {
      state.selected = null;
      setMessage("已取消选择。");
      render();
      return;
    }

    if (tryMove(state.selected, index)) {
      return;
    }
  }

  if (cell.piece && isOwnPiece(cell.piece)) {
    state.selected = index;
    setMessage(`已选择 ${cell.piece.name}，请选择相邻目标格。`);
    render();
    return;
  }

  flashInvalid(index);
  setMessage("请选择未开启木箱，或选择己方已翻开的棋子。");
}

function revealCell(index) {
  saveHistory();
  const piece = state.board[index].piece;
  piece.revealed = true;
  setMessage(`${playerLabel(state.currentPlayer)} 翻出了${campName(piece.color)}${piece.name}。`);

  finishAction();
}

function tryMove(fromIndex, toIndex) {
  const from = state.board[fromIndex];
  const to = state.board[toIndex];
  const attacker = from.piece;

  if (!attacker || !isOwnPiece(attacker)) {
    state.selected = null;
    flashInvalid(fromIndex);
    setMessage("只能移动己方已翻开的棋子。");
    render();
    return false;
  }

  if (!areAdjacent(fromIndex, toIndex)) {
    flashInvalid(toIndex);
    setMessage("棋子只能上下左右移动一格。");
    return false;
  }

  if (to.piece && !to.piece.revealed) {
    flashInvalid(toIndex);
    setMessage("不能进入未翻开的箱子格。");
    return false;
  }

  if (to.piece && isOwnPiece(to.piece)) {
    flashInvalid(toIndex);
    setMessage("不能进入己方棋子所在格。");
    return false;
  }

  if (!to.piece) {
    saveHistory();
    to.piece = attacker;
    from.piece = null;
    state.selected = null;
    setMessage(`${playerLabel(state.currentPlayer)} 移动了 ${attacker.name}。`);
    finishAction();
    return true;
  }

  if (canCapture(attacker, to.piece)) {
    saveHistory();
    const captured = to.piece;
    state.scores[state.currentPlayer] += captured.value;
    to.piece = attacker;
    from.piece = null;
    state.selected = null;
    setMessage(`${attacker.name} 吃掉 ${captured.name}，${playerLabel(state.currentPlayer)} +${captured.value} 分。`);
    finishAction();
    return true;
  }

  flashInvalid(toIndex);
  setMessage(`${attacker.name} 不能吃 ${to.piece.name}。`);
  return false;
}

function finishAction() {
  state.selected = null;

  if (state.currentPlayer === "A") {
    state.currentPlayer = "B";
  } else if (state.round >= maxRounds) {
    finishGame();
    return;
  } else {
    state.currentPlayer = "A";
    state.round += 1;
  }

  render();
  if (state.gameMode === "ai" && state.currentPlayer === "B" && !state.gameOver) {
    scheduleAiTurn();
  }
}

function scheduleAiTurn() {
  state.aiThinking = true;
  setMessage("AI 正在思考...");
  render();
  state.aiTimer = window.setTimeout(() => {
    state.aiTimer = null;
    performAiTurn();
  }, 650);
}

function performAiTurn() {
  if (state.gameOver || state.currentPlayer !== "B") {
    state.aiThinking = false;
    render();
    return;
  }

  const capture = findBestAiCapture();
  if (capture) {
    executeAiCapture(capture, "AI");
    return;
  }

  if (isHellMode()) {
    const setupMove = findBestTwoStepScoringMove();
    if (setupMove) {
      executeAiMove(setupMove, `AI 移动了 ${state.board[setupMove.fromIndex].piece.name}，准备下一步拿分。`);
      return;
    }

    const pressureHiddenIndex = pickPressureHiddenBox();
    if (pressureHiddenIndex !== null) {
      executeAiReveal(pressureHiddenIndex, "AI 正在围绕强力棋子制造吃子机会");
      return;
    }

    const fallbackMove = pickRandomAiMove();
    if (fallbackMove) {
      executeAiMove(fallbackMove, `AI 移动了 ${state.board[fallbackMove.fromIndex].piece.name}。`);
      return;
    }

    const fallbackHiddenIndex = pickRandomHiddenBox();
    if (fallbackHiddenIndex !== null) {
      executeAiReveal(fallbackHiddenIndex, "");
      return;
    }
  } else {
    const hiddenIndex = pickRandomHiddenBox();
    if (hiddenIndex !== null) {
      executeAiReveal(hiddenIndex, "");
      return;
    }

    const move = pickRandomAiMove();
    if (move) {
      executeAiMove(move, `AI 移动了 ${state.board[move.fromIndex].piece.name}。`);
      return;
    }
  }

  saveHistory();
  state.aiThinking = false;
  setMessage("AI 没有可执行动作，跳过本回合。");
  finishAction();
}

function executeAiCapture(capture, actorLabel) {
  saveHistory();
  const from = state.board[capture.fromIndex];
  const to = state.board[capture.toIndex];
  const attacker = from.piece;
  const captured = to.piece;
  state.scores.B += captured.value;
  to.piece = attacker;
  from.piece = null;
  state.aiThinking = false;
  setMessage(`${actorLabel} 用 ${attacker.name} 吃掉 ${captured.name}，+${captured.value} 分。`);
  finishAction();
}

function executeAiMove(move, message) {
  saveHistory();
  const from = state.board[move.fromIndex];
  const to = state.board[move.toIndex];
  const moved = from.piece;
  to.piece = moved;
  from.piece = null;
  state.aiThinking = false;
  setMessage(message);
  finishAction();
}

function executeAiReveal(index, suffix) {
  saveHistory();
  const piece = state.board[index].piece;
  piece.revealed = true;
  state.aiThinking = false;
  const extra = suffix ? `，${suffix}` : "";
  setMessage(`AI 翻出了${campName(piece.color)}${piece.name}${extra}。`);
  finishAction();
}

function findBestAiCapture() {
  const captures = [];
  state.board.forEach((cell, fromIndex) => {
    if (!cell.piece || !cell.piece.revealed || cell.piece.color !== state.camps.B) return;
    for (const toIndex of getAdjacentIndexes(fromIndex)) {
      const target = state.board[toIndex];
      if (
        target.piece
        && target.piece.revealed
        && target.piece.color === state.camps.A
        && canCapture(cell.piece, target.piece)
      ) {
        captures.push({ fromIndex, toIndex, value: target.piece.value });
      }
    }
  });
  captures.sort((a, b) => b.value - a.value);
  return captures[0] || null;
}

function findBestTwoStepScoringMove() {
  const moves = [];

  state.board.forEach((cell, fromIndex) => {
    if (!cell.piece || !cell.piece.revealed || cell.piece.color !== state.camps.B) return;

    for (const toIndex of getAdjacentIndexes(fromIndex)) {
      const target = state.board[toIndex];
      if (target.piece) continue;

      const futureScore = bestCaptureValueFromPosition(cell.piece, toIndex, fromIndex);
      if (futureScore > 0) {
        moves.push({
          fromIndex,
          toIndex,
          value: futureScore,
          rank: cell.piece.rank
        });
      }
    }
  });

  if (moves.length === 0) return null;
  moves.sort((a, b) => b.value - a.value || a.rank - b.rank);
  const bestValue = moves[0].value;
  const bestMoves = moves.filter((move) => move.value === bestValue);
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function bestCaptureValueFromPosition(piece, positionIndex, originalIndex) {
  let best = 0;
  for (const targetIndex of getAdjacentIndexes(positionIndex)) {
    if (targetIndex === originalIndex) continue;
    const target = state.board[targetIndex];
    if (
      target.piece
      && target.piece.revealed
      && target.piece.color === state.camps.A
      && canCapture(piece, target.piece)
    ) {
      best = Math.max(best, target.piece.value);
    }
  }
  return best;
}

function pickAiHiddenBox() {
  if (isHellMode()) {
    const pressureIndex = pickPressureHiddenBox();
    if (pressureIndex !== null) return pressureIndex;
  }
  return pickRandomHiddenBox();
}

function pickPressureHiddenBox() {
  const candidates = [];

  state.board.forEach((cell, fromIndex) => {
    if (
      !cell.piece
      || !cell.piece.revealed
      || cell.piece.color !== state.camps.B
    ) {
      return;
    }

    for (const toIndex of getAdjacentIndexes(fromIndex)) {
      const target = state.board[toIndex];
      if (target.piece && !target.piece.revealed) {
        candidates.push({
          index: toIndex,
          anchorRank: cell.piece.rank,
          anchorValue: cell.piece.value
        });
      }
    }
  });

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.anchorRank - b.anchorRank || b.anchorValue - a.anchorValue);
  const bestRank = candidates[0].anchorRank;
  const best = candidates.filter((candidate) => candidate.anchorRank === bestRank);
  return best[Math.floor(Math.random() * best.length)].index;
}

function isPressureReveal(index) {
  if (!isHellMode()) return false;
  const priorityNames = state.aiMode === "hell2" ? ["小白", "小鸡毛"] : ["小白"];
  return getAdjacentIndexes(index).some((adjacentIndex) => {
    const adjacent = state.board[adjacentIndex];
    return adjacent.piece
      && adjacent.piece.revealed
      && adjacent.piece.color === state.camps.B
      && priorityNames.includes(adjacent.piece.name);
  });
}

function isHellMode() {
  return state.gameMode === "ai" && (state.aiMode === "hell1" || state.aiMode === "hell2");
}

function pickRandomHiddenBox() {
  const hidden = state.board
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => cell.piece && !cell.piece.revealed);
  if (hidden.length === 0) return null;
  return hidden[Math.floor(Math.random() * hidden.length)].index;
}

function pickRandomAiMove() {
  const moves = [];
  state.board.forEach((cell, fromIndex) => {
    if (!cell.piece || !cell.piece.revealed || cell.piece.color !== state.camps.B) return;
    for (const toIndex of getAdjacentIndexes(fromIndex)) {
      const target = state.board[toIndex];
      if (!target.piece) {
        moves.push({ fromIndex, toIndex });
      }
    }
  });
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

function finishGame() {
  state.gameOver = true;
  document.body.classList.add("game-over");
  const winner = decideWinner();

  if (winner.reason === "score") {
    setMessage(`40轮结束。${playerLabel(winner.player)} 得分更高，获得胜利！`);
    showResultModal(winner.player);
  } else if (winner.reason === "remaining") {
    setMessage(`40轮结束且平分。${playerLabel(winner.player)} 场上剩余价值更高，获得胜利！`);
    showResultModal(winner.player);
  } else {
    setMessage("40轮结束。得分和场上剩余价值都相同，平局！");
    showDrawModal();
  }

  render();
}

function showResultModal(winner) {
  const loser = winner === "A" ? "B" : "A";
  const taunt = defeatTexts[Math.floor(Math.random() * defeatTexts.length)];
  state.pendingResultWinner = winner;
  state.pendingResultRecorded = false;
  resultTitleEl.textContent = `${playerLabel(winner)}胜利！`;
  resultLineEl.textContent = `${playerLabel(loser)}${taunt}`;
  resultModalEl.classList.remove("is-hidden");
}

function showDrawModal() {
  state.pendingResultWinner = null;
  state.pendingResultRecorded = false;
  resultTitleEl.textContent = "平局！";
  resultLineEl.textContent = "双方打得难分难解";
  resultModalEl.classList.remove("is-hidden");
}

function closeResultModal() {
  resultModalEl.classList.add("is-hidden");
}

function closeResultAndRecord() {
  if (state.gameMode === "twoPlayer" && state.pendingResultWinner && !state.pendingResultRecorded) {
    recordFinishedGame(state.pendingResultWinner);
    state.pendingResultRecorded = true;
    state.pendingResultWinner = null;
  }
  closeResultModal();
}

function readStats() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(statsStorageKey));
    return {
      redWins: Number(saved?.redWins) || 0,
      blueWins: Number(saved?.blueWins) || 0
    };
  } catch {
    return { redWins: 0, blueWins: 0 };
  }
}

function writeStats(stats) {
  window.localStorage.setItem(statsStorageKey, JSON.stringify(stats));
}

function recordFinishedGame(winner) {
  const stats = readStats();
  if (winner === "A") {
    stats.redWins += 1;
  } else if (winner === "B") {
    stats.blueWins += 1;
  }
  writeStats(stats);
  renderStats();
}

function renderStats() {
  const stats = readStats();
  const total = stats.redWins + stats.blueWins;
  const redRate = total ? Math.round((stats.redWins / total) * 100) : 0;
  const blueRate = total ? Math.round((stats.blueWins / total) * 100) : 0;
  redWinRateEl.textContent = `${redRate}%`;
  blueWinRateEl.textContent = `${blueRate}%`;
  statsTotalEl.textContent = `已统计 ${total} 局`;
}

function decideWinner() {
  if (state.scores.A > state.scores.B) return { player: "A", reason: "score" };
  if (state.scores.B > state.scores.A) return { player: "B", reason: "score" };

  const remainingA = remainingValue("A");
  const remainingB = remainingValue("B");
  if (remainingA > remainingB) return { player: "A", reason: "remaining" };
  if (remainingB > remainingA) return { player: "B", reason: "remaining" };
  return { player: null, reason: "draw" };
}

function remainingValue(player) {
  const camp = state.camps[player];
  if (!camp) return 0;
  return state.board.reduce((total, cell) => {
    if (cell.piece && cell.piece.color === camp) {
      return total + cell.piece.value;
    }
    return total;
  }, 0);
}

function canCapture(attacker, defender) {
  if (!defender || !defender.revealed) return false;
  const doraemon = pieces.length - 1;
  const xiaobai = 0;
  if (attacker.rank === doraemon && defender.rank === xiaobai) return true;
  if (attacker.rank === xiaobai && defender.rank === doraemon) return false;
  return attacker.rank <= defender.rank;
}

function isOwnPiece(piece) {
  const camp = state.camps[state.currentPlayer];
  return Boolean(piece && piece.revealed && camp && piece.color === camp);
}

function isLegalDestination(fromIndex, toIndex) {
  if (fromIndex === toIndex || !areAdjacent(fromIndex, toIndex)) return false;
  const from = state.board[fromIndex];
  const to = state.board[toIndex];
  if (!from.piece || !isOwnPiece(from.piece)) return false;
  if (to.piece && !to.piece.revealed) return false;
  if (to.piece && isOwnPiece(to.piece)) return false;
  return !to.piece || canCapture(from.piece, to.piece);
}

function areAdjacent(a, b) {
  const from = indexToPosition(a);
  const to = indexToPosition(b);
  return Math.abs(from.row - to.row) + Math.abs(from.col - to.col) === 1;
}

function getAdjacentIndexes(index) {
  const cell = indexToPosition(index);
  const candidates = [
    [cell.row - 1, cell.col],
    [cell.row + 1, cell.col],
    [cell.row, cell.col - 1],
    [cell.row, cell.col + 1]
  ];
  return candidates
    .filter(([row, col]) => row >= 0 && row < boardRows() && col >= 0 && col < boardCols())
    .map(([row, col]) => getIndex(row, col));
}

function getIndex(row, col) {
  return row * boardCols() + col;
}

function indexToPosition(index) {
  const cols = boardCols();
  return {
    row: Math.floor(index / cols),
    col: index % cols
  };
}

function boardCols() {
  return window.matchMedia("(max-width: 760px)").matches ? mobileCols : desktopCols;
}

function boardRows() {
  return totalCells / boardCols();
}

function campName(color) {
  if (color === "red") return "红方";
  if (color === "blue") return "蓝方";
  return "未确定";
}

function playerLabel(player) {
  return state.players[player]?.name || `玩家 ${player}`;
}

function setMessage(message) {
  messageTextEl.textContent = message;
}

function flashInvalid(index) {
  const cell = boardEl.querySelector(`[data-index="${index}"]`);
  if (!cell) return;
  cell.classList.remove("invalid");
  window.requestAnimationFrame(() => {
    cell.classList.add("invalid");
  });
}

restartButtonEl.addEventListener("click", () => startGame());
undoButtonEl.addEventListener("click", undoLastAction);
homeButtonEl.addEventListener("click", returnHome);
resultCloseButtonEl.addEventListener("click", closeResultAndRecord);
twoPlayerButtonEl.addEventListener("click", () => {
  aiModePanelEl.classList.add("is-hidden");
  dataPanelEl.classList.add("is-hidden");
  openSetup("A");
});
aiButtonEl.addEventListener("click", () => {
  aiModePanelEl.classList.toggle("is-hidden");
  dataPanelEl.classList.add("is-hidden");
  homeMessageEl.textContent = "选择人机对战难度";
  aiButtonEl.classList.add("pulse");
  window.setTimeout(() => aiButtonEl.classList.remove("pulse"), 420);
});
dataButtonEl.addEventListener("click", () => {
  aiModePanelEl.classList.add("is-hidden");
  dataPanelEl.classList.toggle("is-hidden");
  renderStats();
  homeMessageEl.textContent = "对战数据";
});
rulesButtonEl.addEventListener("click", () => {
  aiModePanelEl.classList.add("is-hidden");
  dataPanelEl.classList.add("is-hidden");
  homeMessageEl.textContent = "正在查看规则说明";
  openRulesModal();
});
rulesCloseButtonEl.addEventListener("click", closeRulesModal);
rulesModalEl.addEventListener("click", (event) => {
  if (event.target === rulesModalEl) closeRulesModal();
});
aiModeButtonEls.forEach((button) => {
  button.addEventListener("click", () => startAiGame(button.dataset.aiMode));
});
setupBackButtonEl.addEventListener("click", () => showScreen("home"));
setupNextButtonEl.addEventListener("click", saveSetupAndContinue);
playerNameInputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saveSetupAndContinue();
  }
});

renderChain();
renderStats();
showScreen("home");
