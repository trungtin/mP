'use strict'

export default function (Sequelize, DataTypes) {
	let MovieUrl = Sequelize.define('movie_url', {
		video_id: {type: DataTypes.STRING, allowNull: false},
		album_id: {type: DataTypes.STRING, allowNull: false},
		user_id: {type: DataTypes.STRING, allowNull: false},
		quality: {type: DataTypes.INTEGER},
		permanent_url: {type: DataTypes.ARRAY(DataTypes.STRING)},
		is_work: {type: DataTypes.BOOLEAN, default: true}
	}, {
		classMethods: {
			associate: function(db){
				MovieUrl.belongsTo(db['movie'], {
					targetKey: 'tmdb_id'
				})
			}	
		}
	})
	
	return MovieUrl
} 