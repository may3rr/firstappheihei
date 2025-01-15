import express from 'express';
import Match from '../models/Match.js';

const router = express.Router();

// 获取比赛记录（支持日期筛选）
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    let query = { status: 'active' };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const matches = await Match.find(query)
      .populate('player1')
      .populate('player2')
      .populate('winner')
      .sort('-createdAt');
    
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 记录新比赛
router.post('/', async (req, res) => {
  const match = new Match({
    player1: req.body.player1Id,
    player2: req.body.player2Id,
    winner: req.body.winnerId,
    createdBy: req.body.createdBy || 'anonymous'
  });

  try {
    const newMatch = await match.save();
    const populatedMatch = await Match.findById(newMatch._id)
      .populate('player1')
      .populate('player2')
      .populate('winner');
    
    // 通知 WebSocket 服务器有新记录
    req.app.get('io').emit('match:new', populatedMatch);
    
    res.status(201).json(populatedMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 撤回比赛记录
router.put('/:id/revoke', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: '找不到该比赛记录' });
    }

    // 检查是否是当天的记录
    const today = new Date();
    const matchDate = new Date(match.createdAt);
    if (matchDate.toDateString() !== today.toDateString()) {
      return res.status(403).json({ message: '只能撤回当天的比赛记录' });
    }

    match.status = 'revoked';
    match.revokedAt = new Date();
    match.revokedBy = req.body.revokedBy || 'anonymous';
    
    await match.save();

    const populatedMatch = await Match.findById(match._id)
      .populate('player1')
      .populate('player2')
      .populate('winner');

    // 通知 WebSocket 服务器记录被撤回
    req.app.get('io').emit('match:revoke', populatedMatch);

    res.json(populatedMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    const { date } = req.query;
    let query = { status: 'active' };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const matches = await Match.find(query);
    const stats = new Map();

    // 计算每个玩家的统计数据
    matches.forEach(match => {
      // 处理 player1
      if (!stats.has(match.player1.toString())) {
        stats.set(match.player1.toString(), { matches: 0, wins: 0 });
      }
      stats.get(match.player1.toString()).matches++;
      if (match.winner.toString() === match.player1.toString()) {
        stats.get(match.player1.toString()).wins++;
      }

      // 处理 player2
      if (!stats.has(match.player2.toString())) {
        stats.set(match.player2.toString(), { matches: 0, wins: 0 });
      }
      stats.get(match.player2.toString()).matches++;
      if (match.winner.toString() === match.player2.toString()) {
        stats.get(match.player2.toString()).wins++;
      }
    });

    // 转换为数组格式
    const result = Array.from(stats.entries()).map(([playerId, data]) => ({
      playerId,
      matches: data.matches,
      wins: data.wins,
      rate: (data.wins / data.matches * 100).toFixed(1)
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 