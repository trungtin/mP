import { sequelize, Sequelize, movie as Movie } from 'Model'
import async from 'async'
import _ from 'lodash'
import https from 'https'
import querystring from 'querystring'

function isNumber (n) {
  return !isNaN(Number.parseInt(n, 10)) && isFinite(n)
}

/**
 * /						:	get most popularity with all bad link
 * /id						:	get movie by id
 * /id/quality				:	get movie by id with specific quality (0: all, 1-4: highest-lowest)
 * /top/quality				:	get most popularity with all bad link with specific quality
 * /queries[/quality]		:	get movies by queries, split multiple queries by '+' or ',', with specific quality
 * /load(?[offset, limit])	:	load meta of popular movies
 *
 */
export default function process (req, params) {
  let reqQuery = req.query
  let getMovie, queries, quality, idOrQueries
  let requestUrl = '/' + params.length ? params.join('/') : ''

  if (params[0] === 'load') {
    return getMovieBadLink(reqQuery.limit, reqQuery.offset)
  }
  /* split (',' '+' ' ') and split each character */
  quality = (params[1] && splitAndReplace(params[1])) || null

  /* remove heading and tailing special character and split */
  idOrQueries = (params[0] && params[0] !== 'top') ? params[0].replace(/^[,\+\ ]+/i, '').replace(/[,\+\ ]+$/i, '').split(/[\,\+]+/i) : null

  // For when get queries from movie
  getMovie = (params[0] === 'top' || !params || params.length === 0) ? getMovieBadLink() : (idOrQueries.every(isNumber) ? getMovieById(idOrQueries) : null)

  // For search directly by queries
  queries = idOrQueries && !idOrQueries.every(isNumber) && (quality ? searchByQuery(idOrQueries, quality, requestUrl, reqQuery) : searchByQuery(idOrQueries, null, requestUrl, reqQuery)) || null

  if (!queries) {
    queries = getMovie.then((results) => {
      return makeQueries(results[0] || results, quality, requestUrl)
    })
  }

  return queries.then(buildUrls)
    .then(getData)
    .catch((e) => {
      console.log('GOT ERROR: ' + e)
      throw Error(e)
    })
}

function splitAndReplace (str) {
  let arr = str.split(/[,+ ]*|(?=\d)/gi)
  return arr.map(val => {
    switch (val) {
      case '1':
        return 'large'
      case '2':
        return 'medium'
      case '3':
        return 'small'
      case '4':
        return 'very_small'
      default:
        return 'all'
    }
  })
}

export function getMovieBadLink (limit, offset) {
  return sequelize.query(`SELECT m.*, bool_or(mu.is_work) AS any_link_work FROM public.movies m
							LEFT JOIN public.movie_urls mu
							ON m.id = mu.movie_id
							GROUP BY m.id
							HAVING (bool_or(mu.is_work) IS NOT TRUE AND m.url_state = 0 OR m.url_state IS NULL)
							ORDER BY m.t_popularity DESC
							LIMIT ` + (limit || '1') + (offset ? (' offset ' + offset) : ''),
    {type: Sequelize.QueryTypes.SELECT})
}

export function getMovieById (id) {
  return Movie.findAll({where: {id: {$in: Array.isArray(id) ? id : [id]}}})
}

function makeQueries (movie, quality, requestUrl) {
  let q = []

  q.push(movie.title + ' YIFY')
  q.push(movie.title + ' ' + movie.release_date.getFullYear() + ' mp4')
  q.push(movie.title.replace(/ /g, '.') + '.' + movie.release_date.getFullYear())
  q.push(movie.title)
  console.log(q)
  return {
    meta: {
      type: 'fromMovie',
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      url: requestUrl
    },
    queries: q,
    quality: quality
  }
}

function mapQualityName (quality) {
  let mappedQualityName = { all: 'all', large: 'ultra', medium: 'high', small: 'medium', very_small: 'low' }
  return quality.reduce((prev, cur) => {
    return prev + mappedQualityName[cur] + ' '
  }, '').trim()
}

