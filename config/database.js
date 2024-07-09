const Sequelize = require("sequelize");

// Shared Sequelize instance
const db = new Sequelize("postgres", "postgres", "postgres", {
  host: "localhost",
  dialect: "postgres",
});

// Test the database connection
db.authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
  
  const setupSchemas = async () => {
    let schemas = await db.showAllSchemas();
    
    schemas = schemas.filter((schema) => schema.includes("tenant"));
    
    schemas.forEach((schema) => {
      const { Post } = require("../model/setupAssociations")(schema);
      // sync post models
      Post.sync({ alter: true }).then(() => {
        console.log(`Database (${schema}) & tables created!`);
      });
    });
  };

  setupSchemas();
  
module.exports = db;
