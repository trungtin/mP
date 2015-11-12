import {sequelize, Sequelize, movie as Movie } from 'Model'
import async from 'async'
import _ from 'lodash'
import qs from 'querystring'
import Promise from 'bluebird'

const mapName = {'t_popularity': 'popularity', 't_vote': 'vote', 'release_date': 'releaseDate'}
const inverseMapName = _.invert(mapName)

export default function load (req) {
  if (req.path === '/movie/load/all') {
    return loadAll(req)
  } else if (req.path.match(/\/movie\/load\/list[\/, \?]?/i)) {
    return loadList(req)
  } else if (req.path.match(/\/movie\/load\/[a-zA-Z0-9]+/i)) {
    return loadSome(req)
  }
  // return must be a Promise
  let {order, limit, offset} = req.query
  order = inverseMapName[order]
  return getTopMovies(order || undefined, limit || undefined, offset || undefined) // force zero-length string or null to undefined
}

export function getTopMovies (order = 't_popularity', limit = 20, offset = 0) {
  return Movie.findAll({
    where: {
      url_state: {
        $gte: 1
      }
    },
    limit: limit,
    offset: offset,
    order: [
      [order, 'DESC']
    ]
  }).then(results => {
    return {
      limit,
      offset,
      orders: [mapName[order]],
      data: {[mapName[order]]: results}
    }
  })
}

export function loadAll (req) {
  let results = {}
  return new Promise((resolve, reject) => {
    async.each(['t_popularity', 't_vote', 'release_date'], (order, cb) => {
      Movie.findAll({
        where: {
          url_state: {
            $gte: 1
          }
        },
        limit: 20,
        offset: 0,
        order: [
          [order, 'DESC']
        ]
      }).then(result => {
        results[mapName[order]] = result
        cb(null)
      }).catch(err => {
        console.log('GOT ERROR: ', err)
        cb(err)
      })
    }, err => {
      if (err) {
        reject(err)
      }
      resolve({limit: 20, offset: 0, orders: ['popularity', 'vote', 'releaseDate'], data: results})
    })
  })
}

export function loadSome (req) {
  console.log(req.user)
  let id = req.path.match(/\/movie\/load\/(\d*)/i)
  let title
  id = id && id[1]
  if (!id || id.length === 0) {
    title = req.path.match(/\/movie\/load\/(.*)/i)
    title = title && qs.unescape(title[1])
  }

  if (title) {
    return Movie.findAll({
      attributes: [
        'id', 'title', 'release_date', 'url_state'
      ],
      where: {
        title: {
          $ilike: title + '%'
        }
      },
      order: [
        ['t_popularity', 'DESC']
      ],
      limit: 5
    })
  } else {
    return Movie.findOne({where: {
      id: id
    }})
  }
}

function loadList (req) {
  let {state = 'all', limit = '5'} = req.query
  if (state === 'all') {
    state = ['0', '1', '2', '3']
  } else {
    state = state.match(/\d/gi)
  }
  /* return Promise.reduce(state, (result, st) => {
    let newSt
    if (st === 0) {
      newSt = {
        $in: [0, null]
      }
    }
    return Movie.findAll({
      where: {
        url_state: newSt || st
      },
      order: [
        ['t_popularity', 'DESC']
      ],
      limit: 5
    }).then(eachResult => Object.assign({}, result, {[st]: eachResult}))
  }, {}) */
  return sequelize.query(`SELECT m.id, m.title, m.release_date, m.url_state FROM 
    (SELECT
    ROW_NUMBER() OVER (PARTITION BY url_state) AS r,
    pm.* FROM public.movies pm WHERE pm.url_state IN (${state.join(', ')}) ${state.indexOf('0') === -1 ? '' : 'OR pm.url_state IS NULL'})
    m WHERE m.r <= ${limit}`,
    {type: Sequelize.QueryTypes.SELECT})
}
