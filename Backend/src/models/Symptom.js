
module.exports = (sequelize, DataTypes) => {
    const Symptom = sequelize.define('Symptom', {
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
        type: { 
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'symptoms',
        timestamps: false,
    });

    Symptom.associate = (models) => {
   
        Symptom.belongsToMany(models.Disease, {
            through: models.DiseaseSymptom,
            foreignKey: 'symptom_id',
            otherKey: 'disease_id',
            as: 'Diseases'
        });
    };

    return Symptom;
};