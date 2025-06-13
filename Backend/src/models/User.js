
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'farmer', 
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'users',
        timestamps: false, 
    });

   
    User.associate = (models) => {
        User.hasMany(models.Diagnosis, { foreignKey: 'farmer_id', as: 'diagnoses' });
        User.hasMany(models.ExpertValidation, { foreignKey: 'expert_id', as: 'expertValidations' });
    };

    return User;
};