function searchByQuery (queries, quality, params, reqQuery) {
  console.log('query: ', reqQuery, '\n params: ', params)
  let guessedTitle = queries[0].match(/\`(.*)\`/i)
  if (Array.isArray(guessedTitle) && guessedTitle.length === 2) {
    guessedTitle = guessedTitle[1]
    queries.forEach(q => q.replace('`', ''))
    return Movie.findOne({
      attributes: [
        'id', 'title', 'release_date'
      ],
      where: {
        title: {
          $ilike: guessedTitle + '%'
        }
      }
    }).then(result => ({
      meta: {
        type: 'fromQuery',
        queries: queries.join(', ') + (Array.isArray(quality) ? ' (' + mapQualityName(quality) + ')' : ''),
        url: params,
        id: result && result.id,
        title: result && result.title,
        release_date: result && result.release_date
      },
      queries: queries,
      quality: quality || null
    }))
  } else {
    return Promise.resolve({
      meta: {
        type: 'fromQuery',
        queries: queries.join(', ') + (Array.isArray(quality) ? ' (' + mapQualityName(quality) + ')' : ''),
        url: params + (Object.keys(reqQuery).length !== 0 ? ('?' + querystring.stringify(reqQuery)) : ''),
        id: (reqQuery && reqQuery.id) || undefined,
        title: (reqQuery && reqQuery.title) || undefined,
        release_date: (reqQuery && reqQuery.release_date) || undefined
      },
      queries: queries,
      quality: quality || null
    })
  }
}

function buildUrls (queryOb) {
  console.dir(queryOb)
  let queries = queryOb.queries
  let Urls = []
  if (queryOb.quality) {
    queryOb.quality.forEach(qua => {
      Urls = Urls.concat(queries.map((q, i) => {
        let baseUrl = '/data/feed/base/all?alt=json&kind=photo&access=public&isvideo=true&imgmax=1600&hl=en_US&v=2&'
        return baseUrl + querystring.stringify({q: q, imgsz: qua})
      }))
    })
    console.log('url: ', Urls)
  } else {
    Urls = queries.map((q, i) => {
      let baseUrl = '/data/feed/base/all?alt=json&kind=photo&access=public&isvideo=true&imgmax=1600&hl=en_US&v=2&'
      return baseUrl + querystring.stringify({q: q})
    })
  }
  return {
    Urls: Urls,
    meta: queryOb.meta
  }
}

export function getData (queryOb) {
  let Urls = queryOb.Urls
  let results = []
  return new Promise((resolve, reject) => {
    console.log(Urls)
    async.eachSeries(Urls, (url, callback) => {
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
          let entry = JSON.parse(body).feed.entry
          if (!entry || entry.length === 0) {
            // continue
            callback(null)
          } else {
            let filteredEntry = entry.filter(et => {
              et.media$group.media$content = et.media$group.media$content.filter(el => {
                let isVideo = el.type.match(/^video/i)
                return Array.isArray(isVideo) && isVideo.length > 0
              })
              return et.media$group.media$content.length > 0
            })
            let pickedEntry = filteredEntry.map((e) => {
              return _.pick(e, ['id', 'title', 'media$group', 'author', 'gphoto$albumtitle'])
            })
            results.push(...pickedEntry)
            callback(null)
          }
        })
      })
        .on('error', (err) => {
          callback(err)
        })
    }, (err) => {
      if (err) {
        console.log('GOT ERROR while getting data: ' + err)
        reject(err)
      }
      console.dir('getting data result: ', results)
      if (queryOb.meta && queryOb.meta.id && (!results || results.length === 0)) {
        pushToWaitLine(queryOb.meta.id).then(() => {
          process().then((result) => {
            resolve(result)
          }, error => {
            reject(error)
          })
        })
      } else if (!results || results.length === 0) {
        reject('No result')
      } else {
        let compactResults = _.union(results)
        resolve({meta: queryOb.meta, results: compactResults})
      }
    })
  })
}

function pushToWaitLine (movieId) {
  return Movie.update({'wait_for_release': true}, {where: {id: movieId}}).then((array) => {
    console.log(array[0])
  })
}
