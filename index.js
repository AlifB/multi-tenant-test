const { Sequelize, DataTypes } = require('sequelize');

const app = require('./routes');

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});