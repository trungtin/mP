import { sequelize, Sequelize, movie_url as MovieUrl } from 'Model'
import _ from 'lodash'
import request from 'axios'

export default function play (req) {
  const id = req.path.split('/').splice(-1)
  return getMedia(id).then(getUrl)
}

export function getMedia (id) {
  return new Promise((resolve, reject) => {
    sequelize.query((`SELECT mu.* FROM movie_urls AS mu
      WHERE mu.movie_id IN ('${id}') AND mu.is_work = true
      ORDER BY (original_audio and not foreign_hardcoded_caption) DESC,
        quality DESC, original_audio DESC, foreign_hardcoded_caption ASC`),
    {type: Sequelize.QueryTypes.SELECT}).then(results => resolve(results[0]))     /* .then(results => {
      let full = _.partition(results, (result) => {
        if (result.quality > 720) {
          return true
        }
        return false
      })[0]

      let good, bad
      if (full.length === 0) {
        [good, bad] = _.partition(results, (result) => {
          if (result.quality > 460) {
            return true
          }
          return false
        })
        if (good.length === 0) {
          resolve(_.sample(bad))
        }
        resolve(_.sample(good))
      } else {
        resolve(_.sample(full))
      }
    }) */
  })
}

export function getUrl (media) {
  if (!media) {
    return Promise.reject('NO URL!')
  }
  if (!(media.permanent_url) || media.permanent_url.length === 0) {
    return request.get('https://picasaweb.google.com/data/feed/base/user/' + media.user_id + '/albumid/' + media.album_id + '?alt=json')
      .then(result => {
        let tempUrl = []
        const entry = result.data.feed.entry
        if (Array.isArray(entry) && entry.length !== 0) {
          entry.forEach(ent => {
            if (ent.id.$t.indexOf('/photoid/' + media.video_id) !== -1) {
              ent.media$group.media$content.forEach(content => {
                if (content.medium === 'video') {
                  tempUrl.push(content.url)
                }
              })
            }
          })
        }
        return tempUrl
      }).then((temp) => {
        media.dataValues.temporary_url = temp
        if (media.dataValues.temporary_url.length === 0) {
          return MovieUrl.findOne({where: {id: media.dataValues.id}}).then(result => {
            result.update({'is_work': false})
          }).then(() => getMedia(media.dataValues.movie_id).then(getUrl))
        }
        return media
      })
  } else {
    return media
  }
}
