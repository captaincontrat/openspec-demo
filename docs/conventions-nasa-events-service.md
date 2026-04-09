# Conventions de `nasa-events-service`

Ce document decrit le contrat de consommation de `nasa-events-service`.

Le service est une facade locale de l'API `NASA EONET`. Il ne doit pas exposer la forme brute de la reponse upstream. Son role est de fournir une liste simple et stable d'evenements naturels en cours.

## Identite du service

- Nom de service : `nasa-events-service`
- Dossier : `services/nasa-events/`
- Port local : `3001`
- API publique upstream : `https://eonet.gsfc.nasa.gov/api/v3/events`

## Responsabilite

`nasa-events-service` recupere les evenements naturels ouverts depuis `NASA EONET` et expose une reponse JSON locale simplifiee.

Le service :
- expose `GET /health`
- expose `GET /events`
- retourne uniquement des evenements en cours
- simplifie les categories et les sources
- normalise la localisation en `{ lat, lon }`

Le service ne doit pas :
- exposer `status`
- exposer `closed`
- exposer `geometry`
- exposer des parametres publics qui refletent l'API EONET
- renvoyer les erreurs brutes de l'upstream

## Endpoints

### `GET /health`

Endpoint de sante standard du service.

Exemple de reponse :

```json
{
  "status": "ok",
  "service": "nasa-events-service"
}
```

### `GET /events`

Endpoint principal du service.

Contraintes :
- ne prend aucun parametre public
- retourne uniquement des evenements ouverts
- retourne toujours du JSON

Exemple de reponse :

```json
{
  "source": "NASA EONET",
  "events": [
    {
      "id": "EONET_19349",
      "title": "Holly Springs IU 81-1 83-1 RX Prescribed Fire, Lafayette, Mississippi",
      "description": null,
      "link": "https://eonet.gsfc.nasa.gov/api/v3/events/EONET_19349",
      "categories": ["wildfires"],
      "sources": [
        "https://irwin.doi.gov/observer/incidents/ff17cff2-d2e0-4018-ba83-eb07bf8dfed4"
      ],
      "location": {
        "lat": 34.49759,
        "lon": -89.382263
      }
    }
  ]
}
```

## Contrat des champs

Chaque element de `events` doit exposer uniquement les champs suivants :

- `id` : identifiant EONET de l'evenement
- `title` : titre de l'evenement
- `description` : description textuelle, nullable
- `link` : URL EONET de detail de l'evenement
- `categories` : liste des identifiants de categories, sous forme de `string[]`
- `sources` : liste des URLs source, sous forme de `string[]`
- `location.lat` : latitude normalisee
- `location.lon` : longitude normalisee

Champs explicitement exclus du contrat public :

- `status`
- `closed`
- `geometry`

## Regles de normalisation

- Le service ne retourne que des evenements ouverts.
- Le service doit convertir les donnees upstream en une forme stable, independamment de la structure brute de `NASA EONET`.
- Le service doit fournir une seule localisation exploitable par evenement public.
- Si plusieurs geometries `Point` valides existent pour un evenement, le service retient le point le plus recent.
- Si un evenement upstream ne peut pas etre reduit a une localisation unique `{ lat, lon }`, le service peut l'omettre de la reponse publique.
- Les categories ne doivent conserver que les identifiants.
- Les sources ne doivent conserver que les URLs.

## Contrat d'erreur

En cas d'erreur, le service doit retourner un JSON stable.

Exemple :

```json
{
  "error": {
    "code": "UPSTREAM_UNAVAILABLE",
    "message": "NASA EONET is unavailable"
  }
}
```

Codes d'erreur recommandes :

- `UPSTREAM_UNAVAILABLE`
- `UPSTREAM_BAD_RESPONSE`
- `INTERNAL_ERROR`

## Intention de conception

`nasa-events-service` est une facade, pas un proxy brut. Les consommateurs doivent pouvoir utiliser `GET /events` sans connaitre les details de `NASA EONET`, ni la structure GeoJSON de l'upstream.
