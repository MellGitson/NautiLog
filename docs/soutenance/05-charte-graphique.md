# Charte Graphique : NautiLog

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**Version du document :** 1.0

---

## Sommaire

1. Direction artistique
2. Palette de couleurs
3. Typographie
4. Composants UI
5. Grille et layout
6. Principes UX et accessibilité

---

## 1. Direction artistique

### 1.1 Positionnement

NautiLog adopte une identité visuelle **nautique et épurée**, inspirée des codes de la navigation de plaisance méditerranéenne : bleus océaniques dominants, touches corail évoquant les couchers de soleil sur le littoral, typographie mêlant une sérif élégante (titres) et une sans-serif moderne (contenu courant). L'objectif est de transmettre confiance et clarté : une application de gestion de flotte doit d'abord être lisible et rassurante, avant d'être décorative.

### 1.2 Principes directeurs

| Principe | Application concrète |
|---|---|
| Clarté avant tout | Fond dégradé doux, contrastes de texte élevés, hiérarchie typographique stricte (H1/H2 en police display) |
| Cohérence systématique | Un unique fichier de classes composants (`index.css`) centralise boutons, cartes, badges ; aucune divergence de style dispersée dans les pages |
| Feedback visuel discret | Micro-animations sur interaction (translation légère au survol, effet de brillance sur les boutons) sans surcharger l'interface |
| Sobriété fonctionnelle | Deux familles de couleurs seulement (ocean/coral) + une teinte neutre (amber) réservée aux états d'alerte |

---

## 2. Palette de couleurs

### 2.1 Nuancier `ocean` (couleur principale)

Utilisée pour les textes, la structure, les actions principales et les états neutres/positifs (ex. badge "Disponible").

| Teinte | Code hexadécimal | Usage principal |
|---|---|---|
| ocean-50 | `#f0f9fc` | Fonds très clairs, dégradé de page |
| ocean-100 | `#daf1f7` | Fonds de badge, bordures de carte |
| ocean-200 | `#b8e4ef` | Bordures au survol |
| ocean-300 | `#86d0e2` | — |
| ocean-400 | `#4bb3cd` | Anneaux de focus (accessibilité clavier) |
| ocean-500 | `#2896b3` | Icônes, accents |
| ocean-600 | `#1f7896` | Boutons primaires, liens |
| ocean-700 | `#1e6179` | Hover boutons primaires, texte de badge |
| ocean-800 | `#1f5065` | Titres H2 |
| ocean-900 | `#1d4356` | Titres H1, texte fort |
| ocean-950 | `#0f2b39` | Texte de base du corps de page |

### 2.2 Nuancier `coral` (couleur d'accent)

Utilisée pour les actions secondaires/accentuées, les alertes et messages d'erreur, les états "Loué".

| Teinte | Code hexadécimal | Usage principal |
|---|---|---|
| coral-50 | `#fff2ee` | Fonds de badge clair |
| coral-100 | `#ffe1d6` | Fonds de badge "Loué" |
| coral-200 | `#ffc4ae` | — |
| coral-300 | `#ff9c76` | — |
| coral-400 | `#ff7a4d` | — |
| coral-500 | `#f8552a` | Boutons d'accent, liens au survol |
| coral-600 | `#e53a15` | Hover boutons d'accent, texte d'erreur (`role="alert"`) |
| coral-700 | `#bf2a11` | Texte de badge "Loué" |
| coral-800 | `#992415` | — |
| coral-900 | `#7c2114` | — |

### 2.3 Couleur tertiaire

Une teinte `amber` (Tailwind par défaut, non personnalisée) est réservée exclusivement à l'état "En réparation" (badge et boutons de statut), pour ne pas surcharger la palette principale avec une troisième famille de teintes personnalisées.

### 2.4 Fond de page

Dégradé diagonal appliqué au corps de toutes les pages, fixe au scroll :

