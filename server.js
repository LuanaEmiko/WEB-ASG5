/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Luana Emiko Silva Nakazo Student ID: 124231234 Date: 04/11/2025
*
*  Published URL:  
*
********************************************************************************/


const clientSessions = require("client-sessions");
const authData = require("./modules/auth-service");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const dataService = require("./data-service");
const path = require("path");

const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(clientSessions({
    cookieName: "session",
    secret: "luana12345!!",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

app.get("/", async (req, res) => {
    try {
        const allSites = await dataService.getAllSites();
        const featuredSites = allSites.sort(() => 0.5 - Math.random()).slice(0, 3);
        res.render("home", { featuredSites });
    } catch (err) {
        console.error("Error fetching sites:", err);
        res.status(500).render("404", { message: "Error retrieving site details." });
    }
});

app.get("/about", (req, res) => {
    res.render("about", { page: "/about" });
});

app.get("/sites", async (req, res) => {
    try {
        const { region, provinceOrTerritory } = req.query;
        let sites = [];

        if (region) {
            sites = await dataService.getSitesByRegion(region);
        } else if (provinceOrTerritory) {
            sites = await dataService.getSitesByProvinceOrTerritoryName(provinceOrTerritory);
        } else {
            sites = await dataService.getAllSites();
        }

        if (sites.length === 0) {
            return res.status(404).render("404", { message: "No sites found for the selected region or province." });
        }

        res.render("sites", { sites });
    } catch (err) {
        console.error("Error fetching site data:", err);
        res.status(500).render("404", { message: "Error retrieving site data." });
    }
});

app.get("/sites/:id", async (req, res) => {
    try {
        const site = await dataService.getSiteById(req.params.id);
        if (!site) {
            return res.status(404).render("404", { message: "Site not found." });
        }
        res.render("site", { site });
    } catch (err) {
        console.error("Error fetching site by ID:", err);
        res.status(404).render("404", { message: "Error retrieving site details." });
    }
});

app.get("/addSite", ensureLogin, (req, res) => {
    dataService.getAllProvincesAndTerritories()
        .then(provincesAndTerritories => {
            res.render("addSite", { provincesAndTerritories });
        })
        .catch(err => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
});

app.post("/addSite", ensureLogin, (req, res) => {
    dataService.addSite(req.body)
        .then(() => {
            res.redirect("/sites");
        })
        .catch(err => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
});

app.get("/editSite/:id", ensureLogin, async (req, res) => {
    try {
        const site = await dataService.getSiteById(req.params.id);
        const provincesAndTerritories = await dataService.getAllProvincesAndTerritories();
        res.render("editSite", { site, provincesAndTerritories });
    } catch (err) {
        res.status(404).render("404", { message: err });
    }
});

app.post("/editSite", ensureLogin, (req, res) => {
    dataService.editSite(req.body.siteId, req.body)
        .then(() => res.redirect("/sites"))
        .catch(err => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
});

app.get("/deleteSite/:id", ensureLogin, (req, res) => {
    dataService.deleteSite(req.params.id)
        .then(() => res.redirect("/sites"))
        .catch(err => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
});

dataService.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize services: ", err);
        process.exit(1);
    });

    app.get("/login", (req, res) => {
        res.render("login");
      });

      app.get("/register", (req, res) => {
        res.render("register");
      });
      

      app.post("/register", (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch(err => {
      res.render("register", { errorMessage: err, userName: req.body.userName });
    });
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get("User-Agent");
  
    authData.checkUser(req.body)
      .then((user) => {
        req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory
        };
        res.redirect("/sites");
      })
      .catch(err => {
        res.render("login", { errorMessage: err, userName: req.body.userName });
      });
  });

  app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
  });
  

app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found." });
});