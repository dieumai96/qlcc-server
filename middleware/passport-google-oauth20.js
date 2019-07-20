const passport = require('passport');
const keys = require('./../config/keys');
const GoogleStrategy = require('passport-google-oauth20');
passport.use(
    new GoogleStrategy({
        callbackUrl: '/auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }),
    () => {

    }
)