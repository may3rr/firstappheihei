import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active'
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revokedBy: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true
  }
});

// 添加索引以优化查询
matchSchema.index({ createdAt: -1 });
matchSchema.index({ status: 1 });
matchSchema.index({ player1: 1, player2: 1 });

export default mongoose.model('Match', matchSchema); 