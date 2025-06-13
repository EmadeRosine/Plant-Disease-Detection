// src/models/Plant.js
module.exports = (sequelize, DataTypes) => {
    const Plant = sequelize.define('Plant', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        image_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'plants',
        timestamps: false,
    });

    Plant.associate = (models) => {
        Plant.hasMany(models.Diagnosis, { foreignKey: 'plant_id', as: 'diagnoses' });
    };

    return Plant;
};