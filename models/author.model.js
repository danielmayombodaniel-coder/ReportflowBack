import mongoose from 'mongoose';
import { capitalizeFirstLetter } from '../utils/text-formatter.js';

const socialSchema = new mongoose.Schema({
  network: { type: String, required: true },
  url: { type: String, required: true }
});

const authorSchema = new mongoose.Schema({
  nom: { type: String, default: '' },
  biographie: { type: String, default: '' },
  short_biographie: { type: String, default: '' },
  photo: { type: String, default: '' },
  photo_public_id: { type: String, default: '' },
  email_contact: { type: String, default: '' },
  message_accroche: { type: String, default: '' },
  telephone: { type: String, default: '' },
  mon_parcours: { type: String, default: '' },
  mon_univers_litteraire: { type: String, default: '' },
  social_links: { type: [socialSchema], default: [] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date }
});

// Middleware pour capitaliser automatiquement certains champs
authorSchema.pre('save', function(next) {
  if (this.nom) {
    this.nom = capitalizeFirstLetter(this.nom);
  }
  if (this.biographie) {
    this.biographie = capitalizeFirstLetter(this.biographie);
  }
  if (this.short_biographie) {
    this.short_biographie = capitalizeFirstLetter(this.short_biographie);
  }
  if (this.message_accroche) {
    this.message_accroche = capitalizeFirstLetter(this.message_accroche);
  }
  next();
});

export default mongoose.model('Author', authorSchema);
