'use strict'

module.exports = function (sequelize, DataTypes) {

  let Movie = sequelize.define('movie', {
    title: {type: DataTypes.STRING, allowNull: false},
    imdb_id: {type: DataTypes.STRING},
    tmdb_id: {type: DataTypes.INTEGER, unique: true, allowNull: false},
    plot: {type: DataTypes.TEXT},
    adult: {type: DataTypes.BOOLEAN},
    release_date: {type: DataTypes.DATE},
    backdrop_path: {type: DataTypes.STRING},
    poster_path: {type: DataTypes.STRING},
    t_vote: {type: DataTypes.FLOAT},
    t_vote_count: {type: DataTypes.INTEGER},
    t_popularity: {type: DataTypes.FLOAT},
    i_vote: {type: DataTypes.FLOAT},
    i_vote_count: {type: DataTypes.INTEGER}
  })

  return Movie
}
