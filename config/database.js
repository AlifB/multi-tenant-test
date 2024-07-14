require("dotenv").config();
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");

console.log("Connecting to the database...");
const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
  }
);

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

const setupAdminUser = async () => {
  const { User } = require("../model/setupAssociations")("default_tenant");
  User.sync({ alter: true }).then(() => {
    console.log(`User table created!`);
  });
  const {user, created} = await User.findOrCreate({
    where: { name: process.env.ADMIN_USERNAME },
    defaults: {
      email: "admin@mail.de",
      password: await bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
      tenant: "default_tenant",
      verified: true,
      roles: ["admin"],
    },
  });

  if (created) {
    console.log("Admin user created!");
  } else {
    console.log("Admin user already exists!");
  }
}

setupSchemas();

module.exports = {db, setupAdminUser};
