import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connexion à MongoDB
await mongoose.connect(process.env.MONGO_URI);

console.log('🔄 Migration des mots de passe admin...');

try {
  // Récupérer tous les admins avec password_hash
  const admins = await mongoose.connection.db.collection('admins').find({
    password_hash: { $exists: true }
  }).toArray();

  console.log(`📊 ${admins.length} admin(s) trouvé(s) avec password_hash`);

  for (const admin of admins) {
    if (admin.password_hash && !admin.password) {
      // Copier password_hash vers password et supprimer password_hash
      await mongoose.connection.db.collection('admins').updateOne(
        { _id: admin._id },
        {
          $set: { password: admin.password_hash },
          $unset: { password_hash: 1 }
        }
      );
      console.log(`✅ Admin ${admin.email} migré`);
    }
  }

  console.log('🎉 Migration terminée avec succès !');
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error);
} finally {
  await mongoose.disconnect();
}