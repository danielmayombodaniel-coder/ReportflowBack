import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connexion à MongoDB
await mongoose.connect(process.env.MONGO_URI);

console.log('🔍 Vérification des admins existants...');

try {
  // Récupérer tous les admins
  const admins = await mongoose.connection.db.collection('admins').find({}).toArray();

  console.log(`📊 ${admins.length} admin(s) trouvé(s)`);

  for (const admin of admins) {
    console.log('👤 Admin trouvé:');
    console.log('  - ID:', admin._id);
    console.log('  - Email:', admin.email);
    console.log('  - A password:', !!admin.password);
    console.log('  - A password_hash:', !!admin.password_hash);
    console.log('  - Champs disponibles:', Object.keys(admin));
    console.log('---');
  }

  if (admins.length === 0) {
    console.log('ℹ️  Aucun admin trouvé. Vous devez créer le premier admin via /api/admin/first-setup');
  }

} catch (error) {
  console.error('❌ Erreur:', error);
} finally {
  await mongoose.disconnect();
}