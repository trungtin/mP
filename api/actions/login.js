import Passport from 'actions/Auth/auth'

export default function login (req, params, res) {
  return new Promise((resolve, reject) => {
    Passport().authenticate('local', (err, user, info = {}) => {
      if (err) {
        reject('Authentication error: ', err)
      }
      if (user) {
        req.logIn(user, (e) => { if (e) console.log(err); return resolve({username: user.username}) })
      } else {
        reject(info.message)
      }
    })(req)
  })
}
