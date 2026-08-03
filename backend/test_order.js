import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  type: { type: String, default: 'dine-in' },
  tableNumber: { type: String, required: true },
  items: [
    {
      menuItemId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      size: { type: String, default: '' }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending' }, // 'pending', 'cooking', 'served', 'completed'
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guramrit';
  console.log("Connecting to:", uri);
  try {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log("Connected to MongoDB successfully!");
    } catch (dbErr) {
      console.warn("Atlas connection failed, falling back to local...");
      await mongoose.connect('mongodb://localhost:27017/guramrit', { serverSelectionTimeoutMS: 5000 });
      console.log("Connected to Local Fallback MongoDB successfully!");
    }
    
    const newOrder = new Order({
      orderId: 'ORD-TEST-' + Date.now(),
      customerName: 'sindhu',
      customerEmail: 'sindhu@gmail.com',
      customerPhone: '1234567890',
      tableNumber: '1',
      items: [
        {
          menuItemId: 'tandoori-chicken',
          name: 'Tandoori Chicken',
          price: 400,
          quantity: 1,
          size: 'full'
        }
      ],
      totalAmount: 400,
      status: 'pending'
    });

    console.log("Saving order...");
    await newOrder.save();
    console.log("Saved order successfully!");
  } catch (err) {
    console.error("FAIL TO SAVE ORDER:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
