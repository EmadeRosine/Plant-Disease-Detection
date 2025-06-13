
module.exports = (sequelize, DataTypes) => {
    const ExpertValidation = sequelize.define('ExpertValidation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        diagnosis_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'diagnoses',
                key: 'id',
            },
        },
        expert_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        previous_diagnosis_id: { 
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'diseases',
                key: 'id',
            },
        },
        new_diagnosis_id: { 
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'diseases',
                key: 'id',
            },
        },
        validation_status: { 
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        validated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'expert_validations',
        timestamps: false,
    });

    ExpertValidation.associate = (models) => {
        ExpertValidation.belongsTo(models.Diagnosis, { foreignKey: 'diagnosis_id', as: 'diagnosis' });
        ExpertValidation.belongsTo(models.User, { foreignKey: 'expert_id', as: 'expert' });
        ExpertValidation.belongsTo(models.Disease, { foreignKey: 'previous_diagnosis_id', as: 'previousDiagnosis' });
        ExpertValidation.belongsTo(models.Disease, { foreignKey: 'new_diagnosis_id', as: 'expertDiagnosis' });
    };

    return ExpertValidation;
};