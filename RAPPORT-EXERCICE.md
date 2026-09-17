# Rapport d'exercice — Créer un Agent SEO

**Objectif de l'exercice :** créer un Agent IA pour automatiser une partie du quotidien professionnel, en suivant 3 étapes : contexte, capacités (skills + outils), test et optimisation.

**Outil utilisé :** Claude Code, sur le repo `agent-seo`.

**Cas d'usage choisi :** SEO — le repo contenait déjà un kit de démarrage ("Agent SEO") avec des templates de contexte vides et 2 skills. J'ai choisi de le compléter avec un exemple métier fictif complet plutôt que de repartir de zéro, pour démontrer les 3 étapes sur un cas réaliste et bouclé de bout en bout.

**Entreprise fictive :** NeoSkills Academy — organisme de formation professionnelle (Qualiopi, éligible CPF) qui propose 3 bootcamps courts : IA Appliquée, Marketing Opérationnel, et Reconversion Data & IA.

---

## Étape 1 — Contexte de l'agent

Le contexte est ce qui transforme un modèle générique en agent spécialisé sur un business précis. J'ai rempli les 7 fichiers de `seo-agent/agents/` :

| Fichier | Contenu |
|---------|---------|
| `product-marketing-context.md` | Identité de l'entreprise, positionnement, ICP résumé |
| `products.md` | Catalogue des 3 produits avec prix, programme détaillé (source des mots-clés) |
| `icp-bible.md` | 6 pain points documentés avec verbatims, triggers d'achat, objections, langage naturel, segmentation par univers produit |
| `voice-tone.md` | Vouvoiement, ton direct et praticien, phrases signatures, ce qu'on évite |
| `competitors.md` | 4 concurrents (LiveMentor, OpenClassrooms, DataScientest, Le Wagon) avec matrice comparative |
| `competitors-seo.md` | Analyse SEO détaillée des 3 concurrents directs (DR, top pages, gaps) |
| `channels-seo.md` | Inventaire du contenu SEO existant (volontairement pauvre — un vrai site qui démarre) |

**Choix méthodologique :** l'ICP bible est le fichier le plus dense, car c'est celui qui évite le piège n°1 d'un agent de contenu — produire des articles génériques qui ne convertissent pas. Chaque pain point est rattaché à un univers produit précis (IA / Marketing / Reconversion) pour ne jamais mélanger les angles.

---

## Étape 2 — Capacités : skills et accès aux outils

### Skills

Le kit contenait 2 skills (`seo-strategy`, `seo-writer`) qui référençaient un 3ᵉ skill (`seo-audit`) jamais créé. Je l'ai créé pour compléter la capacité de l'agent :

