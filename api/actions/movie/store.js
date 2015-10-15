import {movie_url as MovieUrl} from 'Model'
import async from 'async'

export default function store(req) {
  return new Promise((resolve, reject) => {
    let data = req.body
    let storeValues = data.storeValues
    let storeMeta = data.meta
    async.each(storeValues, (value, cb) => {
      MovieUrl.create({...value, movie_id: storeMeta.id})
        .then(() => {
          cb(null)
        })
        .catch((err) => {
          cb(err)
        })
    }, err => {
      if(err) {
        console.log('GOT ERROR while storing to database: ' + err)
        reject(err)
      }
        resolve('DONE')
    })
  });
}
