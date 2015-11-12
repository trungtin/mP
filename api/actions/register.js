import { user as User } from 'Model'

let checker = Object.create({checkUsernameAvaibility, checkEmailAvaibility})

export default function register (req, params) {
  if (params && params.length > 0) {
    return typeof checker[params[0]] === 'function' ?
      checker[params[0]](req.query.query || req.query.username || req.query.email)
      : Promise.reject('Something wrong with this request')
  }

  const {username, email, password} = req.body

  return Promise.all([checkUsernameAvaibility(username), checkEmailAvaibility(email)]).then(resultArr => {
    if (resultArr.every(el => el)) {
      return registerUser(req.body).then(newUser => {
        if (newUser) {
          req.session.user = newUser
          return Promise.resolve({user: newUser, message: 'Your account with username ' + newUser.username + ' has been registered.'})
        } else {
          return Promise.reject('Something went wrong when creating your account! Please try again later.')
        }
      })
    } else {
      return Promise.reject('ERROR while registering new user!')
    }
  })
}

export function checkUsernameAvaibility (username) {
  if (typeof username !== 'string') {
    return Promise.reject('Username not valid!')
  }

  return User.findOne({where: {username: username}})
    .then(result => {
      return !result ? Promise.resolve(true) : Promise.resolve(false)
    })
}

export function checkEmailAvaibility (email) {
  if (typeof email !== 'string') {
    return Promise.reject('Email not valid!')
  }

  return User.findOne({where: {email: email}})
    .then(result => {
      return !result ? Promise.resolve(true) : Promise.resolve(false)
    })
}

export function registerUser (user) {
  return User.create(user)
}
