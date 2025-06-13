// src/config/db.js
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
        logging: false, // Set to true to see SQL queries in console during development
        define: {
            timestamps: false, // Disables default createdAt and updatedAt columns
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

        // FOR DEVELOPMENT ONLY: Sync models to database
        // Use `force: true` to drop tables and recreate them (DANGEROUS IN PRODUCTION!)
        // Use `alter: true` to try and alter existing tables to match model definitions
        console.log('Syncing database models...');
        await sequelize.sync({ alter: true }); // Use alter: true for non-destructive updates
        console.log('Database models synced.');

    } catch (error) {
        console.error('Unable to connect to the database or sync models:', error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = { sequelize, connectDB };