export default function (Sequelize, DataTypes) {
  let SavedPage = Sequelize.define('saved_page', {
    page_url: {type: DataTypes.STRING, allowNull: false, unique: 'uniqueSavedPageByUser'},
    title: {type: DataTypes.STRING},
    private: {type: DataTypes.BOOLEAN, defaultValue: false}
  }, {
    classMethods: {
      associate: db => {
        SavedPage.belongsTo(db.user, {
          foreignKey: {
            name: 'user_id',
            unique: 'uniqueSavedPageByUser',
            allowNull: false
          }
        })
      }
    }
  })

  return SavedPage
}
