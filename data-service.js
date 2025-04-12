require('pg');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const sequelize = new Sequelize('SenecaDB', 'lesnakazo', 'npg_ZJufY3q8SXtK', {
  host: 'ep-crimson-star-a5fhm1t1-pooler.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

const ProvinceOrTerritory = sequelize.define('ProvinceOrTerritory', {
  code: { type: Sequelize.STRING, primaryKey: true },
  name: Sequelize.STRING,
  type: Sequelize.STRING,
  region: Sequelize.STRING,
  capital: Sequelize.STRING
}, { createdAt: false, updatedAt: false });

const Site = sequelize.define('Site', {
  siteId: { type: Sequelize.STRING, primaryKey: true },
  site: Sequelize.STRING,
  description: Sequelize.TEXT,
  date: Sequelize.INTEGER,
  dateType: Sequelize.STRING,
  image: Sequelize.STRING,
  location: Sequelize.STRING,
  latitude: Sequelize.FLOAT,
  longitude: Sequelize.FLOAT,
  designated: Sequelize.INTEGER,
  provinceOrTerritoryCode: Sequelize.STRING
}, { createdAt: false, updatedAt: false });

Site.belongsTo(ProvinceOrTerritory, { foreignKey: 'provinceOrTerritoryCode' });

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => resolve())
      .catch(err => reject("Unable to sync the database: " + err));
  });
}

function getAllSites() {
  return new Promise((resolve, reject) => {
    Site.findAll({ include: [ProvinceOrTerritory] })
      .then(data => resolve(data))
      .catch(err => reject("Unable to retrieve sites: " + err));
  });
}

function getSiteById(id) {
  return new Promise((resolve, reject) => {
    Site.findAll({
      include: [ProvinceOrTerritory],
      where: { siteId: id }
    })
      .then(data => {
        if (data.length > 0) resolve(data[0]);
        else reject("Unable to find requested site");
      })
      .catch(err => reject("Unable to retrieve site: " + err));
  });
}

function getSitesByProvinceOrTerritoryName(provinceOrTerritory) {
  return new Promise((resolve, reject) => {
    Site.findAll({
      include: [ProvinceOrTerritory],
      where: {
        '$ProvinceOrTerritory.name$': {
          [Op.iLike]: `%${provinceOrTerritory}%`
        }
      }
    })
      .then(data => {
        if (data.length > 0) resolve(data);
        else reject("Unable to find requested sites");
      })
      .catch(err => reject("Unable to retrieve sites: " + err));
  });
}

function getSitesByRegion(region) {
  return new Promise((resolve, reject) => {
    Site.findAll({
      include: [ProvinceOrTerritory],
      where: {
        '$ProvinceOrTerritory.region$': region
      }
    })
      .then(data => {
        if (data.length > 0) resolve(data);
        else reject("Unable to find requested sites");
      })
      .catch(err => reject("Unable to retrieve sites: " + err));
  });
}

function addSite(siteData) {
  return new Promise((resolve, reject) => {
    Site.create(siteData)
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

function getAllProvincesAndTerritories() {
  return new Promise((resolve, reject) => {
    ProvinceOrTerritory.findAll()
      .then(data => resolve(data))
      .catch(err => reject("Unable to retrieve provinces/territories: " + err));
  });
}

function editSite(id, siteData) {
  return new Promise((resolve, reject) => {
    Site.update(siteData, { where: { siteId: id } })
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

function deleteSite(id) {
  return new Promise((resolve, reject) => {
    Site.destroy({
      where: { siteId: id }
    })
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

module.exports = {
  initialize,
  getAllSites,
  getSiteById,
  getSitesByProvinceOrTerritoryName,
  getSitesByRegion,
  addSite,
  getAllProvincesAndTerritories,
  editSite,
  deleteSite 
};
