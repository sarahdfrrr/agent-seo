# Agent SEO — Kit de demarrage

Un agent IA qui construit et execute votre strategie SEO de A a Z : etat des lieux, recherche de keywords, priorisation, briefs et redaction d'articles optimises.

---

## Ce que fait cet agent

```
Vos donnees (ICP, produits, concurrents)
    ↓
Phase 1 : Etat des lieux SEO
    ↓
Phase 2 : Recherche de keywords par cluster produit
    ↓
Phase 3 : Analyse concurrentielle SEO
    ↓
Phase 4 : Scoring et priorisation
    ↓
Phase 5 : Backlog priorise (50+ articles)
    ↓
Phase 6 : Calendrier editorial par phase
    ↓
Phase 7 : Briefs 10x + redaction des articles
    ↓
Articles prets a publier (fichiers .md ou Notion)
```

---

## Prerequis

### 1. Claude Code (obligatoire)

L'agent tourne dans Claude Code. Installez-le depuis [claude.ai/code](https://claude.ai/code).

### 2. MCP Ahrefs (recommande)

L'integration Ahrefs donne acces aux donnees SEO live :
- Volumes de recherche et KD (Keyword Difficulty)
- Positions actuelles de votre site
- Analyse des concurrents (keywords, pages, backlinks)
- People Also Ask, related terms
- Domain Rating, referring domains

**Configuration :** Parametres Claude Code > Extensions > Ahrefs > Connecter votre compte.

**Sans Ahrefs :** Vous pouvez quand meme utiliser l'agent pour la partie redaction (Phase 7), mais les phases de recherche et priorisation (Phases 2-6) seront limitees. Vous devrez fournir manuellement les donnees de keywords (volumes, KD) depuis des outils gratuits comme Ubersuggest, Google Keyword Planner, ou AnswerThePublic.

### 3. Google Search Console (recommande)

L'integration GSC fournit vos donnees de performance reelles :
- Keywords sur lesquels vous rankez deja
- Pages qui generent du trafic organique
- Positions moyennes, CTR, impressions
- Evolution dans le temps

**Configuration :** MCP GSC via Ahrefs ou integration directe.

**Sans GSC :** L'agent peut travailler sans, mais l'etat des lieux (Phase 1) sera moins precis. Vous devrez fournir manuellement vos donnees de trafic organique.

### 4. Notion (optionnel)

Pour envoyer le backlog et les articles directement dans Notion.

**Configuration :** Parametres Claude Code > Extensions > Notion > Connecter.

**Sans Notion :** Les articles sont generes en fichiers `.md` dans le dossier `content/blog/`.

### 5. Autres MCP utiles (optionnels)

| MCP | Usage |
|-----|-------|
| **Slack** | Recevoir des notifications quand un article est pret |
| **Google Drive** | Lire des transcripts de calls stockes sur Drive |
| **HubSpot** | Extraire des donnees CRM pour enrichir l'ICP |

---

## Demarrage rapide

### Etape 1 — Preparez vos fichiers contexte

L'agent a besoin de comprendre votre business avant de pouvoir faire du SEO. Remplissez les templates dans le dossier `agents/` :

| Fichier | Quoi | Sources |
|---------|------|---------|
| `product-marketing-context.md` | Votre entreprise, vos produits, votre positionnement | Votre site, vos LP |
| `icp-bible.md` | Vos clients ideaux, leurs pains, verbatims | Transcripts de calls, CRM, enquetes |
| `voice-tone.md` | Votre ton editorial | Guidelines existantes, exemples d'articles |
| `competitors.md` | Vos concurrents directs | Votre connaissance marche |
| `competitors-seo.md` | Strategie SEO de vos concurrents | Ahrefs, analyse manuelle |
| `channels-seo.md` | Inventaire de votre contenu SEO existant | GSC, votre blog |
| `products.md` | Catalogue detaille de vos produits/services | Votre site |

> **Vous ne savez pas quoi mettre ?** C'est normal. Voir `SETUP.md` pour un guide pas-a-pas avec les prompts a utiliser pour remplir chaque fichier a partir de vos donnees brutes.

### Etape 2 — Lancez l'agent

```
Construis ma strategie SEO complete pour le prochain trimestre.
Commence par lire tous les fichiers dans agents/ puis deroule les 7 phases du skill seo-strategy.
```

