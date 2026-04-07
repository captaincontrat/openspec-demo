# openspec-demo

Ce dépôt sert à générer, avec **Cursor** et **OpenSpec**, un projet de démonstration où cinq personnes travaillent en parallèle sur un système composé de quatre microservices et d'un **BFF**. L'application visée est un moniteur d'événements naturels centré sur l'API **NASA EONET**, enrichi par d'autres APIs publiques gratuites en temps réel (géolocalisation, météo, qualité de l'air), afin de montrer comment OpenSpec fait émerger les responsabilités de chaque service et les informations qu'ils doivent partager, sans données mockées.

## Première utilisation (après `git clone`)

Des scripts d'initialisation sont disponibles pour automatiser la première configuration :

- **macOS / Linux** : `./init-project.sh`
- **Windows (PowerShell)** : `.\init-project.ps1`

Ces scripts :
- vérifient **Node.js** 20.19+
- installent ou mettent à jour `@fission-ai/openspec`
- installent `openspec completion`

Si vous préférez faire les étapes manuellement :

1. **Node.js** 20.19+ — [nodejs.org](https://nodejs.org/) (installateur LTS pour Mac ou Windows).
2. `npm install -g @fission-ai/openspec@latest`
3. `openspec completion install`
4. Ouvrir ce dépôt dans **Cursor**.

Pas besoin de `openspec init` dans ce dépôt : la structure OpenSpec est déjà versionnée.

Détail : [docs/commandes-openspec-init.md](docs/commandes-openspec-init.md).
