import Passport from 'passport'
var Strategy = require('passport-local')
import { user as User } from '../../Model'
import _ from 'lodash'

let instance

export default function pp () {
  if (instance) {
    return instance
  }
  Passport.serializeUser((user, done) => {
    done(null, user.dataValues.id)
  })

  Passport.deserializeUser((id, done) => {
    User.findOne({
      where: {
        id
      }
    }).then((user) => {
      console.log('deserialize user: ', user.dataValues)
      done(null, user.dataValues)
    }, (error) => {
      done(error)
    })
  })

  Passport.use(new Strategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
    (req, username, password, done) => {
      let email = username.match(/.+@.+\..+/i)
      username = email ? null : username

      User.findOne({
        where: {
          $or: {
            username,
            email
          }
        }
      }).then((user) => {
        if (user === null) {
          done(null, false, {message: 'This username/email has not been registered'})
        }

        if (!user.authenticate(password)) {
          done(null, false, {message: 'Invalid username or password'})
        }

        done(null, user)
      }).catch(err => {
        done(err)
      })
    })
  )
  instance = Passport
  return pp()
}