```css
background-image: linear-gradient(135deg, #daf1f7 0%, #ffffff 45%, #ffe1d6 100%);
```

Transition douce de l'ocean clair (haut-gauche) vers le blanc (centre) puis le corail clair (bas-droite), évoquant un horizon marin sans jamais nuire à la lisibilité du texte posé dessus.

---

## 3. Typographie

### 3.1 Familles de polices

| Rôle | Police | Graisses chargées | Usage |
|---|---|---|---|
| Display (titres) | Playfair Display (serif) | 600, 700 | Titres H1, H2 |
| Texte courant | Inter (sans-serif) | 400, 500, 600, 700 | Corps de texte, boutons, labels, navigation |

Les deux polices sont chargées via Google Fonts (`fonts.googleapis.com`), avec préconnexion (`preconnect`) pour limiter l'impact sur le temps de chargement initial.

### 3.2 Échelle typographique

| Élément | Classes Tailwind | Rendu |
|---|---|---|
| H1 | `font-display text-3xl md:text-4xl font-bold text-ocean-900` | Playfair Display, 30px → 36px (responsive), gras, ocean-900 |
| H2 | `font-display text-2xl font-semibold text-ocean-800` | Playfair Display, 24px, semi-gras, ocean-800 |
| Corps de texte | `font-sans` (hérité du `body`) | Inter, taille par défaut, ocean-950 |
| Liens | `text-ocean-600 hover:text-coral-500 transition-colors` | Inter, transition de couleur fluide au survol |

### 3.3 Pourquoi ce choix

L'association d'une serif élégante pour les titres et d'une sans-serif géométrique pour le contenu est un choix classique d'éditorial numérique : la Playfair Display apporte une touche de caractère et d'élégance cohérente avec l'univers de la navigation de plaisance haut de gamme, tandis qu'Inter garantit une excellente lisibilité à toutes les tailles pour les données fonctionnelles (formulaires, tableaux, listes de bateaux).

---

## 4. Composants UI

L'ensemble des composants réutilisables est centralisé dans une seule couche `@layer components` (Tailwind), garantissant une cohérence stricte sur tout le site sans duplication de classes utilitaires page par page.

### 4.1 Boutons

| Variante | Fond | Texte | Usage |
|---|---|---|---|
| `.btn-primary` | ocean-600 (hover ocean-700) | Blanc | Action principale (valider, créer, se connecter) |
| `.btn-accent` | coral-500 (hover coral-600) | Blanc | Action accentuée (ex. suppression, action forte) |
| `.btn-ghost` | Blanc translucide + bordure ocean-200 | ocean-700 | Action secondaire (annuler, basculer une vue) |

Tous les boutons partagent une base commune (`.btn`) : forme pilule (`rounded-full`), effet de brillance diagonale au survol (dégradé animé), légère translation verticale (`-translate-y-0.5`) et réduction d'échelle au clic (`active:scale-[0.98]`), anneau de focus visible (`focus-visible:ring-2 ring-ocean-400`) pour l'accessibilité clavier.

### 4.2 Cartes

| Classe | Comportement |
|---|---|
| `.card` | Fond blanc translucide avec flou d'arrière-plan (`backdrop-blur-sm`), coins arrondis (`rounded-2xl`), ombre légère qui s'accentue au survol |
| `.card-interactive` | Étend `.card` avec une translation verticale au survol et un curseur pointeur, pour les cartes cliquables (ex. carte de bateau, carte de port) |

### 4.3 Champs de formulaire

| Classe | Détail |
|---|---|
| `.input-field` | Bordure ocean-200, fond blanc translucide, anneau de focus ocean-400 |
| `.label-field` | Label au-dessus du champ, texte ocean-700, semi-gras |

### 4.4 Badges de statut

| Classe | Fond | Texte | Signification |
|---|---|---|---|
| `.badge-disponible` | ocean-100 | ocean-700 | Bateau disponible à la location |
| `.badge-loue` | coral-100 | coral-700 | Bateau actuellement loué |
| `.badge-reparation` | amber-100 | amber-700 | Bateau en réparation |

