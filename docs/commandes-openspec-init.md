# Commandes utilisées pour initialiser ce dépôt

Référence rapide des commandes exécutées et de leur rôle. Documentation principale : [OpenSpec sur GitHub](https://github.com/Fission-AI/OpenSpec).

| Commande | Rôle |
|----------|------|
| `npm install -g @fission-ai/openspec@latest` | Installe le CLI `openspec` globalement (Node.js requis, voir [prérequis][gs]). Paquet npm : [@fission-ai/openspec][npm]. Alternatives d’installation : [installation.md][install]. |
| `openspec init --tools cursor` | Initialise la structure du projet (`openspec/`, specs, changes) et génère l’intégration **Cursor** (skills + commandes dans `.cursor/`) sans prompts interactifs. Détail : [`openspec init`][cli-init]. Outils supportés : [supported-tools.md][st]. |
| `openspec config profile` | Ouvre le réglage **global** du profil : mode de livraison (skills seuls, commandes seules, ou les deux) et workflows activés (propose, explore, apply, archive, etc.). Sans changement, ne modifie rien mais permet de vérifier l’état. Détail : [`openspec config`][cli-config]. |
| `openspec completion install` | Installe ou met à jour les **complétions shell** pour taper `openspec` + Tab (zsh détecté). Détail : [`openspec completion`][cli-completion]. |

[gs]: https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md
[npm]: https://www.npmjs.com/package/@fission-ai/openspec
[install]: https://github.com/Fission-AI/OpenSpec/blob/main/docs/installation.md
[cli-init]: https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md#openspec-init
[st]: https://github.com/Fission-AI/OpenSpec/blob/main/docs/supported-tools.md
[cli-config]: https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md#openspec-config
[cli-completion]: https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md#openspec-completion

**Voir aussi** : [Référence CLI complète](https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md), [commandes slash / skills](https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md), workflow [opsx](https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md).

Après mise à jour du CLI : `openspec update` dans le projet pour régénérer les fichiers d’instructions alignés sur le profil global ([`openspec update`](https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md#openspec-update)).
