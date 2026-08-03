import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { sendOrderStatusEmail } from './mail.js';

// ES Module filename/dirname resolve
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'GuramritAdmin2026';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Connect to MongoDB with automatic Local fallback
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/guramrit';

async function connectDB() {
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    // Verify connection is fully responsive (detects Atlas IP whitelist blocks)
    await mongoose.connection.db.admin().ping();
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.warn("MongoDB Atlas connection failed or unreachable. Attempting local MongoDB fallback...", err.message);
    try {
      await mongoose.disconnect();
      await mongoose.connect('mongodb://localhost:27017/guramrit', { serverSelectionTimeoutMS: 3000 });
      console.log("Connected to Local Fallback MongoDB successfully!");
    } catch (localErr) {
      console.error("Critical: Failed to connect to both configured MongoDB Atlas and Local MongoDB fallback!", localErr);
    }
  }
}
connectDB();

// Booking Schema
const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  partySize: { type: Number, required: true },
  occasion: { type: String, required: true },
  seating: { type: String, required: true },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'confirmed' }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: mongoose.Schema.Types.Mixed, required: true }, // handles single price or pricing sizes
  type: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  category: { type: String, required: true },
  subCategory: { type: String, required: true }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  type: { type: String, default: 'dine-in' },
  tableNumber: { type: String, required: true },
  partySize: { type: Number, default: 1 },
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
  emailPreviewUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Enable CORS for frontend requests dynamically supporting dev ports and local IPs
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Allow any localhost/127.0.0.1 ports or private network IPs
    const isLocal = origin.startsWith('http://localhost:') || 
                    origin.startsWith('http://127.0.0.1:') || 
                    origin.startsWith('http://192.168.') || 
                    origin.startsWith('http://10.') || 
                    origin.startsWith('http://172.');
                    
    const isRenderSubdomain = origin.endsWith('.onrender.com');
    const isAllowedCustom = CORS_ORIGIN && CORS_ORIGIN.split(',').map(o => o.trim()).includes(origin);
                    
    if (isLocal || allowedOrigins.includes(origin) || isRenderSubdomain || isAllowedCustom) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));

app.use(express.json());

// Serve static admin files
app.get(['/admin', '/admin/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.use('/admin', express.static(path.join(__dirname, 'public')));

// File paths
const menuPath = path.join(__dirname, 'data', 'menu.json');

// Seed Menu Data from local JSON if database is empty
async function seedMenuIfNeeded() {
  try {
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      console.log("Menu collection in MongoDB is empty. Seeding from local data...");
      if (fs.existsSync(menuPath)) {
        const data = fs.readFileSync(menuPath, 'utf-8');
        const rawMenuObject = JSON.parse(data);
        
        const flatItems = [];
        const CATEGORY_MAP = {
          "Veg Starter": { category: "Indian Tandoor", subCategory: "Veg Starters" },
          "Non-Veg Starter": { category: "Indian Tandoor", subCategory: "Non-Veg Starters" },
          "Veg Main Course": { category: "Indian Curries", subCategory: "Veg Main Course" },
          "Non-Veg Main Course": { category: "Indian Curries", subCategory: "Non-Veg Main Course" },
          "Veg-Chinese Appetizers": { category: "Chinese", subCategory: "Veg-Chinese Appetizers" },
          "Non-Veg Chinese Appetizers": { category: "Chinese", subCategory: "Non-Veg Chinese Appetizers" },
          "Chinese Main Course": { category: "Chinese", subCategory: "Chinese Main Course" },
          "Soup": { category: "Soups & Sea Food", subCategory: "Soups" },
          "Sea Food (Choice of Sauce)": { category: "Soups & Sea Food", subCategory: "Sea Food Specials" },
          "Rice Dishes": { category: "Rice & Biryani", subCategory: "Rice & Biryani" },
          "Bread Dishes": { category: "Breads", subCategory: "Breads" },
          "Egg Dishes": { category: "Egg Dishes", subCategory: "Egg Dishes" },
          "Appetizer (Salads & Sides)": { category: "Salads & Beverages", subCategory: "Appetizers & Salads" },
          "Beverages": { category: "Salads & Beverages", subCategory: "Beverages" }
        };

        Object.entries(rawMenuObject).forEach(([rawKey, itemsList]) => {
          const mapping = CATEGORY_MAP[rawKey] || { category: "Others", subCategory: rawKey };
          if (Array.isArray(itemsList)) {
            itemsList.forEach(item => {
              flatItems.push({
                id: item.id || Math.random().toString(36).substr(2, 9),
                name: item.name,
                price: item.price,
                type: item.type,
                description: item.description || '',
                image: item.image || '',
                category: mapping.category,
                subCategory: mapping.subCategory
              });
            });
          }
        });
        
        await MenuItem.insertMany(flatItems);
        console.log(`Successfully seeded ${flatItems.length} menu items into MongoDB!`);
      } else {
        console.warn("Could not seed menu: local menu.json not found at:", menuPath);
      }
    } else {
      console.log(`Menu collection already contains ${count} items. Skipping seed.`);
    }
  } catch (error) {
    console.error("Error seeding menu:", error);
  }
}

// Seed on connection
mongoose.connection.once('open', () => {
  seedMenuIfNeeded();
});

// ----------------------------------------------------
// RATE LIMITERS
// ----------------------------------------------------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});

const bookingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20, // Increased limit for demo/testing convenience
  message: { error: 'Too many bookings submitted from this IP. Please wait 10 minutes before submitting another reservation.' }
});

