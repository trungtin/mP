import {sequelize, Sequelize} from 'Model'
import async from 'async'
import __ from 'lodash'
import logger from 'lib/logger'
import https from 'https'
import querystring from 'querystring'

export default function process () {
	return getMovieBadLink().then((results) => {
		return makeQueries(results[0])
	}).then(buildUrls)
	.then(getData)
	.catch((e) => {
		console.log('GOT ERROR: ' + e)
	})
	
}

export function getMovieBadLink () {
	return sequelize.query('SELECT m.*, bool_or(mu.is_work) AS any_link_work FROM public.movies m \
							LEFT JOIN public.movie_urls mu \
							ON m.id = mu.movie_id \
							GROUP BY m.id \
							HAVING (bool_or(mu.is_work) = \'false\' OR bool_or(mu.is_work) IS NULL) \
							ORDER BY m.t_popularity DESC \
							LIMIT 1',
							{ type: Sequelize.QueryTypes.SELECT})
}

function makeQueries (movie) {
	let q = []
	
	q.push(movie.title)
	q.push(movie.title + ' YIFY')
	q.push(movie.title + ' ' + movie.release_date.getFullYear())
	q.push(movie.title.replace(/\ /g, '.') + '.' + movie.release_date.getFullYear())
	return {
		meta: {
			id: movie.id,
			title: movie.title,
			release_year: movie.release_date.getFullYear()
		},
		queries: q
	}
}

function buildUrls (queryOb) {
	let queries = queryOb.queries
	let Urls = queries.map ((q, i) => {
		let baseUrl = '/data/feed/base/all?alt=json&kind=photo&access=public&isvideo=true&imgmax=1600&hl=en_US&v=2&'
		return baseUrl + querystring.stringify({q: q})
	})
	return {
		Urls: Urls,
		meta: queryOb.meta
	}
}

function getData (queryOb) {
	let Urls = queryOb.Urls
	let results = []
	let getDataAsync = new Promise ((resolve, reject) => {
		async.each(Urls, (url, callback) => {
			https.get({
				hostname: 'picasaweb.google.com',
				path: url,
				json: true
			}, (res) => {
				let body =''
				res.on('data', (chunk) => {
					body += chunk
				})
				res.on('end', () => {
					let entry = JSON.parse(body).feed.entry
					if (!entry) {
						callback('Zero results, just skip it.')
					}
					let pickedEntry = entry.map((e) => {
						return __.pick(e, ['id', 'title', 'media$group'])
					})
					results.push(...pickedEntry)
					callback(null)
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
			let compactResults = __.union(results)
			resolve({meta: queryOb.meta, results: compactResults})
		})
	})
	
	return getDataAsync
}