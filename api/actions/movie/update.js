import {movie as Movie} from 'Model'
import async from 'async'
import http from 'http'
import credentials from '../../credentials'
import schedule from 'node-schedule'

const api_key = credentials.TMDB.api_key

export default function update(req) {
	// return must be a Promise
	return updateMovies()
}

function updateMovies(by = 'popularity', offset = 0) {
	let page = offset + 1
	
	return new Promise((resolve, reject) => {
		(function loop() {
			http.get({
				hostname: 'api.themoviedb.org',
				path: '/3/discover/movie?sort_by=' + by + '.desc&vote_average.gte=4&vote_count.gte=30&api_key='+ api_key + '&page=' + page,
				headers: {'Accept': 'application/json'}
			}, function (res) {
	
				res.setEncoding('utf8')
				let body = ''
				res.on('data', function(chunk) {
					body += chunk	
				})
				res.on('end', function(){
					let data = JSON.parse(body)
					let totalPages = data.total_pages
					console.log('--------------------------------------')
					console.log(data.results.length)
					console.log('--------------------------------------')
					async.eachSeries(data.results, function(m, callback){
						Movie.upsert({
							title: m.title,
							tmdb_id: m.id,
							plot: m.overview,
							adult: m.adult,
							release_date: m.release_date,
							t_vote: m.vote_average,
							t_vote_count: m.vote_count,
							t_popularity: m.popularity,
							poster_path: m.poster_path,
							backdrop_path: m.backdrop_path
						}).then(function() {
							callback(null)
						}).catch(function(err){
							console.log('Got error: ' + err)
							callback(err)
						})
					}, function(err) {
						if(err) {
							console.error('Got error: ' + err)
							reject(err)
						} else {
							if (page++ >= 8) {
								console.log('---------------------------------------------------------'.green)
								console.log('All data has been upserted completely'.underline.green)
								console.log('---------------------------------------------------------'.green)
								resolve('All done')
							} else {
								console.log('---------------------------------------------------------'.green)
								console.log('This part has been upserted completely'.underline.green)
								console.log('---------------------------------------------------------'.green)
								loop()
							}
						}
						
					})
				})
			}).on('error', function (err) {
				console.log('-----------------------ERROR-----------------------');
				console.log(e);
				console.log('-----------------------ERROR-----------------------');
				reject(err)
			})
		})()
	})
	
}
