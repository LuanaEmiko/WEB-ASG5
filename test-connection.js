const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
const sequelize = new Sequelize('SenecaDB', 'lesnakazo', 'npg_ZJufY3q8SXtK', {
  host: 'ep-crimson-star-a5fhm1t1-pooler.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

  ////////////////////////////////////////////////////////////////////////////////
  
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

