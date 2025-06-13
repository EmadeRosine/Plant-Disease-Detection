// seed.js
const db = require('./src/models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        // Ensure tables are synced before seeding
        await db.sequelize.sync({ alter: true });
        console.log('Database synced for seeding.');

        // 1. Create Users (Admin, Expert, Farmer)
        const passwordHash = await bcrypt.hash('password123', 10);

        const adminUser = await db.User.findOrCreate({
            where: { username: 'admin' },
            defaults: { username: 'admin', password_hash: passwordHash, role: 'admin' }
        });
        const expertUser = await db.User.findOrCreate({
            where: { username: 'expert' },
            defaults: { username: 'expert', password_hash: passwordHash, role: 'expert' }
        });
        const farmerUser1 = await db.User.findOrCreate({
            where: { username: 'farmer1' },
            defaults: { username: 'farmer1', password_hash: passwordHash, role: 'farmer' }
        });
        const farmerUser2 = await db.User.findOrCreate({
            where: { username: 'farmer2' },
            defaults: { username: 'farmer2', password_hash: passwordHash, role: 'farmer' }
        });
        console.log('Users seeded/checked.');

        // 2. Create Plants
        const [tomatoPlant] = await db.Plant.findOrCreate({
            where: { name: 'Tomato' },
            defaults: { name: 'Tomato', description: 'Common garden tomato plant.', image_url: 'https://example.com/tomato.jpg' }
        });
        const [potatoPlant] = await db.Plant.findOrCreate({
            where: { name: 'Potato' },
            defaults: { name: 'Potato', description: 'Potato plant.', image_url: 'https://example.com/potato.jpg' }
        });
        console.log('Plants seeded/checked.');

        // 3. Create Symptoms
        const [leafSpot] = await db.Symptom.findOrCreate({
            where: { name: 'Leaf Spot' },
            defaults: { name: 'Leaf Spot', description: 'Dark spots on leaves.', type: 'Leaf' }
        });
        const [wilting] = await db.Symptom.findOrCreate({
            where: { name: 'Wilting' },
            defaults: { name: 'Wilting', description: 'Drooping or limp leaves/stems.', type: 'General' }
        });
        const [yellowing] = await db.Symptom.findOrCreate({
            where: { name: 'Yellowing Leaves' },
            defaults: { name: 'Yellowing Leaves', description: 'Leaves turning yellow.', type: 'Leaf' }
        });
        const [stemRot] = await db.Symptom.findOrCreate({
            where: { name: 'Stem Rot' },
            defaults: { name: 'Stem Rot', description: 'Soft, discolored areas on stems.', type: 'Stem' }
        });
        const [fruitLesions] = await db.Symptom.findOrCreate({
            where: { name: 'Fruit Lesions' },
            defaults: { name: 'Fruit Lesions', description: 'Discolored or damaged areas on fruit.', type: 'Fruit' }
        });
        console.log('Symptoms seeded/checked.');

        // 4. Create Diseases and Associate Symptoms
        const [earlyBlight] = await db.Disease.findOrCreate({
            where: { name: 'Early Blight' },
            defaults: {
                name: 'Early Blight',
                description: 'A common fungal disease affecting tomatoes and potatoes.',
                symptoms_description: 'Dark, concentric spots on older leaves, often with a yellow halo. Can also affect stems and fruit.',
                treatment_recommendations: 'Fungicides, rotation, remove infected leaves.'
            }
        });
        // Associate symptoms with Early Blight
        await earlyBlight.addSymptoms([leafSpot, wilting]); // Assuming these symptom IDs exist

        const [lateBlight] = await db.Disease.findOrCreate({
            where: { name: 'Late Blight' },
            defaults: {
                name: 'Late Blight',
                description: 'A destructive disease, especially in cool, moist conditions.',
                symptoms_description: 'Large, irregular, water-soaked spots on leaves that turn brown/black. White fuzzy growth on undersides.',
                treatment_recommendations: 'Fungicides, improve air circulation, resistant varieties.'
            }
        });
        await lateBlight.addSymptoms([leafSpot, wilting, stemRot, fruitLesions]);

        const [fusariumWilt] = await db.Disease.findOrCreate({
            where: { name: 'Fusarium Wilt' },
            defaults: {
                name: 'Fusarium Wilt',
                description: 'Soil-borne fungal disease causing wilting and yellowing.',
                symptoms_description: 'Lower leaves yellow and wilt, progressing upwards. Brown discoloration in vascular tissue.',
                treatment_recommendations: 'Resistant varieties, soil solarization, avoid overwatering.'
            }
        });
        await fusariumWilt.addSymptoms([wilting, yellowing]);
        console.log('Diseases and associations seeded/checked.');

        console.log('Database seeding complete!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Close the connection after seeding
        await db.sequelize.close();
    }
};

// Execute the seeding function
seedDatabase();