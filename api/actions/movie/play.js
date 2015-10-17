import {movie_url as MovieUrl, sequelize} from 'Model'
import _ from 'lodash'
import request from 'axios'

export default function play(req) {
	const id = req.path.split('/').splice(-1)
	return getMedia(id).then(getUrl)
}

export function getMedia(id) {
	return new Promise((resolve, reject) => {
		MovieUrl.findAll({
			where: {
				movie_id: id,
				is_work: true
			},
			order: [
				//[sequelize.fn('ARRAY_LENGTH', sequelize.col('permanent_url'), 1), 'ASC'],
				[sequelize.col('quality'), 'DESC']
			]
		}).then(results => {
			let full = _.partition(results, (result) => {
				if (result.quality > 720)
					return true
				return false	
			})[0]
			let good, bad
			if (full.length === 0) {
				[good, bad] = _.partition(results, (result) => {
					if (result.quality > 460)
						return true
					return false	
				})
				if (good.length === 0) {
					resolve(_.sample(bad))
				}
				resolve(_.sample(good))
			} else {
				resolve(_.sample(full))
			}
		})
	})
}

export function getUrl(media) {
	if(!media.permanent_url || media.permanent_url.length === 0) {
		return request.get('https://picasaweb.google.com/data/feed/base/user/' + media.user_id + '/albumid/' + media.album_id + '?alt=json')
		.then(result => {
			let temporary_url = []
			const entry = result.data.feed.entry
			if(Array.isArray(entry) && entry.length !==0) {
				entry.forEach(ent => {
					if (ent.id.$t.indexOf('/photoid/' + media.video_id) !== -1) {
						ent.media$group.media$content.forEach(content => {
							if (content.medium === 'video') {
								temporary_url.push(content.url);
							}
						})
					}
				})
			}
			return temporary_url
		}).then((temp) => {
			media.dataValues.temporary_url = temp
			if (media.dataValues.temporary_url.length === 0) {
				console.log('oops')
				console.log(media.dataValues.id)
				return MovieUrl.findOne({where:{id: media.dataValues.id}}).then(result => {
					console.log(result.dataValues.id)
					result.update({'is_work': false})
					console.log(result.dataValues.is_work)
				}).then(() => getMedia(media.dataValues.movie_id).then(getUrl))
			}
			return media
		})
	} else {
		return media
	}
}

