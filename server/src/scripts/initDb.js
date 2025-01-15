import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Player from '../models/Player.js';

// 加载环境变量
dotenv.config();

// 默认玩家数据
const DEFAULT_PLAYERS = [
  {
    name: '好啵',
    avatar: '好啵.jpg'
  },
  {
    name: '血染',
    avatar: '血染.jpg'
  },
  {
    name: '张峰',
    avatar: '张峰.jpg'
  },
  {
    name: '肚腩',
    avatar: '肚腩.jpg'
  },
  {
    name: '微薄',
    avatar: '微薄.jpg'
  }
];

async function initializeDb() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 清空现有玩家数据
    await Player.deleteMany({});
    console.log('Cleared existing players');

    // 插入默认玩家
    const players = await Player.insertMany(DEFAULT_PLAYERS);
    console.log('Inserted default players:', players);

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// 运行初始化
initializeDb(); 