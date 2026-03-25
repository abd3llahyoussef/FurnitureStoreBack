import passport from 'passport'
import dotenv from 'dotenv'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { UserModel } from './Models/User.Model.js'

dotenv.config()

const userStore = new UserModel()

passport.use(new GoogleStrategy(
    {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK || 'http://localhost:8080/auth/google/callback',
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails && profile.emails[0] && profile.emails[0].value;
            const username = profile.displayName || (email ? email.split('@')[0] : 'google-user');
            if (!email) return done(new Error('No email available from Google profile'));

            let user = await userStore.getUserByEmail(email);
            if (!user) {
                user = await userStore.createUserFromGoogle({ username, email, fk_role: 4 });
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    // store email in session
    done(null, user.email || user.Email);
});

passport.deserializeUser(async (email, done) => {
    try {
        const user = await userStore.getUserByEmail(email);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport
