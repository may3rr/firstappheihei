// 存储键名定义
const STORAGE_KEYS = {
  PLAYERS: 'billiards_players',
  MATCHES: 'billiards_matches'
};

// 默认玩家数据
const DEFAULT_PLAYERS = [
  {
    id: 'p1',
    name: '好啵',
    avatar: '好啵.jpg'
  },
  {
    id: 'p2',
    name: '血染',
    avatar: '血染.jpg'
  },
  {
    id: 'p3',
    name: '张峰',
    avatar: '张峰.jpg'
  },
  {
    id: 'p4',
    name: '肚腩',
    avatar: '肚腩.jpg'
  },
  {
    id: 'p5',
    name: '微薄',
    avatar: '微薄.jpg'
  }
];

// 存储管理类
class StorageManager {
  static save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Storage save error:', error);
      return false;
    }
  }

  static get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }
}

// 日期显示类
class DateDisplay {
  constructor(element) {
    this.element = element;
  }

  update() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    this.element.textContent = dateStr;
  }
}

// 玩家选择类
class PlayerSelector {
  constructor(element, players, onSelect) {
    this.element = element;
    this.players = players;
    this.selectedPlayer = null;
    this.onSelect = onSelect;
    this.render();
    this.bindEvents();
  }

  render() {
    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = this.selectedPlayer ? 
      `./assets/${this.selectedPlayer.avatar}` : 
      './assets/default-avatar.svg';
    
    // 处理图片加载错误
    avatar.onerror = () => {
      avatar.src = './assets/default-avatar.svg';
    };

    const name = document.createElement('div');
    name.className = 'player-name';
    name.textContent = this.selectedPlayer ? 
      this.selectedPlayer.name : 
      '点击选择选手';

    this.element.innerHTML = '';
    this.element.appendChild(avatar);
    this.element.appendChild(name);
  }

  showPlayerSelection() {
    // 创建选手选择弹窗
    const modal = document.createElement('div');
    modal.className = 'player-selection-modal';
    modal.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 20px;
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      animation: slideUp 0.3s ease-out;
    `;

    const playerList = document.createElement('div');
    playerList.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 16px;
      max-height: 60vh;
      overflow-y: auto;
      padding: 10px 0;
    `;

    this.players.forEach(player => {
      const playerItem = document.createElement('div');
      playerItem.style.cssText = `
        text-align: center;
        padding: 10px;
        cursor: pointer;
      `;

      const avatar = document.createElement('img');
      avatar.src = `./assets/${player.avatar}`;
      avatar.className = 'avatar';
      avatar.style.width = '60px';
      avatar.style.height = '60px';
      avatar.onerror = () => {
        avatar.src = './assets/default-avatar.svg';
      };

      const name = document.createElement('div');
      name.textContent = player.name;
      name.style.marginTop = '8px';

      playerItem.appendChild(avatar);
      playerItem.appendChild(name);

      playerItem.addEventListener('click', () => {
        this.selectedPlayer = player;
        this.render();
        if (this.onSelect) {
          this.onSelect(player);
        }
        document.body.removeChild(modal);
      });

      playerList.appendChild(playerItem);
    });

    modal.appendChild(playerList);
    document.body.appendChild(modal);

    // 点击空白处关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  bindEvents() {
    this.element.addEventListener('click', () => {
      this.showPlayerSelection();
    });
  }
}

// 比赛记录类
class MatchRecorder {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
  }

  recordMatch(winner) {
    const match = {
      id: `m${Date.now()}`,
      date: new Date().toISOString(),
      player1: this.player1.id,
      player2: this.player2.id,
      winner: winner.id
    };

    const matches = StorageManager.get(STORAGE_KEYS.MATCHES) || [];
    matches.push(match);
    StorageManager.save(STORAGE_KEYS.MATCHES, matches);
    return match;
  }
}

// 统计管理类
class StatsManager {
  static getTodayMatches() {
    const matches = StorageManager.get(STORAGE_KEYS.MATCHES) || [];
    const today = new Date().toISOString().split('T')[0];
    return matches.filter(match => match.date.startsWith(today));
  }

  static getAllMatches() {
    return StorageManager.get(STORAGE_KEYS.MATCHES) || [];
  }

  static getPlayerStats(playerId, matches) {
    const playerMatches = matches.filter(match => 
      match.player1 === playerId || match.player2 === playerId
    );
    
    const wins = playerMatches.filter(match => match.winner === playerId).length;
    const total = playerMatches.length;
    const rate = total > 0 ? (wins / total * 100).toFixed(1) : '0.0';
    
    return {
      matches: total,
      wins,
      rate
    };
  }

  static getWorstPlayer(matches) {
    const players = StorageManager.get(STORAGE_KEYS.PLAYERS) || [];
    if (matches.length === 0 || players.length === 0) return null;

    const playerStats = players.map(player => {
      const stats = this.getPlayerStats(player.id, matches);
      return {
        ...player,
        ...stats
      };
    }).filter(player => player.matches > 0);

    if (playerStats.length === 0) return null;

    return playerStats.reduce((worst, current) => {
      if (parseFloat(current.rate) < parseFloat(worst.rate)) {
        return current;
      }
      return worst;
    });
  }

  static getAllPlayersStats(matches) {
    const players = StorageManager.get(STORAGE_KEYS.PLAYERS) || [];
    return players.map(player => {
      const stats = this.getPlayerStats(player.id, matches);
      return {
        ...player,
        ...stats
      };
    }).sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));
  }
}

