import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import GitHubStrategy from 'passport-github2';
import { adminModel as User } from '../models/admin/user.model.js'; 

import { generateAccessToken, generateRefreshToken } from '../utils/token.js';

// Google Strategy
passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/admin/auth/oauth/google/callback', 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            user_name: profile.username || profile.emails[0].value.split('@')[0],
            profile_image: profile.photos[0]?.value,
            login_method: 'google',
            isVerified: true,
            isActive: true,
            role: 'Admin'
          });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        user.refreshToken = newRefreshToken;
        await user.save();

        return done(null, { user, accessToken: newAccessToken, refreshToken: newRefreshToken });
      } catch (err) {
        console.error(`Error while google login ${err}`);
        return done(err, null);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy.Strategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/v1/admin/auth/oauth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username,
            email: email,
            user_name: profile.username,
            profile_image: profile.photos?.[0]?.value,
            login_method: 'github',
            isVerified: true,
            isActive: true,
            role: 'Admin'
          });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        user.refreshToken = newRefreshToken;
        await user.save();

        return done(null, { user, accessToken: newAccessToken, refreshToken: newRefreshToken });
      } catch (err) {
        console.error(`Error while github login : ${err}`)
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((obj, done) => done(null, obj));

export { passport };