app.use('/api/', apiLimiter);

// ----------------------------------------------------
// ROUTE: GET /api/menu
// ----------------------------------------------------
app.get('/api/menu', async (req, res) => {
  try {
    const items = await MenuItem.find().lean();
    
    const REVERSE_CATEGORY_MAP = {
      "Indian Tandoor|Veg Starters": "Veg Starter",
      "Indian Tandoor|Non-Veg Starters": "Non-Veg Starter",
      "Indian Curries|Veg Main Course": "Veg Main Course",
      "Indian Curries|Non-Veg Main Course": "Non-Veg Main Course",
      "Chinese|Veg-Chinese Appetizers": "Veg-Chinese Appetizers",
      "Chinese|Non-Veg Chinese Appetizers": "Non-Veg Chinese Appetizers",
      "Chinese|Chinese Main Course": "Chinese Main Course",
      "Soups & Sea Food|Soups": "Soup",
      "Soups & Sea Food|Sea Food Specials": "Sea Food (Choice of Sauce)",
      "Rice & Biryani|Rice & Biryani": "Rice Dishes",
      "Breads|Breads": "Bread Dishes",
      "Egg Dishes|Egg Dishes": "Egg Dishes",
      "Salads & Beverages|Appetizers & Salads": "Appetizer (Salads & Sides)",
      "Salads & Beverages|Beverages": "Beverages"
    };

    const rawMenuObject = {};
    items.forEach(item => {
      const key = `${item.category}|${item.subCategory}`;
      const rawKey = REVERSE_CATEGORY_MAP[key] || item.subCategory;
      if (!rawMenuObject[rawKey]) {
        rawMenuObject[rawKey] = [];
      }
      rawMenuObject[rawKey].push({
        id: item.id,
        name: item.name,
        price: item.price,
        type: item.type,
        description: item.description,
        image: item.image
      });
    });

    res.json(rawMenuObject);
  } catch (error) {
    console.error('Error fetching menu from MongoDB:', error);
    res.status(500).json({ error: 'Failed to retrieve menu data' });
  }
});

// ----------------------------------------------------
// ROUTE: POST /api/bookings
// ----------------------------------------------------
app.post('/api/bookings', 
  bookingLimiter,
  [
    body('name').trim().notEmpty().withMessage('Full name is required.').escape(),
    body('email').trim().isEmail().withMessage('Provide a valid email address.').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone number is required.').custom(value => {
      const cleanPhone = value.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10) {
        throw new Error('Phone number must be at least 10 digits.');
      }
      return true;
    }),
    body('date').notEmpty().withMessage('Reservation date is required.').isDate().withMessage('Enter a valid date.').custom(value => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (inputDate < today) {
        throw new Error('Reservation date cannot be in the past.');
      }
      return true;
    }),
    body('time').notEmpty().withMessage('Preferred time is required.').escape(),
    body('partySize').isInt({ min: 1, max: 50 }).withMessage('Party size must be a number between 1 and 50.'),
    body('occasion').trim().notEmpty().withMessage('Occasion is required.').escape(),
    body('seating').trim().notEmpty().withMessage('Seating preference is required.').escape(),
    body('notes').optional().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, phone, date, time, partySize, occasion, seating, notes } = req.body;

      // Generate booking ID (GR-YYYYMMDD-HEX)
      const dateStr = date.replace(/-/g, '');
      const hexId = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
      const bookingId = `GR-${dateStr}-${hexId}`;

      // Create new booking record in MongoDB
      const newBooking = new Booking({
        bookingId,
        name,
        email,
        phone,
        date,
        time,
        partySize: parseInt(partySize, 10),
        occasion,
        seating,
        notes: notes || '',
        status: 'confirmed'
      });

      await newBooking.save();

      const formattedDate = new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      
      const summary = `Reservation ${bookingId} confirmed for ${name} (${partySize} guests) on ${formattedDate} at ${time} in the ${seating}.`;

      res.status(201).json({
        success: true,
        bookingId,
        status: 'confirmed',
        summary,
        booking: newBooking
      });

    } catch (error) {
      console.error('Error saving booking to MongoDB:', error);
      res.status(500).json({ error: 'An error occurred while creating your reservation. Please try again.' });
    }
});

