# Conventions des microservices

Ce document centralise les conventions partagées pour les cinq applications du démonstrateur NASA EONET : les quatre microservices et le `BFF`.

## Conventions communes

- Chaque application doit utiliser le nom indiqué dans le tableau ci-dessous.
- Chaque application doit vivre dans le dossier indiqué dans le tableau ci-dessous.
- Chaque application doit écouter sur le port local indiqué dans le tableau ci-dessous.
- Si le framework utilise un autre port par défaut, il faut le surcharger pour respecter la convention commune.
- Chaque application doit exposer `GET /health`.
- Chaque microservice doit exposer un endpoint JSON principal en plus de `GET /health`.
- Chaque microservice doit utiliser l'API publique indiquée dans le tableau ci-dessous.
- Le `BFF` ne doit pas appeler les APIs publiques directement ; il doit composer les microservices locaux.
- Chaque application doit intégrer des tests unitaires.
- Chaque application doit intégrer des tests E2E.

## Répartition par application

| Application | Type | Dossier | Port local | API publique imposée | Endpoint public principal | Tests requis |
|-------------|------|---------|------------|------------------------|---------------------------|--------------|
| `bff-nasa-monitor` | BFF | `apps/bff/` | `3000` | aucune directement | `-` | tests unitaires + tests E2E |
| `nasa-events-service` | Microservice | `services/nasa-events/` | `3001` | `NASA EONET` | `https://eonet.gsfc.nasa.gov/api/v3/events` | tests unitaires + tests E2E |
| `location-context-service` | Microservice | `services/location-context/` | `3002` | `Nominatim` | `https://nominatim.openstreetmap.org/reverse` | tests unitaires + tests E2E |
| `weather-context-service` | Microservice | `services/weather-context/` | `3003` | `Open-Meteo` | `https://api.open-meteo.com/v1/forecast` | tests unitaires + tests E2E |
| `air-quality-service` | Microservice | `services/air-quality/` | `3004` | `Open-Meteo Air Quality` | `https://air-quality-api.open-meteo.com/v1/air-quality` | tests unitaires + tests E2E |

## Attendu minimal pour les tests

- Les tests unitaires doivent couvrir au minimum la logique métier principale et l'adaptateur vers l'API distante.
- Les tests E2E doivent couvrir au minimum le démarrage de l'application, `GET /health`, et l'endpoint principal.
- Les tests doivent pouvoir être exécutés localement par le contributeur responsable du service.
