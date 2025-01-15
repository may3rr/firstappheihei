import express from 'express';
import Player from '../models/Player.js';

const router = express.Router();

// 获取所有玩家
router.get('/', async (req, res) => {
  try {
    const players = await Player.find().sort('name');
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 添加新玩家
router.post('/', async (req, res) => {
  const player = new Player({
    name: req.body.name,
    avatar: req.body.avatar
  });

  try {
    const newPlayer = await player.save();
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 