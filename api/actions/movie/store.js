import {movie_url as MovieUrl, movie as Movie} from 'Model'
import async from 'async'
import _ from 'lodash'

export default function store (req, params) {
  if (params[0] === 'updatestate') {
    return updateState(req.query)
  }
  return new Promise((resolve, reject) => {
    let data = req.body
    let storeValues = data.storeValues
    let storeMeta = data.meta
    async.each(storeValues, (value, cb) => {
      let promise
      if (value.meta && value.meta.id) {
        promise = MovieUrl.upsert({movie_id: value.meta.id, ...(_.omit(value, 'meta'))})
      } else {
        promise = MovieUrl.upsert({...value, movie_id: storeMeta.id})
      }

      promise
        .then(() => {
          Movie.findOne({where: {
            id: (value.meta && value.meta.id) || storeMeta.id
          }}).then(result => {
            if (result.url_state === 0 || result.url_state == null) {
              result.update({url_state: 1})
            }
          })
          cb(null)
        })
        .catch((err) => {
          cb(err)
        })
    }, err => {
      if (err) {
        console.log('GOT ERROR while storing to database: ' + err)
        reject(err)
      }
      resolve('DONE')
    })
  })
}

function updateState (query) {
  let {id, state} = query
  if (!(id && state)) {
    return Promise.reject('Id and new state is required when updateState')
  }
  if (['0', '1', '2', '3'].indexOf(state) === -1) {
    return Promise.reject('State not in required range')
  }
  return Movie.findOne({where: {
    id: id
  }}).then(result => {
    return result.update({url_state: state}).then(() => state)
      .catch(err => err.message)
  }).catch(err => {
    console.log('-----ERROR--------: ', err)
    return err.toString()
  })
}
