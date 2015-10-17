import {movie as Movie} from 'Model'
import async from 'async'
import _ from 'lodash'

var colors = require('colors')

const mapName = {'t_popularity': 'popularity', 't_vote': 'vote', 'release_date': 'releaseDate'}
const inverseMapName = _.invert(mapName)

export default function load(req) {
	if (req.path === '/movie/load/all') {
		return loadAll(req)
	}
	// return must be a Promise
	let {order, limit, offset} = req.query
	order = inverseMapName[order]
	return getTopMovies((order)? order: undefined, (limit)? limit: undefined, (offset)? offset: undefined)
}

export function getTopMovies(order='t_popularity', limit=20, offset=0) {
	return Movie.findAll({
		limit: limit,
		offset: offset,
		order: [
			[order, 'DESC']
		]
	}).then(results => {
		return {
			[mapName[order]]: results
		}
	})
}

export function loadAll(req) {
	let results = {}
	return new Promise ((resolve, reject) => {
		async.each(['t_popularity', 't_vote', 'release_date'], (order, cb) => {
			Movie.findAll({
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
			if(err) {
				reject(err)
			}
			resolve(results)
		})
	})
}
