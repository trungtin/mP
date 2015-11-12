
export default function (Sequelize, DataTypes) {
  let MovieUrl = Sequelize.define('movie_url', {
    video_id: {type: DataTypes.STRING, allowNull: false, unique: true},
    album_id: {type: DataTypes.STRING, allowNull: false},
    user_id: {type: DataTypes.STRING, allowNull: false},
    quality: {type: DataTypes.INTEGER},
    permanent_url: {type: DataTypes.ARRAY(DataTypes.STRING)},
    is_work: {type: DataTypes.BOOLEAN, defaultValue: true},
    original_audio: {type: DataTypes.BOOLEAN, defaultValue: true},
    foreign_hardcoded_caption: {type: DataTypes.BOOLEAN, defaultValue: false}
  }, {
    classMethods: {
      associate: db => {
        MovieUrl.belongsTo(db.movie, {
          targetKey: 'id'
        })
      }
    }
  })

  return MovieUrl
}