### 4.5 Cadre photo

`.photo-frame` : ratio fixe 4:3, coins arrondis en haut uniquement (pensé pour surmonter une carte), effet de zoom léger sur l'image au survol du parent (`scale-105`).

---

## 5. Grille et layout

### 5.1 Breakpoints

Le projet utilise les breakpoints par défaut de Tailwind CSS, sans surcharge personnalisée :

| Breakpoint | Largeur minimale | Usage type dans NautiLog |
|---|---|---|
| `sm` | 640px | Grilles de cartes passant de 1 à 2 colonnes |
| `md` | 768px | Ajustement de la taille des titres (H1) |
| `lg` | 1024px | Grilles de cartes passant à 3 colonnes, layouts carte + panneau latéral |

### 5.2 Grilles types observées

| Contexte | Comportement responsive |
|---|---|
| Liste de bateaux/ports (vue grille) | 1 colonne (mobile) → 2 colonnes (`sm`) → 3 colonnes (`lg`) |
| Carte interactive + panneau latéral (météo, emplacements) | Empilé verticalement (mobile) → grille `[1fr_16rem]` ou `[1fr_18rem]` côte à côte (`lg`) |
| Dashboard admin (KPIs) | Grille 2 colonnes (mobile) → 4 colonnes (`sm`) |

### 5.3 Navigation

La barre de navigation (`NavBar.jsx`) est responsive avec un menu burger sur mobile (`aria-expanded` dynamique) et une barre horizontale classique sur desktop, incluant un indicateur de rôle (avatar coloré) et un badge de compteur de notifications non lues.

---

## 6. Principes UX et accessibilité

### 6.1 Principes UX

| Principe | Mise en œuvre |
|---|---|
| Feedback immédiat | États de chargement explicites ("Chargement…"), messages de succès/erreur avec `role="status"`/`role="alert"` |
| Prévention des erreurs silencieuses | Aucun état vide non expliqué : un message clair remplace systématiquement une section qui n'a rien à afficher (ex. "Aucun emplacement libre actuellement pour ce port") |
| Cohérence des interactions | Les mêmes patterns (carte cliquable, badge de statut, bouton pilule) sont répétés dans tout le site plutôt que réinventés par page |
| Progressive disclosure | Les fonctionnalités avancées (gestion admin, demande d'emplacement) n'apparaissent que pour les rôles concernés, sans encombrer l'interface des autres utilisateurs |

### 6.2 Accessibilité (RGAA)

| Élément | Implémentation |
|---|---|
| Lien d'évitement | Skip-link "Aller au contenu principal" en tout début de page, ciblant `#contenu-principal` |
| Navigation clavier | Anneaux de focus visibles (`focus-visible:ring-2`) sur tous les éléments interactifs (boutons, champs, cartes cliquables) |
| Menu mobile accessible | `aria-expanded` et `aria-label` dynamiques sur le bouton burger |
| Modales | `aria-modal`, `aria-labelledby` sur les fenêtres de confirmation et la lightbox photo |
| Icônes décoratives | `aria-hidden="true"` sur les pictogrammes n'apportant pas d'information supplémentaire au texte |
| Contraste | Les teintes foncées (ocean-700 à 950, coral-600 à 900) sont réservées au texte, garantissant un contraste suffisant sur les fonds clairs de la palette |

### 6.3 Limite assumée

Un audit RGAA complet (contrastes mesurés, tests lecteur d'écran, parcours clavier exhaustif) n'a pas été mené formellement : seuls les marqueurs structurels de base (skip-link, ARIA, focus visible) ont été implémentés systématiquement. Ce périmètre est cohérent avec les exigences du référentiel CDA (interfaces "respectant le RGAA" sans exiger une conformité totale certifiée), et documenté comme un axe d'amélioration possible plutôt qu'un oubli.
