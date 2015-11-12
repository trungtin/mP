'use strict'

import {encrypt} from '../lib/util'

export default function (sequelize, DataTypes) {
  let User = sequelize.define('user', {
    username: {type: DataTypes.STRING, allowNull: false, unique: true},
    email: {type: DataTypes.STRING, allowNull: false, unique: true},
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set: function (plainPass) {
        this.setDataValue('password', encrypt(plainPass))
      }},
    access_level: {type: DataTypes.INTEGER, default: 0},
    last_connection: {type: DataTypes.DATE, default: Date.now}
  }, {
    classMethods: {
      // associate: function (db) {
      //   User.hasMany(db['Character'])
      // }
    },
    instanceMethods: {
      authenticate: function (plainPass) {
        return encrypt(plainPass) === this.password
      }
    }
  })

  return User
}
