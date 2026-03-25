import passport from 'passport'

const authRouter = (app) => {
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/auth/failure' }),
        (req, res) => {
            // Successful authentication, redirect to frontend
            res.redirect('http://localhost:5173/');
        }
    );

    app.get('/auth/user', (req, res) => {
        if (req.isAuthenticated()) {
            res.json({ findUser: req.user });
        } else {
            res.status(401).json({ error: 'Not authenticated' });
        }
    });

    app.get('/auth/failure', (req, res) => {
        res.status(401).json({ error: 'Authentication Failed' });
    });

    app.get('/auth/logout', (req, res, next) => {
        req.logout(function(err){
            if(err) return next(err);
            res.json({ ok: true });
        });
    });
}

export default authRouter
