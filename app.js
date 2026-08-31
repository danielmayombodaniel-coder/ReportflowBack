import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
// import adminRoutes from './routes/admin/index.admin.route.js';
// import publicHomeRoutes from './routes/public/home.public.route.js';
// import publicBioRoutes from './routes/public/bio.public.route.js';
// import publicSocialRoutes from './routes/public/socials.public.route.js';
// import publicBooksRoutes from './routes/public/books.public.route.js';
// import publicActusRoutes from './routes/public/actus.public.route.js';
// import publicContactRoutes from './routes/public/contact.public.route.js';
// import { getAdminInfoTest } from './controllers/admin/auth.admin.controller.js';
import logger from './utils/logger.js';

dotenv.config();       
 await connectDB();

const app = express();
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'https://motimpact-front.onrender.com',"https://motimpact.com"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use('/static', express.static(path.join(process.cwd(), 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.use('/api/admin', adminRoutes);  
// app.use('/api/public', publicHomeRoutes);
// app.use('/api/public', publicBioRoutes);
// app.use('/api/public', publicSocialRoutes);
// app.use('/api/public', publicBooksRoutes);
// app.use('/api/public', publicActusRoutes);
// app.use('/api/public', publicContactRoutes);


app.get('/', (req, res) => {  
  res.send('Bienvenue sur notre site !');
});

// Route de test pour voir les infos admin (SANS PROTECTION)
// app.get('/test/admin-info', getAdminInfoTest);

// Error handler (must be mounted after routes)
// import errorHandler from './middlewares/error.handler.js';
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Serveur démarré');
});
 