// src/models/DiseaseSymptom.js
module.exports = (sequelize, DataTypes) => {
    const DiseaseSymptom = sequelize.define('DiseaseSymptom', {
        disease_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'diseases', // Refers to table name
                key: 'id',
            },
        },
        symptom_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'symptoms', // Refers to table name
                key: 'id',
            },
        },
        severity_level: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    }, {
        tableName: 'disease_symptoms', // Join table
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['disease_id', 'symptom_id'] // Composite primary key/unique constraint
            }
        ]
    });

    DiseaseSymptom.associate = (models) => {
        DiseaseSymptom.belongsTo(models.Disease, { foreignKey: 'disease_id', as: 'disease' });
        DiseaseSymptom.belongsTo(models.Symptom, { foreignKey: 'symptom_id', as: 'symptom' });
    };

    return DiseaseSymptom;
};