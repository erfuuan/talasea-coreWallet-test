const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['charge', 'payment', 'buy_gold', 'sell_gold'], 
    required: true
  },
  amount: { type: Number, required: true },
  metadata: { type: Object },
  status: { type: String, enum: ['pending','success','failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);
