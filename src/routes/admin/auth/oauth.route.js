import express from 'express';
import { passport } from '../../../config/passport.js'; 

const router = express.Router();

const FRONTEND_URL = process.env.DASHBOARD_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

const handleOAuthSuccess = (req, res) => {
  const { accessToken, refreshToken, user } = req.user;
  
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.redirect(`${FRONTEND_URL}/login?token=${accessToken}`);
};

// ==================== GOOGLE OAUTH ====================
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
  handleOAuthSuccess
);

// ==================== GITHUB OAUTH ====================
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
  handleOAuthSuccess
);

export default router;