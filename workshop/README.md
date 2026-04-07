# Vérification des APIs avant workshop

Ce dossier contient des scripts de vérification des APIs publiques utilisées pendant le workshop.

## Quand exécuter ces scripts

Le script `run-all.sh` doit être exécuté au tout début du workshop, depuis la racine du dépôt, pour vérifier que les APIs répondent comme prévu avant que les participants commencent à écrire leurs spécifications.

Commande :

```bash
./workshop/run-all.sh
```

Ce script lance successivement :

- `01-check-nasa-eonet.sh`
- `02-check-nominatim.sh`
- `03-check-open-meteo-weather.sh`
- `04-check-open-meteo-air-quality.sh`

Si l'un des checks échoue, il faut résoudre le problème d'accès réseau ou d'API avant de continuer le workshop.

## Après la vérification

Une fois les vérifications terminées avec succès, chaque participant doit supprimer localement le dossier `workshop/` avant d'écrire ses spécifications.

Objectif : éviter que ces fichiers d'assistance influencent l'agent pendant la rédaction des spécifications.

Si vous travaillez avec Git, cette suppression est uniquement locale pour le workshop et ne doit pas être intégrée par erreur dans un commit.
