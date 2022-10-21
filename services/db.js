const sqlite = require('better-sqlite3');
const database = require('../database')
const path = require('path');

const db = new sqlite(path.resolve(database.DBSOURCE));

function query(sql, params) {
  return db.prepare(sql).all(params);
}

function queryAll(sql) {
  return db.prepare(sql).all();
}

function run(sql, params) {
  return db.prepare(sql).run(params);
}

function get(sql, params) {
  return db.prepare(sql).get(params);
}

module.exports = {
  query, queryAll, run, get
}