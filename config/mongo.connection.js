const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

module.exports.connectToMongoDB = async () => {
  try {
    console.log('DEBUG URI:', process.env.mongo_uri);
    await mongoose.connect(process.env.mongo_uri, {
    });
    console.log('Connexion à MongoDB réussie');
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB:${error}`);
  }
}