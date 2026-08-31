import mongoose from 'mongoose';
import { capitalizeFirstLetter } from '../utils/text-formatter.js';

const actusSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true
  },
  contenu: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  image_public_id: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date
  }
});

// Middleware pour capitaliser automatiquement certains champs
actusSchema.pre('save', function(next) {
  if (this.titre) {
    this.titre = capitalizeFirstLetter(this.titre);
  }
  if (this.contenu) {
    this.contenu = capitalizeFirstLetter(this.contenu);
  }
  next();
});

export default mongoose.model('Actu', actusSchema);
