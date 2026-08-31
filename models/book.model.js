// import mongoose from 'mongoose';
// import { capitalizeFirstLetter } from '../utils/text-formatter.js';

// const bookSchema = new mongoose.Schema({
//   titre: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     default: ''
//   },
//   extrait: {
//     type: String,
//     default: ''
//   },  
//   statut: {
//     type: String,
//     enum: ['gratuit', 'payant'],
//     default: 'gratuit'
//   },
//   prix: {
//     type: Number,
//     default: 0
//   },
//   // Flag pour indiquer si le livre est mis en avant
//   is_featured: {
//     type: Boolean,
//     default: false
//   },
//   fichier_pdf: {
//     type: String,
//     default: ''
//   },
//   fichier_pdf_public_id: {
//     type: String,
//     default: ''
//   },
//   // Lien de téléchargement pour les livres payants (Maketou)
//   lien_telechargement: {
//     type: String,
//     default: ''
//   },
//   couverture: {
//     type: String,
//     default: ''
//   },
//   couverture_public_id: {
//     type: String,
//     default: ''
//   },
//   created_at: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Middleware pour capitaliser automatiquement certains champs
// bookSchema.pre('save', function(next) {
//   if (this.titre) {
//     this.titre = capitalizeFirstLetter(this.titre);
//   }
//   if (this.description) {
//     this.description = capitalizeFirstLetter(this.description);
//   }
//   if (this.extrait) {
//     this.extrait = capitalizeFirstLetter(this.extrait);
//   }
//   next();
// });

// export default mongoose.model('Book', bookSchema);
import mongoose from 'mongoose';
import { capitalizeFirstLetter } from '../utils/text-formatter.js';

const bookSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  extrait: {
    type: String,
    default: ''
  },  
  statut: {
    type: String,
    enum: ['gratuit', 'payant'],
    default: 'gratuit'
  },
  prix: {
    type: Number,
    default: 0
  },
  // Nouveau champ pour la devise
  devise: {
    type: String,
    enum: ['CDF', 'USD'],
    default: 'CDF'
  },
  // Flag pour indiquer si le livre est mis en avant
  is_featured: {
    type: Boolean,
    default: false
  },
  fichier_pdf: {
    type: String,
    default: ''
  },
  fichier_pdf_public_id: {
    type: String,
    default: ''
  },
  // Lien de téléchargement pour les livres payants (Maketou)
  lien_telechargement: {
    type: String,
    default: ''
  },
  couverture: {
    type: String,
    default: ''
  },
  couverture_public_id: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour capitaliser automatiquement certains champs
bookSchema.pre('save', function(next) {
  if (this.titre) {
    this.titre = capitalizeFirstLetter(this.titre);
  }
  if (this.description) {
    this.description = capitalizeFirstLetter(this.description);
  }
  if (this.extrait) {
    this.extrait = capitalizeFirstLetter(this.extrait);
  }
  next();
});

export default mongoose.model('Book', bookSchema);