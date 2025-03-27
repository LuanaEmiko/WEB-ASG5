/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Luana Emiko Silva Nakazo Student ID: 124231234 Date: 03/11/2025
*
*  Published URL: assingment3-pmqyw8ook-luana-emikos-projects.vercel.app
*
********************************************************************************/

const express = require('express');
const app = express();
const path = require('path');
const HTTP_PORT = process.env.PORT || 8080;
const dataService = require('./data-service.js');

const { initialize, getAllSites, getSiteById, getSitesByProvinceOrTerritoryName, getSitesByRegion, getSitesBySubRegionName } = require('./data-service');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

initialize().then(() => {
    console.log("Site data initialized successfully");
}).catch((error) => {
    console.error("Error initializing site data: " + error.message);
});

app.get('/', (req, res) => {
    res.render('home', { page: '/home' });
});

app.get('/about', (req, res) => {
    res.render('about', { page: '/about' });
});

app.get('/sites', async (req, res) => {
    try {
        const { region, provinceOrTerritory, subRegion } = req.query;

        let sites = [];

        if (region) {
            sites = await getSitesByRegion(region);
        } else if (provinceOrTerritory) {
            sites = await getSitesByProvinceOrTerritoryName(provinceOrTerritory);
        } else if (subRegion) {
            sites = await getSitesBySubRegionName(subRegion);
        } else {
            sites = await getAllSites();
        }
        res.render("sites", { sites });

    } catch (error) {
        console.error("Error fetching sites: " + error.message);
        res.status(404).render("404", { message: "An error occurred while retrieving sites." });
    }
});

app.get("/sites/:id", async (req, res) => {
    try {
        const site = await getSiteById(req.params.id);

        if (!site) {
            return res.status(404).render("404", { message: "No site found with the specified ID." });
        }

        res.render("site", { site });

    } catch (error) {
        console.error("Error fetching site by ID: " + error.message);
        res.status(404).render("404", { message: "An error occurred while retrieving the site." });
    }
});

app.use((req, res) => {
    res.status(404).render("404", { message: "The page you are looking for does not exist." });
});

app.listen(HTTP_PORT, () => console.log(`Server listening on: ${HTTP_PORT}`));

const { getAllProvincesAndTerritories, editSite } = require('./data-service');

app.get("/editSite/:id", async (req, res) => {
    try {
        const site = await getSiteById(req.params.id);
        const provincesAndTerritories = await getAllProvincesAndTerritories();

        if (site && provincesAndTerritories) {
            res.render("edit", { provincesAndTerritories, site });
        } else {
            throw new Error("Data retrieval failed");
        }
    } catch (error) {
        console.error("Error fetching site or provinces and territories: " + error.message);
        res.status(404).render("404", { message: error.message });
    }
});

app.post("/editSite", async (req, res) => {
    try {
        const { id, ...siteData } = req.body;
        await editSite(id, siteData);
        res.redirect("/sites");
    } catch (error) {
        console.error("Error updating site: " + error.message);
        res.render("500", { message: `We have encountered the following error: ${error.message}` });
    }
});

app.get("/deleteSite/:id", (req, res) => {
    const { id } = req.params;
    
    dataService.deleteSite(id)
        .then(() => {
            res.redirect("/sites");
        })
        .catch((err) => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
});
