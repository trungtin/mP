'use strict'

module.exports = function (sequelize, DataTypes) {
  let Movie = sequelize.define('movie', {
    title: {type: DataTypes.STRING, allowNull: false},
    imdb_id: {type: DataTypes.STRING},
    tmdb_id: {type: DataTypes.INTEGER, unique: true},
    plot: {type: DataTypes.TEXT},
    adult: {type: DataTypes.BOOLEAN},
    release_date: {type: DataTypes.DATE},
    backdrop_path: {type: DataTypes.STRING},
    poster_path: {type: DataTypes.STRING},
    t_vote: {type: DataTypes.FLOAT},
    t_vote_count: {type: DataTypes.INTEGER},
    t_popularity: {type: DataTypes.FLOAT},
    i_vote: {type: DataTypes.FLOAT},
    i_vote_count: {type: DataTypes.INTEGER},
    bluray_release_date: {type: DataTypes.DATE},
    url_state: {type: DataTypes.INTEGER, default: 0} // state = 0: no url; 1: working, 2: bad quality, 3: not official release yet.
  })

  return Movie
}
