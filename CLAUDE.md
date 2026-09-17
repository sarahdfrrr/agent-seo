# Agent SEO — NeoSkills Academy

Ce projet est un **Agent Claude Code** spécialisé en stratégie et rédaction SEO, construit pour l'exercice de formation "Créer un Agent pour automatiser votre quotidien professionnel".

## Ce que fait cet agent

Il construit une stratégie de contenu SEO orientée business (pas de la vanité metric) puis rédige les articles :

1. **Contexte** (`seo-agent/agents/*.md`) — qui on est, ce qu'on vend, à qui, avec quel ton, face à quels concurrents. Toujours lu en premier par les skills.
2. **Skills** (`.claude/skills/`) — les 3 capacités de l'agent :
   - `seo-strategy` — recherche de mots-clés, analyse concurrentielle, priorisation, backlog (7 phases)
   - `seo-writer` — brief 10x + rédaction d'article optimisé SEO à partir du backlog
   - `seo-audit` — check technique (indexation, Core Web Vitals, cannibalisation, maillage)
3. **Outils / accès** — MCP et API connectables pour enrichir l'agent avec des données live (voir `seo-agent/README.md` section Prérequis) :
   - **Ahrefs** (MCP) : volumes de recherche, KD, positions, analyse concurrents
   - **Google Search Console** : positions et trafic organique réels
   - **Notion** (optionnel) : publication directe du backlog et des articles
   - **Google Drive** (déjà connecté dans cette session) : lecture de transcripts de calls pour enrichir `icp-bible.md`
   - Sans ces accès, l'agent fonctionne en mode dégradé : l'utilisateur fournit les données manuellement (voir tableau "Mode dégradé" dans le README)

## Structure

```
agent-seo/
├── CLAUDE.md                      ← ce fichier
├── RAPPORT-EXERCICE.md            ← compte-rendu des 3 étapes de l'exercice
├── .claude/skills/                ← skills actifs de cette session Claude Code
│   ├── seo-strategy/SKILL.md
│   ├── seo-writer/SKILL.md
│   └── seo-audit/SKILL.md
└── seo-agent/                     ← le kit (distribuable tel quel sur un autre projet)
    ├── README.md                  ← doc complète (prérequis, MCP, FAQ)
    ├── SETUP.md                   ← guide de remplissage des fichiers contexte
    ├── skills/                    ← copie "source" des skills (identique à .claude/skills, chemins relatifs à seo-agent/)
    ├── agents/                    ← fichiers de contexte (ICP, produits, concurrents, ton...)
    └── content/blog/              ← articles générés
```

> Pourquoi deux copies des skills ? `seo-agent/` est pensé comme un kit portable : on peut copier tout le dossier dans un autre repo. `.claude/skills/` est la copie que **cette session Claude Code** charge réellement, avec les chemins ajustés (`seo-agent/agents/...` au lieu de `agents/...`) puisque la racine du projet est `agent-seo/` et non `agent-seo/seo-agent/`.

## Comment utiliser l'agent

```
Construis ma stratégie SEO complète pour le prochain trimestre.
Lis tous les fichiers dans seo-agent/agents/ puis déroule les 7 phases du skill seo-strategy.
```

```
Rédige l'article #3 du backlog.
```

```
Fais un audit technique du site.
```

## Règles importantes pour l'agent

- Toujours lire `seo-agent/agents/product-marketing-context.md` en premier — c'est le point d'entrée vers tout le reste du contexte.
- Ne jamais recommander un keyword sans le rattacher à un produit de `seo-agent/agents/products.md` (filtre produit obligatoire).
- Ne jamais écrire un article sans ancrage ICP (`seo-agent/agents/icp-bible.md`) — voir skill `seo-writer`.
- Les données dans `seo-agent/agents/*.md` sont **fictives** (NeoSkills Academy, exemple pour l'exercice de formation). Pour un usage réel, remplacer leur contenu par les vraies données du business — la méthode et les skills restent inchangés.
