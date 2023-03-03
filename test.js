const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://user:password@localhost:5432/mydatabase',
});

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    pool.query('SELECT * FROM users WHERE email = $1', [email], (err, result) => {
      if (err) {
        return done(err);
      }
      if (!result.rows[0]) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (result.rows[0].password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, result.rows[0]);
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  pool.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
    if (err) {
      return done(err);
    }
    done(null, result.rows[0]);
  });
});
