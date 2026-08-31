
import mongoose from 'mongoose';
import { capitalizeFirstLetter } from '../utils/text-formatter.js';

const messageSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  sujet: {
    type: String,
    required: true,
    trim: true
  },
  contenu: {
    type: String,
    required: true
  },
  statut: {
    type: String,
    enum: ['non_lu', 'lu', 'repondu'],
    default: 'non_lu' 
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour capitaliser automatiquement certains champs
messageSchema.pre('save', function(next) {
  if (this.nom) {
    this.nom = capitalizeFirstLetter(this.nom);
  }
  if (this.sujet) {
    this.sujet = capitalizeFirstLetter(this.sujet);
  }
  if (this.contenu) {
    this.contenu = capitalizeFirstLetter(this.contenu);
  }
  next();
});

export default mongoose.model('Message', messageSchema);