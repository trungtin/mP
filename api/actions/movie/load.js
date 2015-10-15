import {movie as Movie} from 'Model'
var colors = require('colors')


export default function load(req) {
	// return must be a Promise
	let {by, limit, offset} = req.query
	console.log(by, limit, offset)
	return getTopMovies((by)? by: undefined, (limit)? limit: undefined, (offset)? offset: undefined)
}

export function getTopMovies(by='t_popularity', limit=20, offset=0) {
	console.log(by, limit, offset)
	return Movie.findAll({
		limit: limit,
		offset: offset,
		order: [
			[by, 'DESC']
		]
	})
}