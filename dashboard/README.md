# Pulse — Dashboard marketing

Dashboard marketing centralisé et interactif : Google Analytics (GA4), SEO
(Search Console), Google Ads, Email (Mailchimp) et réseaux sociaux organiques
(LinkedIn, Instagram, YouTube) au même endroit, avec vue jour/semaine/mois.

Construit avec Next.js 16 (App Router), TypeScript, Tailwind CSS v4 et
Recharts. Pensé pour être déployé sur Vercel.

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # optionnel : à remplir seulement si tu actives des données live
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Données : démo par défaut, réelles quand tu es prêt

Au lancement, **tous les canaux tournent sur un jeu de données de démo**
réaliste (tendances, saisonnalité hebdomadaire, pics) généré côté serveur —
rien à configurer pour explorer le dashboard.

Chaque canal peut basculer sur ses vraies données **indépendamment des
autres**, via une variable d'environnement `DATA_SOURCE_*` :

| Canal | Variable | Bascule vers le live avec |
|---|---|---|
| Google Analytics (GA4) | `DATA_SOURCE_GA4` | `GA4_PROPERTY_ID` + compte de service Google |
| SEO (Search Console) | `DATA_SOURCE_SEO` | `GSC_SITE_URL` + compte de service Google |
| Google Ads | `DATA_SOURCE_ADS` | `GOOGLE_ADS_*` (developer token, OAuth, customer id) |
| Email (Mailchimp) | `DATA_SOURCE_EMAIL` | `MAILCHIMP_API_KEY` + `MAILCHIMP_LIST_ID` |
| Réseaux sociaux | `DATA_SOURCE_SOCIAL` | connecteurs LinkedIn / Instagram / YouTube (voir ci-dessous) |

Mets `DATA_SOURCE_GA4=live` (etc.) dans tes variables d'environnement une
fois les identifiants renseignés — voir `.env.example` pour la liste
complète et le détail de chaque identifiant (où le trouver, quelles
autorisations donner). Si un appel live échoue (identifiant manquant, quota,
etc.), le dashboard retombe automatiquement sur les données de démo pour ce
canal et log l'erreur côté serveur, plutôt que de casser la page.

Le badge « données live / données de démo » sur chaque page indique la
source réellement utilisée.

**Statut des connecteurs :**
- **GA4, Search Console, Google Ads, Mailchimp** : entièrement câblés
  (`lib/integrations/`). Renseigne les identifiants et bascule le
  `DATA_SOURCE_*` correspondant.
- **Réseaux sociaux (LinkedIn, Instagram, YouTube)** : les appels API sont
  écrits individuellement (`lib/integrations/social/*.ts`) mais le point de
  combinaison en un flux quotidien unique n'est pas encore branché dans
  `lib/data/getChannelData.ts` — chaque plateforme a son propre format de
  réponse et son propre processus d'approbation d'app (LinkedIn Community
  Management API, Meta App Review, YouTube Analytics OAuth), donc à finaliser
  au cas par cas. Le canal reste sur données de démo en attendant.

## Accès

Le dashboard n'a pas d'écran de connexion : toute personne qui a l'URL peut
le consulter. Adapté à un usage sur une URL privée non partagée largement.
Si tu déploies sur Vercel et veux restreindre l'accès, active la
**Vercel Authentication** (ou la protection par mot de passe, selon ton
plan) dans Project Settings > Deployment Protection — aucune modification
du code n'est nécessaire.

## Déploiement sur Vercel

1. Pousse ce dossier sur GitHub (déjà fait si tu es dans ce repo).
2. Sur [vercel.com/new](https://vercel.com/new), importe le repo et indique
   `dashboard` comme *Root Directory*.
3. Si tu actives des données live, ajoute les variables d'environnement
   correspondantes de `.env.example` dans Project Settings > Environment
   Variables.
4. Déploie. Aucune configuration supplémentaire n'est nécessaire — le projet
   est un Next.js standard.

## Structure du projet

```
dashboard/
├── app/
│   ├── (dashboard)/        Layout + pages (vue d'ensemble, un dossier par canal)
│   └── api/data/[channel]/ Endpoint JSON (mêmes données que l'UI)
├── components/
│   ├── charts/               Line/Bar/Sparkline (Recharts, palette validée accessibilité)
│   ├── dashboard/             Sidebar, filtres, cartes KPI, tables
│   └── ui/                     Primitives (Card, Badge)
└── lib/
    ├── mock/                  Générateur de données de démo (déterministe)
    ├── integrations/          Connecteurs API réels par canal
    ├── data/                  Agrégation KPI, config par canal, assemblage des pages
    └── utils/                 Dates, formatage, filtres d'URL
```

## KPI suivis par canal

- **Analytics (GA4)** : sessions, utilisateurs, nouveaux utilisateurs, pages
  vues, taux d'engagement, taux de rebond, durée moyenne de session,
  conversions, taux de conversion, revenu — plus la répartition par canal
  d'acquisition et par appareil.
- **SEO** : clics, impressions, CTR, position moyenne, sessions organiques,
  pages indexées — plus meilleures requêtes, meilleures pages et
  distribution des positions.
- **Google Ads** : dépense, impressions, clics, CTR, CPC, conversions, coût
  par conversion, ROAS — plus le détail par campagne.
- **Email (Mailchimp)** : abonnés, nouveaux abonnés, désabonnements,
  campagnes envoyées, taux d'ouverture et de clic moyens — plus les
  dernières campagnes.
- **Réseaux sociaux** : abonnés totaux, nouveaux abonnés, impressions,
  engagements, taux d'engagement, vues vidéo (YouTube) — plus la répartition
  par plateforme et les meilleurs posts.

Chaque page propose un filtre de période (7/30/90 jours, mois en cours,
trimestre en cours, 12 mois) et un regroupement jour / semaine / mois, avec
comparaison automatique à la période précédente.
