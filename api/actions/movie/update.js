import {movie as Movie} from 'Model'
import async from 'async'
import http from 'http'
import credentials from '../../credentials'
import schedule from 'node-schedule'
import Promise from 'bluebird'
import _ from 'lodash'

const api_key = credentials.TMDB.api_key

export default function update(req) {
	// return must be a Promise
	let {order, offset} = req.query
	return updateMovies(order, offset)
}

function updateMovies(by = 'popularity', offset = 0) {
	let page = offset + 1
	
	let request = requestData(by, page)
	request.then(result => {
		let data = JSON.parse(result)
		upsertToDatabase(data.results)
		const totalPages = data.total_pages
		return [data, totalPages]
	}).spread((firstData, totalPages) => {
		return _.range(2, totalPages + 1)
	}).then(pageArray => {
		pageArray.reduce((promise, page)=>{
			return promise.then(() => {
				return requestData(by, page)
			})
				.then(body => {
					let data = JSON.parse(body)
					upsertToDatabase(data.results)
				})
		}, Promise.resolve())
	})
	return Promise.resolve('hello')
}

var PromiseRequest = Promise.method(function(options) {
    return new Promise(function(resolve, reject) { 
        var request = http.request(options, function(response) {
            // Bundle the result
            var result = {
                'httpVersion': response.httpVersion,
                'httpStatusCode': response.statusCode,
                'headers': response.headers,
                'body': '',
                'trailers': response.trailers,
            };

            // Build the body
            response.on('data', function(chunk) {
                result.body += chunk;
            });

            // Resolve the promise
            response.on('end', function() {
				resolve(result.body);
			})
        });

        // Handle errors
        request.on('error', function(error) {
            console.log('Problem with request:', error.message);
            reject(error);
        });

        // Must always call .end() even if there is no data being written to the request body
        request.end();
    });
});

function requestData (by = 'popularity', page = 1) {
	return PromiseRequest({
			hostname: 'api.themoviedb.org',
			path: '/3/discover/movie?sort_by=' + by + '.desc&vote_average.gte=4&vote_count.gte=30&api_key='+ api_key + '&page=' + page,
			headers: {'Accept': 'application/json'}
		})
}

function upsertToDatabase(results) {
	results.reduce((promise, result, index) => {
		return promise.then(() => {
			return Movie.upsert({
				title: result.title,
				tmdb_id: result.id,
				plot: result.overview,
				adult: result.adult,
				release_date: result.release_date,
				t_vote: result.vote_average,
				t_vote_count: result.vote_count,
				t_popularity: result.popularity,
				poster_path: result.poster_path,
				backdrop_path: result.backdrop_path
			})
		})
	}, Promise.resolve())
}