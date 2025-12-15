<div align="center">
  <img src="https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</div>

# PDFlow - Éditeur PDF Sécurisé & Local

<div align="center">
  <img width="800" height="400" alt="PDFlow Banner" src="https://via.placeholder.com/800x400/000000/FFFFFF?text=PDFlow+by+Irreductia" />
</div>

<p align="center">
  <strong>Manipulez vos PDF directement dans votre navigateur • 100% gratuit, privé et sécurisé</strong>
</p>

<p align="center">
  <a href="#-fonctionnalités">Fonctionnalités</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-utilisation">Utilisation</a> •
  <a href="#-déploiement">Déploiement</a> •
  <a href="#-technologies">Technologies</a>
</p>

---

## 🎯 À propos

**PDFlow** est un éditeur PDF moderne et intuitif développé par **IRREDUCTIA By Mariani Studio**. Contrairement aux outils traditionnels qui nécessitent l'upload de vos fichiers sur des serveurs externes, PDFlow fonctionne entièrement dans votre navigateur web. Vos documents restent sur votre appareil, garantissant une confidentialité totale.

## ✨ Fonctionnalités

### 📄 Manipulation de PDF
- **Fusion de PDF** : Combinez plusieurs fichiers PDF en un seul document
- **Import d'images** : Convertissez vos JPG, PNG et autres formats d'image en PDF
- **Réorganisation** : Réordonnez les pages par simple glisser-déposer
- **Rotation** : Faites pivoter les pages individuellement (90°, 180°, 270°)

### 🎨 Personnalisation
- **Filigrane personnalisable** : Ajoutez du texte comme "CONFIDENTIEL" sur toutes les pages
- **Couleurs de filigrane** : Choisissez parmi plusieurs couleurs prédéfinies
- **Opacité ajustable** : Contrôlez la transparence du filigrane

### ⚡ Fonctionnalités avancées
- **Sélection multiple** : Sélectionnez et manipulez plusieurs pages simultanément
- **Aperçu en temps réel** : Visualisez vos modifications avant export
- **Annuler/Rétablir** : Fonction Undo/Redo illimitée
- **Suppression** : Supprimez facilement les pages indésirables

### 🔒 Sécurité & Performance
- **100% local** : Aucun upload de fichier sur des serveurs externes
- **Traitement côté client** : Vos données restent sur votre appareil
- **Interface moderne** : Design élégant avec thème sombre
- **Performance optimisée** : Basé sur PDF.js et pdf-lib pour un traitement rapide

## 🚀 Installation

### Prérequis
- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**

### Installation rapide

```bash
# Clonez le repository
git clone https://github.com/irreductia/pdflow.git
cd pdflow

# Installez les dépendances
npm install

# Lancez l'application en mode développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📖 Utilisation

### 1. Importer des fichiers
- **Glisser-déposer** : Déposez vos fichiers PDF ou images directement dans l'interface
- **Bouton "Ajouter"** : Cliquez pour sélectionner des fichiers via l'explorateur
- **Formats supportés** : PDF, JPG, JPEG, PNG

### 2. Organiser vos pages
- **Glisser-déposer** : Réordonnez les pages en les faisant glisser
- **Sélection multiple** : Maintenez Ctrl/Cmd pour sélectionner plusieurs pages
- **Rotation** : Cliquez sur l'icône de rotation pour faire pivoter une page

### 3. Personnaliser
- **Ouvrez les réglages** : Cliquez sur l'icône ⚙️ en haut à droite
- **Filigrane** : Activez et personnalisez le texte, la couleur et l'opacité
- **Nom du fichier** : Modifiez le nom du document final

### 4. Exporter
- **Cliquez sur "Télécharger"** : Votre PDF modifié sera généré et téléchargé automatiquement
- **Format préservé** : Qualité et résolution d'origine maintenues

## 🛠️ Développement

### Scripts disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement

# Build
npm run build        # Construit l'application pour la production

# Preview
npm run preview      # Prévisualise la version de production
```

### Structure du projet

```
pdflow/
├── components/       # Composants React réutilisables
│   ├── Button.tsx
│   ├── DropZone.tsx
│   ├── PreviewModal.tsx
│   ├── SettingsPanel.tsx
│   └── SortablePage.tsx
├── services/         # Services métier
│   └── pdfService.ts
├── types.ts          # Types TypeScript
├── App.tsx           # Composant principal
├── index.tsx         # Point d'entrée React
├── index.css         # Styles globaux
└── index.html        # Template HTML
```

## 🌐 Déploiement

PDFlow est optimisé pour le déploiement avec **Nixpacks** via **Dokploy** :

### Configuration Nixpacks
Le fichier `nixpacks.toml` est préconfiguré pour :
- Utiliser Node.js 24
- Installer automatiquement les dépendances
- Builder l'application
- Servir les fichiers statiques

### Déploiement rapide
1. Poussez votre code sur votre repository Git
2. Connectez Dokploy à votre repository
3. Déployez automatiquement avec Nixpacks

## 🛠️ Technologies

- **Frontend** : React 19, TypeScript, Vite
- **Styling** : Tailwind CSS, Framer Motion
- **PDF Processing** : PDF.js, pdf-lib
- **UI/UX** : Lucide React icons, @dnd-kit (drag & drop)
- **Build** : Vite, PostCSS, Autoprefixer

## 📄 Licence

Ce projet est développé par **IRREDUCTIA By Mariani Studio**.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Soumettre des pull requests

## 📞 Support

Pour toute question ou support :
- Email : contact@irreductia.com
- Site web : https://irreductia.com

---

<div align="center">
  <p><strong>Fait avec ❤️ par IRREDUCTIA By Mariani Studio</strong></p>
  <p>🔒 Vos données restent privées • 🚀 Performance optimale • 🎨 Interface moderne</p>
</div>