| Skill | Rôle |
|-------|------|
| `seo-strategy` | Recherche de mots-clés par cluster produit, analyse concurrentielle, scoring et priorisation, backlog (7 phases) |
| `seo-writer` | Brief 10x + rédaction d'article optimisé SEO à partir d'une entrée du backlog |
| `seo-audit` *(créé pour l'exercice)* | Check technique : indexation, Core Web Vitals, cannibalisation, maillage interne — la couche diagnostic qui manquait |

Les 3 skills sont installés dans `.claude/skills/` (chargés automatiquement par Claude Code sur ce repo) et déclenchés par leur `description` YAML sur des mots-clés naturels ("stratégie SEO", "rédige l'article", "audit technique"...).

### Accès aux outils (API / MCP)

| Outil | Statut dans cet exercice | Ce qu'il apporte |
|-------|---------------------------|-------------------|
| **Ahrefs (MCP)** | Non connecté (pas de compte pour l'exercice) — mode dégradé documenté dans `seo-agent/README.md` | Volumes de recherche, KD, positions concurrents en temps réel |
| **Google Search Console** | Non connecté — mode dégradé | Positions et trafic organique réels du site |
| **Google Drive (MCP)** | **Connecté** dans cette session Claude Code | Utilisable pour lire de vrais transcripts d'appels commerciaux et enrichir `icp-bible.md` automatiquement |
| **Notion** | Non connecté | Publication directe du backlog et des articles |

Sans Ahrefs/GSC, l'agent a travaillé en mode dégradé pour le test (étape 3) : volumes et positions estimés manuellement à la place de données live, comme le prévoit le tableau "Mode dégradé" du README du kit.

---

## Étape 3 — Test de l'agent et optimisations

### Ce qui a été testé

1. **Exécution du skill `seo-strategy`** sur le contexte NeoSkills Academy → production d'un backlog de 23 articles priorisés (`seo-agent/agents/seo-backlog.md`), scorés et classés en tiers S/A/B/C, avec plan d'exécution sur 3 mois et une liste de keywords rejetés avec justification.
2. **Exécution du skill `seo-writer`** sur l'article #1 du backlog ("ChatGPT vs Claude vs Gemini") → article complet publié dans `seo-agent/content/blog/chatgpt-vs-claude-vs-gemini.md`, avec ancrage ICP explicite, intro en framework PAS, tableau de décision, FAQ, et auto-évaluation E-E-A-T.

### Ce que le test a révélé (et les ajustements faits)

- **Skill manquant repéré à l'usage** : `seo-strategy` renvoyait vers un skill `seo-audit` inexistant. Sans ce test, le trou serait resté invisible jusqu'à ce qu'un utilisateur demande un audit technique. → Créé.
- **Chemins de fichiers à adapter selon la racine du projet** : les skills du kit utilisent des chemins relatifs (`agents/...`) pensés pour un usage où `seo-agent/` est la racine du repo. Ici la racine réelle est `agent-seo/`. → Créé une copie des skills dans `.claude/skills/` avec les chemins ajustés (`seo-agent/agents/...`), en gardant la version originale dans `seo-agent/skills/` comme kit portable/distribuable.
- **Maillage interne insuffisant sur le tout premier article** : le skill `seo-writer` exige 3-5 liens internes, mais un blog qui démarre n'a presque pas de contenu existant vers lequel lier — seuls 2 liens ont pu être placés de façon honnête (page produit + article CPF existant). C'est une limite structurelle réelle, pas un bug du skill : le maillage interne se densifiera mécaniquement à mesure que le backlog se remplit. À surveiller à l'article #5-6.
- **Le scoring révèle des arbitrages contre-intuitifs** : deux définitions à fort volume ("agent IA", "prompt engineering définition", 2 100 et 3 500 recherches/mois) ont été reléguées en tier C/rejetées à cause du "mur DR" (Wikipedia et médias dominent ces SERP) — ce qui confirme l'intérêt du filtre anti-vanity-metrics du skill : sans lui, un backlog naïf aurait mis ces deux mots-clés en tête.

### Prochaine itération recommandée

1. Connecter Ahrefs et GSC pour remplacer les volumes/positions estimés par des données live sur les 23 mots-clés du backlog.
2. Rédiger les articles #2 à #6 (tier S restant) pour densifier le maillage interne avant de passer au tier A.
3. Lancer un premier passage du skill `seo-audit` une fois 5-6 articles publiés, pour vérifier indexation et absence de cannibalisation entre les 3 clusters produit.

---

## Fichiers livrés

```
agent-seo/
├── CLAUDE.md                                          (nouveau)
├── RAPPORT-EXERCICE.md                                (nouveau, ce fichier)
├── .claude/skills/{seo-strategy,seo-writer,seo-audit} (nouveau)
└── seo-agent/
    ├── README.md                                      (mis à jour)
    ├── skills/seo-audit/SKILL.md                      (nouveau)
    ├── agents/*.md                                     (7 fichiers, remplis)
    └── content/blog/chatgpt-vs-claude-vs-gemini.md     (nouveau, article de test)
```
