const mongoose = require('mongoose');

module.exports.connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri, {
    });
    console.log('Connexion à MongoDB réussie');
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB:${error}`);
  }
}