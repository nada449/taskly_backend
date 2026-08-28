require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const User = require('../models/user.model');

const defaultPassword = 'Taskly123!';

const userData = [
  ['Ahmed Ben Salah', 'ahmed.bensalah'],
  ['Amel Trabelsi', 'amel.trabelsi'],
  ['Yassine Jlassi', 'yassine.jlassi'],
  ['Sarra Gharbi', 'sarra.gharbi'],
  ['Mohamed Ayari', 'mohamed.ayari'],
  ['Nour Ben Amor', 'nour.benamor'],
  ['Houssem Dridi', 'houssem.dridi'],
  ['Ines Mansouri', 'ines.mansouri'],
  ['Karim Mejri', 'karim.mejri'],
  ['Mariem Chaabane', 'mariem.chaabane'],
  ['Fares Khelifi', 'fares.khelifi'],
  ['Dorra Kammoun', 'dorra.kammoun'],
  ['Slim Riahi', 'slim.riahi'],
  ['Asma Bouazizi', 'asma.bouazizi'],
  ['Walid Haddad', 'walid.haddad'],
  ['Rania Ferchichi', 'rania.ferchichi'],
  ['Bilel Saidi', 'bilel.saidi'],
  ['Sonia Ben Youssef', 'sonia.benyoussef'],
  ['Zied Tlili', 'zied.tlili'],
  ['Meriem Ben Romdhane', 'meriem.benromdhane'],
  ['Anis Hamdi', 'anis.hamdi'],
  ['Lina Sfar', 'lina.sfar'],
  ['Oussama Ben Hassen', 'oussama.benhassen'],
  ['Hiba Mabrouk', 'hiba.mabrouk'],
  ['Aymen Jebali', 'aymen.jebali'],
  ['Chaima Karray', 'chaima.karray'],
  ['Sami Mzabi', 'sami.mzabi'],
  ['Rim Ben Salem', 'rim.bensalem'],
  ['Mounir Toumi', 'mounir.toumi'],
  ['Wafa Ksouri', 'wafa.ksouri'],
  ['Tarek Belhadj', 'tarek.belhadj'],
  ['Aya Saadaoui', 'aya.saadaoui'],
  ['Hatem Rezgui', 'hatem.rezgui'],
  ['Nesrine Cherif', 'nesrine.cherif'],
  ['Sofiene Ben Ali', 'sofiene.benali'],
  ['Ikram Jelassi', 'ikram.jelassi'],
  ['Moez Ben Mahmoud', 'moez.benmahmoud'],
  ['Racha Sassi', 'racha.sassi'],
  ['Khalil Zoghlami', 'khalil.zoghlami'],
  ['Sabrine Triki', 'sabrine.triki'],
  ['Nader Ouni', 'nader.ouni'],
  ['Nourhene Saidi', 'nourhene.saidi'],
  ['Hamza Baccouche', 'hamza.baccouche'],
  ['Maha Ben Amor', 'maha.benamor'],
  ['Youssef Guesmi', 'youssef.guesmi'],
  ['Salma Ayari', 'salma.ayari'],
  ['Wassim Kallel', 'wassim.kallel'],
  ['Fatma Zahra Jaziri', 'fatma.jaziri'],
  ['Rayen Mami', 'rayen.mami'],
  ['Houda Ben Saad', 'houda.bensaad']
];

const users = userData.map(([name, emailPrefix], index) => ({
  name,
  email: `${emailPrefix}@example.test`,
  phone: `+216 ${20 + (index % 5)}${String(100000 + index).slice(-6)}`,
  password: defaultPassword
}));

async function seedUsers() {
  await mongoose.connect(process.env.mongo_uri);
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  await Promise.all(users.map((user) => User.updateOne(
    { email: user.email },
    { $setOnInsert: { ...user, password: hashedPassword } },
    { upsert: true }
  )));

  console.log(`${users.length} utilisateurs de démonstration sont prêts.`);
  console.log(`Mot de passe commun: ${defaultPassword}`);
}

seedUsers()
  .catch((error) => {
    console.error('Erreur lors du seed des utilisateurs:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });