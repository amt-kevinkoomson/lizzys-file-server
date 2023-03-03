const LocalStrategy = require('passport-local').Strategy;
const db2 = require('./db/index');
const bcrypt2 = require('bcrypt');


function initialize(passport){
    const authenticateUser = async (email, password, done) => {
        db2.query('SELECT * FROM users WHERE email = $1', [email], async (err, result) => {
          if (err) {
            return done(err);
          }
          if (!result.rows[0]) {
            return done(null, false, { message: 'No user with that email.' });
          }
          const coo = await bcrypt2.compare(password, result.rows[0].password);
          if ( !coo ) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, result.rows[0]);
        });
      }
    passport.use(
        new LocalStrategy({usernameField: 'email'}, authenticateUser),
    )
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        db2.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
            if (err) {
                return done(err);
            }
            return done(null, result.rows[0]);
        });
    })
}

module.exports = initialize;