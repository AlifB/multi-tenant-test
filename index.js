require("dotenv").config();

console.log(`\x1b[36m
    ___    ___ ____   ____                                  _          
   /   |  / (_) __/  / __ )____  _________ _____ ___  ___  (_)__  _____
  / /| | / / / /_   / __  / __ \\/ ___/ __ \`/ __ \`__ \\/ _ \\/ / _ \\/ ___/
 / ___ |/ / / __/  / /_/ / /_/ / /  / /_/ / / / / / /  __/ /  __/ /    
/_/  |_/_/_/_/    /_____/\\____/_/   \\__, /_/ /_/ /_/\\___/_/\\___/_/     
                                   /____/                              
Multi Tenant Test
\x1b[0m`);

console.log("Node environment: \x1b[33m", process.env.NODE_ENV, "\x1b[0m");

const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const setupRoutes = require("./routes");
const { setupAdminUser } = require("./config/database");
const path = require("path");
const { csrfGeneration } = require("./middlewares/csrfGeneration");
const app = express();

console.log("Trust proxy set to " + (process.env.NODE_ENV === 'production').toString());
app.set("trust proxy", process.env.NODE_ENV === 'production');

console.log("Setting up middlewares...");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.COOKIE_SECRET,
    proxy: process.env.NODE_ENV === 'production',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost'
    }
}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(flash())
app.use(csrfGeneration);

console.log("Setting up static files...");
app.use(
  "/plugins/uikit",
  express.static(path.join(__dirname, "./node_modules/uikit/dist"))
);
app.use("/public", express.static(path.join(__dirname, "./public")));

setupAdminUser();

console.log("Setting up routes...");
setupRoutes(app);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