// 页面管理类
class PageManager {
  constructor() {
    this.pages = document.querySelectorAll('.page');
    this.navItems = document.querySelectorAll('.nav-item');
    this.currentPage = 'match';
    this.bindEvents();
  }

  switchPage(pageName) {
    this.pages.forEach(page => {
      page.classList.remove('active');
      if (page.classList.contains(`${pageName}-page`)) {
        page.classList.add('active');
      }
    });

    this.navItems.forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === pageName) {
        item.classList.add('active');
      }
    });

    this.currentPage = pageName;
  }

  bindEvents() {
    this.navItems.forEach(item => {
      item.addEventListener('click', () => {
        this.switchPage(item.dataset.page);
      });
    });
  }
}

// 通告栏管理类
class BannerManager {
  constructor(element) {
    this.container = element.parentElement;
    this.wrapper = element;
    this.messages = [];
  }

  setMessage(message) {
    if (!message) {
      this.container.style.display = 'none';
      return;
    }

    this.container.style.display = 'block';
    this.wrapper.textContent = message;
    
    // 重置动画
    this.wrapper.style.animation = 'none';
    this.wrapper.offsetHeight; // 触发重排
    this.wrapper.style.animation = 'scrollBanner 20s linear infinite';
  }
}

// 应用主类
class App {
  constructor() {
    this.initializeStorage();
    this.initializeUI();
    this.bindEvents();
    this.updateStats();
  }

  initializeStorage() {
    if (!StorageManager.get(STORAGE_KEYS.PLAYERS)) {
      StorageManager.save(STORAGE_KEYS.PLAYERS, DEFAULT_PLAYERS);
    }
    if (!StorageManager.get(STORAGE_KEYS.MATCHES)) {
      StorageManager.save(STORAGE_KEYS.MATCHES, []);
    }
  }

  initializeUI() {
    // 初始化页面管理
    this.pageManager = new PageManager();

    // 初始化通告栏
    this.bannerManager = new BannerManager(
      document.querySelector('.banner-wrapper')
    );

    // 初始化日期显示
    const dateHeaders = document.querySelectorAll('.date-header');
    this.dateDisplays = Array.from(dateHeaders).map(
      header => new DateDisplay(header)
    );
    this.dateDisplays.forEach(display => display.update());

    // 初始化玩家选择
    const players = StorageManager.get(STORAGE_KEYS.PLAYERS);
    this.player1Selector = new PlayerSelector(
      document.querySelector('.player1'),
      players,
      (player) => { this.selectedPlayer1 = player; }
    );
    this.player2Selector = new PlayerSelector(
      document.querySelector('.player2'),
      players,
      (player) => { this.selectedPlayer2 = player; }
    );
  }

  bindEvents() {
    const matchButtons = document.querySelector('.match-buttons');

    matchButtons.querySelector('.win-btn').addEventListener('click', () => {
      this.handleResult(this.selectedPlayer1, this.selectedPlayer2, this.selectedPlayer1);
    });

    matchButtons.querySelector('.lose-btn').addEventListener('click', () => {
      this.handleResult(this.selectedPlayer1, this.selectedPlayer2, this.selectedPlayer2);
    });
  }

  handleResult(player1, player2, winner) {
    if (!player1 || !player2) {
      alert('请先选择两位选手');
      return;
    }
    const recorder = new MatchRecorder(player1, player2);
    recorder.recordMatch(winner);
    this.resetSelection();
    this.updateStats();
  }

  resetSelection() {
    this.selectedPlayer1 = null;
    this.selectedPlayer2 = null;
    this.player1Selector.selectedPlayer = null;
    this.player2Selector.selectedPlayer = null;
    this.player1Selector.render();
    this.player2Selector.render();
  }

  updateStats() {
    this.updateTodayStats();
    this.updateLeaderboard();
    this.updateBanners();
  }

  updateBanners() {
    const todayMatches = StatsManager.getTodayMatches();
    
    // 如果今天没有比赛记录，不显示通告栏
    if (todayMatches.length === 0) {
      this.bannerManager.setMessage(null);
      return;
    }

    // 获取今日最菜选手
    const worstPlayer = StatsManager.getWorstPlayer(todayMatches);
    if (worstPlayer && parseFloat(worstPlayer.rate) < 50) {
      this.bannerManager.setMessage(
        `今天最菜的是：${worstPlayer.name}（胜率${worstPlayer.rate}%）`
      );
    } else {
      this.bannerManager.setMessage(null);
    }
  }

  updateTodayStats() {
    const todayMatches = StatsManager.getTodayMatches();
    const statsGrid = document.querySelector('.stats-grid');
    const playerStats = StatsManager.getAllPlayersStats(todayMatches);

    statsGrid.innerHTML = playerStats.map(player => `
      <div class="player-stat-card">
        <div class="name">${player.name}</div>
        <div class="wins">胜场：${player.wins}</div>
        <div class="rate">胜率：${player.rate}%</div>
      </div>
    `).join('');
  }

  updateLeaderboard() {
    const allMatches = StatsManager.getAllMatches();
    const leaderboardList = document.querySelector('.leaderboard-list');
    const playerStats = StatsManager.getAllPlayersStats(allMatches);

    leaderboardList.innerHTML = playerStats.map((player, index) => `
      <div class="leaderboard-item">
        <div class="rank${index < 3 ? ' rank-' + (index + 1) : ''}">${index + 1}</div>
        <div class="player-info">${player.name}</div>
        <div class="win-rate">${player.rate}%</div>
      </div>
    `).join('');
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  new App();
}); 