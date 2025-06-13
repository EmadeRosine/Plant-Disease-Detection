// src/models/Diagnosis.js
module.exports = (sequelize, DataTypes) => {
    const Diagnosis = sequelize.define('Diagnosis', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        farmer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        plant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'plants',
                key: 'id',
            },
        },
        observed_symptom_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER), // Store an array of symptom IDs
            allowNull: false,
        },
        preliminary_diagnosis_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'diseases',
                key: 'id',
            },
        },
        ai_suggested_diagnosis_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'diseases',
                key: 'id',
            },
        },
        final_diagnosis_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'diseases',
                key: 'id',
            },
        },
        status: { // e.g., 'pending_review', 'validated', 'rejected', 'needs_more_info'
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'pending_review',
        },
        farmer_notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            onUpdate: DataTypes.NOW, // Automatically updates on model save
        },
    }, {
        tableName: 'diagnoses',
        timestamps: false,
    });

    Diagnosis.associate = (models) => {
        Diagnosis.belongsTo(models.User, { foreignKey: 'farmer_id', as: 'farmer' });
        Diagnosis.belongsTo(models.Plant, { foreignKey: 'plant_id', as: 'plant' });
        Diagnosis.belongsTo(models.Disease, { foreignKey: 'preliminary_diagnosis_id', as: 'preliminaryDiagnosis' });
        Diagnosis.belongsTo(models.Disease, { foreignKey: 'ai_suggested_diagnosis_id', as: 'aiSuggestedDiagnosis' });
        Diagnosis.belongsTo(models.Disease, { foreignKey: 'final_diagnosis_id', as: 'finalDiagnosis' });
        Diagnosis.hasOne(models.ExpertValidation, { foreignKey: 'diagnosis_id', as: 'expertValidation' });
    };

    return Diagnosis;
};