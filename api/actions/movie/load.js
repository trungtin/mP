import {movie as Movie} from 'Model'
var colors = require('colors')


export default function load(req) {
	// return must be a Promise
	return getTopMovies()
}

export function getTopMovies(by='t_popularity', limit=10, offset=0) {
	
	return Movie.findAll({
		limit,
		offset,
		order: [
			[by, 'DESC']
		]
	})
}