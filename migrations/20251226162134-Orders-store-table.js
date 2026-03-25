import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbm;
let type;
let seed;
let PromiseLib;

export function setup(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  PromiseLib = options.Promise;
}

export function up(db) {
  const filePath = path.join(__dirname, 'sqls', '20251226162134-Orders-store-table-up.sql');
  return new PromiseLib(function(resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  }).then(function (data) {
    return db.runSql(data);
  });
}

export function down(db) {
  const filePath = path.join(__dirname, 'sqls', '20251226162134-Orders-store-table-down.sql');
  return new PromiseLib(function(resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  }).then(function (data) {
    return db.runSql(data);
  });
}

export const _meta = { version: 1 };
