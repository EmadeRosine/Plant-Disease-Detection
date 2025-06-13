
const db = require('./src/models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {

        await db.sequelize.sync({ force: true });
        console.log('Database synced (FORCE TRUE) for seeding.');

   
        const passwordHash = await bcrypt.hash('password123', 10);

        const [adminUser] = await db.User.findOrCreate({
            where: { username: 'admin' },
            defaults: { username: 'admin', password_hash: passwordHash, role: 'admin' }
        });
        const [expertUser] = await db.User.findOrCreate({
            where: { username: 'expert' },
            defaults: { username: 'expert', password_hash: passwordHash, role: 'expert' }
        });
        const [farmerUser1] = await db.User.findOrCreate({
            where: { username: 'farmer1' },
            defaults: { username: 'farmer1', password_hash: passwordHash, role: 'farmer' }
        });
        const [farmerUser2] = await db.User.findOrCreate({
            where: { username: 'farmer2' },
            defaults: { username: 'farmer2', password_hash: passwordHash, role: 'farmer' }
        });
        console.log('Users seeded/checked.');


        const [tomatoPlant] = await db.Plant.findOrCreate({
            where: { name: 'Tomato' },
            defaults: { name: 'Tomato', description: 'Common garden tomato plant.', image_url: 'https://example.com/tomato.jpg' }
        });
        const [potatoPlant] = await db.Plant.findOrCreate({
            where: { name: 'Potato' },
            defaults: { name: 'Potato', description: 'Potato plant.', image_url: 'https://example.com/potato.jpg' }
        });
        const [cornPlant] = await db.Plant.findOrCreate({
            where: { name: 'Corn' },
            defaults: { name: 'Corn', description: 'Maize plant.', image_url: 'https://example.com/corn.jpg' }
        });
        const [cucumberPlant] = await db.Plant.findOrCreate({
            where: { name: 'Cucumber' },
            defaults: { name: 'Cucumber', description: 'Cucumber plant.', image_url: 'https://example.com/cucumber.jpg' }
        });
        console.log('Plants seeded/checked.');

      
        const [leafSpot] = await db.Symptom.findOrCreate({
            where: { id: 1 }, 
            defaults: { name: 'Leaf Spot', description: 'Dark spots on leaves.', type: 'Leaf' }
        });
        const [wilting] = await db.Symptom.findOrCreate({
            where: { id: 2 },
            defaults: { name: 'Wilting', description: 'Drooping or limp leaves/stems.', type: 'General' }
        });
        const [yellowing] = await db.Symptom.findOrCreate({
            where: { id: 3 },
            defaults: { name: 'Yellowing Leaves', description: 'Leaves turning yellow.', type: 'Leaf' }
        });
        const [stemRot] = await db.Symptom.findOrCreate({
            where: { id: 4 },
            defaults: { name: 'Stem Rot', description: 'Soft, discolored areas on stems.', type: 'Stem' }
        });
        const [fruitLesions] = await db.Symptom.findOrCreate({
            where: { id: 5 },
            defaults: { name: 'Fruit Lesions', description: 'Discolored or damaged areas on fruit.', type: 'Fruit' }
        });
        const [rustSpots] = await db.Symptom.findOrCreate({
            where: { id: 6 },
            defaults: { name: 'Rust Spots', description: 'Orange-brown pustules on upper and lower leaf surfaces.', type: 'Leaf/Stem' }
        });
        const [powderyMildew] = await db.Symptom.findOrCreate({
            where: { id: 7 },
            defaults: { name: 'Powdery Mildew', description: 'White, powdery patches on leaves/stems.', type: 'Leaf' }
        });
        const [mosaicPattern] = await db.Symptom.findOrCreate({
            where: { id: 8 },
            defaults: { name: 'Mosaic Pattern', description: 'Irregular light and dark green patterns on leaves.', type: 'Leaf' }
        });
        console.log('Symptoms seeded/checked.');

       
        const [earlyBlight] = await db.Disease.findOrCreate({
            where: { name: 'Early Blight' },
            defaults: {
                name: 'Early Blight',
                description: 'A common fungal disease affecting tomatoes and potatoes.',
                symptoms_description: 'Dark, concentric spots on older leaves, often with a yellow halo. Can also affect stems and fruit.',
                treatment_recommendations: 'Fungicides, rotation, remove infected leaves.'
            }
        });
        await earlyBlight.addSymptoms([leafSpot, wilting]); 

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

        const [cornCommonRust] = await db.Disease.findOrCreate({
            where: { name: 'Corn Common Rust' },
            defaults: {
                name: 'Corn Common Rust',
                description: 'Fungal disease affecting corn, characterized by rust-colored spots.',
                symptoms_description: 'Small, circular to oval, reddish-brown pustules (rust spots) on upper and lower leaf surfaces.',
                treatment_recommendations: 'Resistant hybrids, fungicides if severe.'
            }
        });
        await cornCommonRust.addSymptoms([rustSpots, yellowing]);

        const [powderyMildewDisease] = await db.Disease.findOrCreate({
            where: { name: 'Powdery Mildew' },
            defaults: {
                name: 'Powdery Mildew',
                description: 'A fungal disease affecting many plants, visible as white powdery spots.',
                symptoms_description: 'White, powdery spots on leaves, stems, and sometimes fruit. Infected leaves may yellow and curl.',
                treatment_recommendations: 'Fungicides, improve air circulation, remove infected parts.'
            }
        });
        await powderyMildewDisease.addSymptoms([powderyMildew, leafSpot, yellowing]);

        const [cucumberMosaicVirus] = await db.Disease.findOrCreate({
            where: { name: 'Cucumber Mosaic Virus' },
            defaults: {
                name: 'Cucumber Mosaic Virus',
                description: 'A common viral disease affecting cucumbers and many other vegetables.',
                symptoms_description: 'Yellow and green mosaic patterns on leaves, stunted growth, distorted fruit, wilting.',
                treatment_recommendations: 'No cure; remove infected plants, control aphids (vectors).'
            }
        });
        await cucumberMosaicVirus.addSymptoms([mosaicPattern, wilting, yellowing]);

        console.log('Diseases and associations seeded/checked.');

        console.log('Database seeding complete!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await db.sequelize.close();
    }
};


seedDatabase();