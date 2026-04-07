# Vérification et préparation avant workshop

Ce dossier contient les scripts du facilitateur pour vérifier les APIs publiques utilisées pendant le workshop puis préparer la branche de base des participants.

## Commande recommandée

Le point d'entrée recommandé est `prepare-workshop.sh`. Il doit être exécuté au tout début du workshop, depuis la racine du dépôt.

Commande :

```bash
./workshop/prepare-workshop.sh
```

Ce script :

- lance tous les checks d'APIs publiques
- crée une branche datée par défaut au format `workshop-YYYY-MM-DD`
- supprime le dossier `workshop/` dans cette nouvelle branche
- crée un commit dédié pour que les branches des participants n'héritent pas des fichiers du facilitateur

Si l'un des checks échoue, il faut résoudre le problème d'accès réseau ou d'API avant de continuer le workshop.

## Scripts disponibles

- `run-all.sh` : lance uniquement les 4 checks d'APIs publiques
- `prepare-workshop-branch.sh` : crée uniquement la branche datée et supprime `workshop/`
- `prepare-workshop.sh` : enchaîne les checks d'API puis la préparation de la branche

Les checks d'APIs publiques couvrent :

- `01-check-nasa-eonet.sh`
- `02-check-nominatim.sh`
- `03-check-open-meteo-weather.sh`
- `04-check-open-meteo-air-quality.sh`

## Options utiles

Pour simuler la préparation sans modifier Git :

```bash
./workshop/prepare-workshop.sh --dry-run
```

Pour imposer un nom de branche précis :

```bash
./workshop/prepare-workshop.sh --branch workshop-2026-04-07
```

## Après la préparation

Une fois la branche datée créée, les participants doivent créer leur propre branche à partir d'elle.

Le dossier `workshop/` aura déjà été supprimé dans cette branche de base, afin de ne pas influencer l'agent pendant la rédaction des spécifications.
