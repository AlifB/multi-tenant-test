const Sequelize = require("sequelize");

// Shared Sequelize instance
const db = new Sequelize("postgres", "postgres", "postgres", {
  host: "localhost",
  dialect: "postgres",
});

// Test the database connection
db
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

module.exports = db;
