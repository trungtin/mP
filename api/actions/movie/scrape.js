import https from 'https'
import { getData as processGetData } from './process'
/**
 * Get media by userID or albumID from Google picasa
 * ?userid={}&albumid={}&getAlbumList={true/false|1/0}
 */
export default function scrape (req) {
  let {userid, albumid} = req.query
  console.log(req.query)
  if (!userid) {
    return Promise.reject('UserId is required!')
  }
  let getAlbumList = req.query.getAlbumList === 'true' || req.query.getAlbumList === '1'
  let url = buildUrl(userid, albumid)

  let overLimit = false
  return new Promise((resolve, reject) => {
    if (!albumid) {
      let albumIds = []
      Promise.resolve(userid).then(buildUrl).then(getDataPromise).then(result => {
        overLimit = result.feed.openSearch$totalResults > 1000
        result.feed.entry.some((entry, index) => {
          if (index === 100) {
            return true
          }
          albumIds.push(entry.id.$t.match(/albumid\/([a-zA-Z0-9]+)/i)[1])
          return false
        })

        resolve(albumIds)
      })
    } else {
      resolve([albumid])
    }
  }).then(albumIds => albumIds.map(id => buildUrl(userid, id)))
    .then(Urls => processGetData({Urls, meta: {type: 'fromUser', queryObject: req.query, overLimit}}))
}

export function buildUrl (userId, albumId) {
  let baseUrl = '/data/feed/base/user/'
  return baseUrl + userId + (albumId ? `/albumid/${albumId}` : '') + '?alt=json&v=2'
}

export function getDataPromise (url) {
  return new Promise((resolve, reject) => {
    console.log(url)
    https.get({
      hostname: 'picasaweb.google.com',
      path: url,
      json: true
    }, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        resolve(JSON.parse(body))
      })
    })
      .on('error', (err) => {
        reject(err)
      })
  })
}
