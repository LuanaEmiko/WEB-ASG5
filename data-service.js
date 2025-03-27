require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

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
}, { timestamps: false });

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
}, { timestamps: false });

Site.belongsTo(ProvinceOrTerritory, { foreignKey: 'provinceOrTerritoryCode' });

async function initialize() {
    try {
        await sequelize.sync();
        return Promise.resolve();
    } catch (error) {
        return Promise.reject("Error initializing database: " + error.message);
    }
}

async function getAllSites() {
    try {
        const sites = await Site.findAll({ include: [ProvinceOrTerritory] });
        return Promise.resolve(sites);
    } catch (error) {
        return Promise.reject("Error retrieving sites: " + error.message);
    }
}

async function getSiteById(id) {
    try {
        const site = await Site.findAll({
            include: [ProvinceOrTerritory],
            where: { siteId: id }
        });
        if (site.length > 0) {
            return Promise.resolve(site[0]);
        } else {
            return Promise.reject("Unable to find requested site");
        }
    } catch (error) {
        return Promise.reject("Error retrieving site: " + error.message);
    }
}

async function getSitesByProvinceOrTerritoryName(provinceOrTerritory) {
    try {
        const sites = await Site.findAll({
            include: [ProvinceOrTerritory],
            where: { '$ProvinceOrTerritory.name$': { [Sequelize.Op.iLike]: `%${provinceOrTerritory}%` } }
        });
        if (sites.length > 0) {
            return Promise.resolve(sites);
        } else {
            return Promise.reject("Unable to find requested sites");
        }
    } catch (error) {
        return Promise.reject("Error retrieving sites: " + error.message);
    }
}

async function getSitesByRegion(region) {
    try {
        const sites = await Site.findAll({
            include: [ProvinceOrTerritory],
            where: { '$ProvinceOrTerritory.region$': region }
        });
        if (sites.length > 0) {
            return Promise.resolve(sites);
        } else {
            return Promise.reject("Unable to find requested sites");
        }
    } catch (error) {
        return Promise.reject("Error retrieving sites: " + error.message);
    }
}

async function editSite(id, siteData) {
    try {
        const site = await Site.findOne({ where: { siteId: id } });
        if (!site) {
            return Promise.reject("No site found with the specified ID.");
        }
        await site.update(siteData);
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err.errors ? err.errors[0].message : err.message);
    }
}

async function addSite(siteData) {
    try {
        await Site.create(siteData);
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err.errors[0].message);
    }
}

async function getAllProvincesAndTerritories() {
    try {
        const provincesAndTerritories = await ProvinceOrTerritory.findAll();
        return Promise.resolve(provincesAndTerritories);
    } catch (error) {
        return Promise.reject("Error retrieving provinces and territories: " + error.message);
    }
}

async function deleteSite(id) {
    try {
        const site = await Site.findOne({ where: { siteId: id } });
        if (!site) {
            return Promise.reject("No site found with the specified ID.");
        }
        await site.destroy(); // Delete the site
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err.errors ? err.errors[0].message : err.message);
    }
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
