import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import admin from 'firebase-admin';
import User from '../models/User';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const firebaseLoginSchema = z.object({
  idToken: z.string()
});

// Initialize Firebase Admin lazily
const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      console.log('Initializing Firebase Admin...');
      console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
      console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
      console.log('Private Key exists:', !!process.env.FIREBASE_PRIVATE_KEY);
      
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error('Missing Firebase environment variables');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
      throw error;
    }
  }
};

router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', { body: req.body });
    
    // Validate input
    const { email, password, name } = registerSchema.parse(req.body);
    console.log('Validation passed for:', email);

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Password hashed successfully

    // Create user
    const user = await User.create({ email, password: hashedPassword, name });
    console.log('User created successfully:', user._id);

    // Generate token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Token generated successfully

    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }
    
    if ((error as any).name === 'MongoError' || (error as any).name === 'MongooseError') {
      console.error('Database error:', (error as any).message);
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// Firebase authentication
router.post('/firebase', async (req, res) => {
  try {
    console.log('Firebase auth request received');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request headers:', req.headers);
    
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const validation = firebaseLoginSchema.safeParse(req.body);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return res.status(400).json({ 
        error: 'Invalid request format', 
        details: validation.error.errors 
      });
    }

    const { idToken } = validation.data;
    // ID Token received for processing

    if (!idToken || idToken.length < 100) {
      console.error('Invalid or missing ID token');
      return res.status(400).json({ error: 'Invalid or missing Firebase ID token' });
    }

    // Initialize Firebase Admin if needed
    try {
      initializeFirebaseAdmin();
    } catch (initError) {
      console.error('Failed to initialize Firebase Admin:', initError);
      return res.status(500).json({ error: 'Firebase Admin configuration error' });
    }

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify Firebase ID token
    // Verifying Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken, true); // checkRevoked = true
      // Token verified successfully
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return res.status(401).json({ 
        error: 'Invalid Firebase token', 
        details: (tokenError as any).message 
      });
    }

    const { email, name, picture, uid: firebaseUid, email_verified } = decodedToken;

    if (!email) {
      console.error('No email in Firebase token');
      return res.status(400).json({ error: 'Email not found in Firebase token' });
    }

    if (!name) {
      console.error('No name in Firebase token');
      return res.status(400).json({ error: 'Name not found in Firebase token' });
    }

    if (!email_verified) {
      console.error('Email not verified in Firebase');
      return res.status(400).json({ error: 'Email not verified in Firebase' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    console.log('Existing user found:', !!user);

    if (!user) {
      // Create new user with Firebase info
      console.log('Creating new user...');
      try {
        user = await User.create({
          email,
          name,
          password: await bcrypt.hash(firebaseUid, 10), // Use Firebase UID as password hash
          firebaseUid,
          profilePicture: picture
        });
        console.log('New user created:', user._id);
      } catch (createError) {
        console.error('User creation failed:', createError);
        return res.status(500).json({ error: 'Failed to create user account' });
      }
    } else if (!user.firebaseUid) {
      // Link existing account with Firebase
      console.log('Linking existing account with Firebase...');
      try {
        user.firebaseUid = firebaseUid;
        if (picture) user.profilePicture = picture;
        await user.save();
        console.log('Account linked successfully');
      } catch (linkError) {
        console.error('Account linking failed:', linkError);
        return res.status(500).json({ error: 'Failed to link Firebase account' });
      }
    }

    // Generate JWT token
    try {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      // JWT token generated successfully

      res.json({ 
        token, 
        user: { 
          id: user._id, 
          email: user.email, 
          name: user.name,
          profilePicture: user.profilePicture 
        } 
      });
    } catch (jwtError) {
      console.error('JWT generation failed:', jwtError);
      return res.status(500).json({ error: 'Failed to generate authentication token' });
    }

  } catch (error) {
    console.error('Firebase authentication error:', error);
    console.error('Error stack:', (error as any).stack);
    
    // More specific error messages
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request format', details: error.errors });
    }
    
    if ((error as any).code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Firebase token expired' });
    }
    
    if ((error as any).code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: 'Invalid Firebase token' });
    }

    if ((error as any).code === 'auth/project-not-found') {
      return res.status(500).json({ error: 'Firebase project configuration error' });
    }
    
    res.status(500).json({ 
      error: 'Firebase authentication failed', 
      details: (error as any).message || 'Unknown error'
    });
  }
});

export default router;
