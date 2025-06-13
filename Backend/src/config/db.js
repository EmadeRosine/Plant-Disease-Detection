
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false, 
        define: {
            timestamps: false, 
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connected successfully!');

    
        console.log('Syncing database models...');
        await sequelize.sync({ alter: true }); 
        console.log('Database models synced.');

    } catch (error) {
        console.error('Unable to connect to the database or sync models:', error);
        process.exit(1); 
    }
};

module.exports = { sequelize, connectDB };