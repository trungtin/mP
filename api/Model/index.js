var fs = require('fs'),
  path = require('path'),
  Sequelize = require('sequelize'),
  config = require('../config'),
  db = {}

var sequelize = new Sequelize(config.db, {
  pool: {
    max: 10,
    min: 0,
    idle: 10000
  },
  define: {
    underscored: true
  }  
})
fs.readdirSync(__dirname).filter(function (file) {
  return (file.indexOf('.') !== 0) && (file !== 'index.js')
}).forEach(function (file) {
  var model = sequelize['import'](path.join(__dirname, file))
  db[model.name] = model
})

Object.keys(db).forEach(function (modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})
sequelize.sync()
db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