// ----------------------------------------------------
// ROUTE: GET /api/bookings (Protected Owner Endpoint)
// ----------------------------------------------------
app.get('/api/bookings', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const requestKey = req.query.key || req.headers['x-admin-key'];

  if (!requestKey || requestKey !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized access. Valid admin credentials required.' });
  }

  try {
    const bookings = await Booking.find().lean();
    
    // Sort bookings by date and time (newest first)
    bookings.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to retrieve bookings.' });
  }
});

// ----------------------------------------------------
// ROUTE: POST /api/orders
// ----------------------------------------------------
app.post('/api/orders',
  [
    body('customerName').trim().notEmpty().withMessage('Name is required.').escape(),
    body('customerEmail').trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
    body('customerPhone').trim().notEmpty().withMessage('Phone number is required.'),
    body('tableNumber').trim().notEmpty().withMessage('Table number is required.'),
    body('partySize').trim().notEmpty().isNumeric().withMessage('Guest count must be a number.'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required.'),
    body('totalAmount').isNumeric().withMessage('Total amount must be a number.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { customerName, customerEmail, customerPhone, tableNumber, partySize, items, totalAmount } = req.body;

      // Generate order ID (ORD-YYYYMMDD-HEX)
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const hexId = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
      const orderId = `ORD-${dateStr}-${hexId}`;

      const newOrder = new Order({
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        tableNumber,
        partySize: Number(partySize) || 1,
        items,
        totalAmount,
        status: 'pending'
      });

      await newOrder.save();

      // Trigger order confirmation email asynchronously
      console.log('[DEBUG] Order payload server-side right before sendOrderStatusEmail (Placed):', JSON.stringify({
        orderId: newOrder.orderId,
        customerName: newOrder.customerName,
        customerEmail: newOrder.customerEmail,
        customerPhone: newOrder.customerPhone,
        itemsCount: newOrder.items?.length,
        totalAmount: newOrder.totalAmount
      }, null, 2));

      sendOrderStatusEmail(newOrder, 'Placed').catch(err => {
        console.error('Asynchronous order confirmation email failed:', err);
      });

      res.status(201).json({
        success: true,
        orderId,
        status: 'pending',
        order: newOrder
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ 
        error: 'An error occurred while creating your order. Please try again.',
        details: error.message
      });
    }
  }
);

// ----------------------------------------------------
// ROUTE: GET /api/orders (Protected Owner Endpoint)
// ----------------------------------------------------
app.get('/api/orders', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const requestKey = req.query.key || req.headers['x-admin-key'];

  if (!requestKey || requestKey !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized access. Valid admin credentials required.' });
  }

  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// ----------------------------------------------------
// ROUTE: GET /api/orders/:id (Public Polling Endpoint)
// ----------------------------------------------------
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({
      success: true,
      orderId: order.orderId,
      status: order.status,
      customerName: order.customerName,
      tableNumber: order.tableNumber,
      partySize: order.partySize,
      totalAmount: order.totalAmount,
      items: order.items,
      emailPreviewUrl: order.emailPreviewUrl || ''
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
});

// ----------------------------------------------------
// ROUTE: POST /api/orders/:id/status (Protected Owner Endpoint)
// ----------------------------------------------------
app.post('/api/orders/:id/status', async (req, res) => {
  const requestKey = req.query.key || req.headers['x-admin-key'] || req.body.key;
  if (!requestKey || requestKey !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized access. Valid admin credentials required.' });
  }

  const { status } = req.body;
  const validStatuses = ['pending', 'cooking', 'ready', 'served', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status.' });
  }

  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Trigger transactional email if status transitions to cooking (Preparing) or ready (Ready)
    if (status === 'cooking' || status === 'ready') {
      console.log(`[DEBUG] Order payload server-side right before sendOrderStatusEmail (${status}):`, JSON.stringify({
        orderId: order.orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        itemsCount: order.items?.length,
        totalAmount: order.totalAmount
      }, null, 2));

      sendOrderStatusEmail(order, status).catch(err => {
        console.error('Asynchronous status transition email failed:', err);
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// ----------------------------------------------------
// DEFAULT SERVER STARTUP
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Guramrit Resto & Cafe API Server Running      `);
  console.log(` Port: ${PORT}                                 `);
  console.log(` Environment: Production-Ready                 `);
  console.log(` Admin Portal: http://localhost:${PORT}/admin  `);
  console.log(`===============================================`);
});
