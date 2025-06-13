
module.exports = (sequelize, DataTypes) => {
    const Disease = sequelize.define('Disease', {
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
        symptoms_description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        treatment_recommendations: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'diseases',
        timestamps: false,
    });

    Disease.associate = (models) => {
     
        Disease.belongsToMany(models.Symptom, {
            through: models.DiseaseSymptom,
            foreignKey: 'disease_id',
            otherKey: 'symptom_id',
            as: 'Symptoms'
        });
       
        Disease.hasMany(models.Diagnosis, { foreignKey: 'preliminary_diagnosis_id', as: 'preliminaryDiagnoses' });
        Disease.hasMany(models.Diagnosis, { foreignKey: 'ai_suggested_diagnosis_id', as: 'aiSuggestedDiagnoses' });
        Disease.hasMany(models.Diagnosis, { foreignKey: 'final_diagnosis_id', as: 'finalDiagnoses' });
     
        Disease.hasMany(models.ExpertValidation, { foreignKey: 'previous_diagnosis_id', as: 'previousValidations' });
        Disease.hasMany(models.ExpertValidation, { foreignKey: 'new_diagnosis_id', as: 'validatedDiseases' });
    };

    return Disease;
};