---
marp: true
theme: cybertopia
class: invert
paginate: true
transition: fade
_paginate: false
---

<style>
section header {
  top: 12px;
  left: 0;
  right: 0;
  width: 100%;
  text-align: center;
}
.tl {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.tl span {
  padding: 3px 12px;
  border-radius: 99px;
  font-size: 1.48em;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
  font-weight: 500;
}
.tl .done { color: rgba(255, 255, 255, 0.5); }
.tl .on {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.95);
  font-weight: 700;
}
</style>

<!-- _transition: glow -->

# <!--fit--> Workshop OpenSpec x Cursor

5 personnes · 4 microservices · 1 BFF · 2 heures

<!-- Notes animateur : cadrer le workshop, poser le rythme. On construit un vrai truc, pas un exercice scolaire. -->

---

<!-- _transition: slide -->
<!-- header: '<div class="tl"><span class="on">Contexte</span><span>Projet</span><span>Archi</span><span>Méthode</span><span>Go!</span></div>' -->

# Objectif

Construire **ensemble** un moniteur d'evenements naturels en temps reel.

- Donnees live
- Chaque participant livre une application autonome
- Le BFF assemble le tout en une demo coherente

<!-- Notes animateur : insister sur "live data" et "demo first". -->

---

<!-- _transition: fade -->

# Les outils

![bg right:40% 60%](./assets/cursor-icon.svg)

## Cursor

L'editeur IA qui accelere l'implementation.

---

# Les outils

![bg right:40% 70%](./assets/openspec-icon.svg)

## OpenSpec

La couche de clarification :
proposal, design, tasks, spec deltas.

---

<!-- _transition: cube -->
<!-- header: '<div class="tl"><span class="done">Contexte</span><span class="on">Projet</span><span>Archi</span><span>Méthode</span><span>Go!</span></div>' -->

# Ce que l'on construit

![bg right:45% 90%](https://eonet.gsfc.nasa.gov/img/background.jpg)

Un **dashboard NASA EONET**
(Earth Observatory Natural Event Tracker)

---

<!-- _transition: slide -->

# <!--fit--> 5 roles, 5 streams

---

# nasa-events-service

![bg left:35% 80%](https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg)

Evenements actifs depuis **NASA EONET**

---

![bg left:35% 80%](https://nominatim.openstreetmap.org/ui/theme/logo.png)

# location-context-service

Reverse geocoding via **Nominatim**

---

![bg left:35% 80% invert](assets/open-meteo-icon.svg)

# weather-context-service

Meteo courante via **Open-Meteo**

---

![bg left:35% 80% invert](assets/open-meteo-icon.svg)

# air-quality-service

Qualite de l'air via **Open-Meteo AQ**

---

# bff-nasa-monitor

Compose les 4 services, gere les absences, rend la page de monitoring.

**C'est lui qui porte la valeur visible.**

---

<!-- _transition: iris-in -->
<!-- header: '<div class="tl"><span class="done">Contexte</span><span class="done">Projet</span><span class="on">Archi</span><span>Méthode</span><span>Go!</span></div>' -->

# <!--fit--> Architecture

---

```
  NASA EONET ──► nasa-events ──────┐
                                   │
  Nominatim ───► location-context ─┤
                                   ├──► BFF ──► UI
  Open-Meteo ──► weather-context ──┤
                                   │
  Open-Meteo ──► air-quality ──────┘
```

Un upstream par service. Une composition dans le BFF.

---

<!-- _transition: wipe -->

# Contrat minimal

- Chaque service expose `GET /health`
- Un seul endpoint JSON principal
- Erreurs en JSON simple, jamais du brut upstream

---

<!-- _transition: fade -->
<!-- header: '<div class="tl"><span class="done">Contexte</span><span class="done">Projet</span><span class="done">Archi</span><span class="on">Méthode</span><span>Go!</span></div>' -->

# Workflow OpenSpec

1. **`/opsx:explore`** — se faire une idée
1. **`/opsx:propose`** — cadrer le service
1. **Clarifier** — proposal, design, tasks
1. **Coder petit** — un upstream, un endpoint, un `/health`
1. **Verifier le live** — JSON reel en local
1. **Integrer** — le BFF assemble

---

<!-- _transition: push -->

# <!--fit--> Timing

---

# Deroule

| Phase       | Temps         | Quoi                      |
| ----------- | ------------- | ------------------------- |
| Cadrage     | 0 – 15 min    | Onboarding                |
| Spec        | 15 – 35 min   | Itérations OpenSpec       |
| Build       | 35 – 80 min   | Service local fonctionnel |
| Integration | 80 – 105 min  | BFF branche les services  |
| Demo        | 105 – 120 min | Demo + debrief            |

---

<!-- _transition: zoom -->
<!-- header: '<div class="tl"><span class="done">Contexte</span><span class="done">Projet</span><span class="done">Archi</span><span class="done">Méthode</span><span class="on">Go!</span></div>' -->

# Definition of done

- Le service demarre et `/health` repond
- L'endpoint principal renvoie du JSON correct
- Le BFF appelle les services disponibles
- Les services absents sont geres proprement
- La demo tourne

---

<!-- _transition: glow -->

# Garde-fous

**OUI** : services fins, contrats écrits, résultats visibles tôt

**NON** : debat de framework, auth/DB/cache/mocks

> Si vous hesitez entre "plus propre" et "plus demo", choisissez la demo.

---

<!-- _transition: explode -->
<!-- _paginate: false -->
<!-- _header: '' -->

# <!--fit--> À vous de jouer