### Etape 3 — Validez et iterez

L'agent presente les resultats de chaque phase avant de passer a la suivante. Validez, ajustez, puis continuez.

---

## Structure du kit

```
kit-seo-agent/
├── README.md                    ← Vous etes ici
├── SETUP.md                     ← Guide d'onboarding detaille
├── skills/
│   ├── seo-strategy/
│   │   └── SKILL.md             ← Strategie et backlog
│   ├── seo-writer/
│   │   └── SKILL.md             ← Redaction des articles
│   └── humanizer/
│       └── SKILL.md             ← Relecture anti-tics IA (a lancer sur tout texte final)
├── agents/
│   ├── product-marketing-context.md  ← Template contexte business
│   ├── icp-bible.md                  ← Template ICP
│   ├── voice-tone.md                 ← Template ton editorial
│   ├── competitors.md                ← Template concurrents
│   ├── competitors-seo.md            ← Template benchmark SEO
│   ├── channels-seo.md               ← Template inventaire SEO
│   ├── products.md                   ← Template catalogue produits
│   └── seo-backlog.md                ← Genere par l'agent
└── content/
    └── blog/                         ← Les articles atterrissent ici
```

---

## Mode degrade (sans Ahrefs/GSC)

Si vous n'avez pas acces aux MCP Ahrefs/GSC, l'agent peut quand meme vous aider :

| Phase | Avec Ahrefs/GSC | Sans Ahrefs/GSC |
|-------|-----------------|-----------------|
| Phase 1 — Etat des lieux | Automatique (positions, trafic, DR) | Manuel (vous fournissez vos donnees) |
| Phase 2 — Keywords | Recherche live (volumes, KD, PAA) | Vous fournissez les keywords + volumes |
| Phase 3 — Concurrents | Analyse live (keywords, pages, gaps) | Analyse manuelle + Google |
| Phase 4 — Scoring | Score avec KD reel | Score estime |
| Phase 5 — Backlog | Complet avec donnees live | Complet avec donnees manuelles |
| Phase 6 — Calendrier | Identique | Identique |
| Phase 7 — Briefs + redaction | Identique | Identique |

**En resume :** sans MCP, les phases de recherche demandent plus de travail manuel. Mais la strategie, la priorisation et la redaction fonctionnent a 100%.

### Outils gratuits pour remplacer Ahrefs

- **Google Keyword Planner** (gratuit avec compte Google Ads) — volumes de recherche
- **Ubersuggest** (freemium) — volumes, KD, idees de keywords
- **AnswerThePublic** (freemium) — questions People Also Ask
- **Google Search Console** (gratuit) — vos positions actuelles
- **Google Trends** (gratuit) — tendances de recherche

---

## Ou arrivent les articles ?

Par defaut, les articles sont generes en fichiers Markdown (`.md`) dans `content/blog/`. Chaque article inclut :
- Le contenu complet avec structure H1/H2/H3
- Les placeholders d'images avec descriptions et alt text
- La meta description
- Les liens internes (maillage)
- Le schema FAQ si applicable

### Alternatives de sortie

| Destination | Comment |
|-------------|---------|
| **Fichiers .md** (defaut) | Automatique, dans `content/blog/` |
| **Notion** | Connectez le MCP Notion, specifiez la page cible |
| **WordPress** | Exportez le .md puis importez (ou utilisez un plugin Markdown) |
| **Webflow / Ghost / autre CMS** | Copiez le contenu depuis le .md |

---

## FAQ

**Combien de temps pour demarrer ?**
Comptez 2-3h pour remplir les fichiers contexte (avec les prompts d'aide du SETUP.md). Ensuite l'agent deroule la strategie en ~30 min.

**Combien d'articles l'agent peut-il produire ?**
Le backlog type contient 30-60 articles. L'agent peut en rediger ~5-10 par session selon la longueur.

**L'agent remplace-t-il un expert SEO ?**
Non. Il automatise le travail de recherche, priorisation et redaction. Mais la validation strategique et l'expertise metier restent les votres. L'agent est aussi bon que le contexte que vous lui donnez.

**Puis-je l'utiliser pour un client ?**
Oui. Creez un dossier par client avec ses propres fichiers contexte dans `agents/`.
