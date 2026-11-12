# ha-proxmox-card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Carte Lovelace pour Home Assistant qui affiche votre infrastructure **Proxmox VE** : nœuds, machines virtuelles (QEMU) et conteneurs (LXC), avec jauges CPU / RAM / disque et boutons d'action.

Elle s'appuie sur l'intégration [**proxmoxve**](https://github.com/dougiteixeira/proxmoxve) de dougiteixeira : JavaScript pur, aucune dépendance (ni Mushroom, ni card-mod, ni button-card), thème clair/sombre automatique.

[![Ouvrir votre Home Assistant et ajouter ce dépôt dans HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=aubierr&repository=ha-proxmox-card&category=plugin) **Ajouter la carte à HACS**

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Seuils des jauges](#seuils-des-jauges)
- [Quelles entités sont utilisées ?](#quelles-entités-sont-utilisées-)
- [Boutons d'action](#boutons-daction)
- [Dépannage](#dépannage)
- [Développement](#développement)
- [Licence](#licence)

## Fonctionnalités

- **Découverte automatique** : aucune entité à lister, la carte retrouve toutes les entités de l'intégration `proxmoxve`.
- **En-tête de synthèse** : nombre de nœuds en ligne, de VM et de conteneurs actifs (pastille orange ou rouge si un nœud est hors ligne).
- **Alertes** : pastilles sous l'en-tête, visibles seulement quand elles s'appliquent : mises à jour disponibles, sauvegarde en cours, tâches en échec, stockage inactif, disque en défaut.
- **Tuiles de nœuds** : statut, uptime, jauges circulaires CPU, RAM et disque, barre de swap, charge système, IO delay et version de Proxmox.
- **Liste des invités** (VM et LXC) : statut, nom, numéro, adresse IP, uptime, jauges CPU, RAM et disque, et badges (verrouillé, agent invité injoignable, problème signalé).
- **Tri des invités** : boutons Type / ID / Nom / État ; un second clic sur le bouton actif inverse l'ordre (le choix est conservé jusqu'au rechargement de la page, le tri par défaut se règle avec `sort`).
- **Stockages** : occupation de chaque stockage (local, LVM, partages…) et indicateur actif / inactif.
- **Disques physiques** : santé SMART, température, usure et heures de fonctionnement.
- **Jauges colorées** (circulaires pour les nœuds, barres dégradées ailleurs) : vert, orange, rouge selon des seuils réglables.
- **Boutons d'action** : démarrer, arrêter proprement, redémarrer, avec confirmation par second clic pour les actions risquées.
- **Fenêtre de détail** : un clic sur un nœud ou un invité ouvre la fiche (more-info) de son entité.
- **Responsive** : la mise en page s'adapte à la largeur de la carte (container queries) ; sur une carte étroite, les jauges des invités passent sous leur nom et les pastilles de l'en-tête sont masquées.
- **Éditeur visuel** intégré, interface en **français** et **anglais** (détection automatique).
- Respecte `prefers-reduced-motion`.

## Prérequis

- Home Assistant récent (2024.x ou plus ; la carte lit le registre d'entités et d'appareils exposé au frontend).
- L'intégration [proxmoxve](https://github.com/dougiteixeira/proxmoxve) installée et configurée ([ajouter dans HACS](https://my.home-assistant.io/redirect/hacs_repository/?owner=dougiteixeira&repository=proxmoxve&category=integration)) (la carte ne fonctionne pas avec l'intégration Proxmox « core » : elle cible la plateforme `proxmoxve`).

## Installation

### Via HACS (dépôt personnalisé)

En un clic (nécessite [My Home Assistant](https://my.home-assistant.io) configuré avec l'adresse de votre instance) :

[![Ouvrir votre Home Assistant et ajouter ce dépôt dans HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=aubierr&repository=ha-proxmox-card&category=plugin)

Ou à la main :

1. HACS → menu ⋮ → **Dépôts personnalisés**.
2. Ajouter `https://github.com/aubierr/ha-proxmox-card`, type **Tableau de bord** (Dashboard / Lovelace).
3. Installer **Proxmox Card**, puis recharger le navigateur (Ctrl+F5).

### Manuelle

1. Copier [`dist/proxmox-card.js`](dist/proxmox-card.js) dans `/config/www/`.
2. Réglages → Tableaux de bord → ⋮ → **Ressources** → **Ajouter une ressource** :
   - URL : `/local/proxmox-card.js`
   - Type : **Module JavaScript**
3. Recharger le navigateur.

## Configuration

Ajoutez la carte depuis l'éditeur visuel (« Proxmox Card ») ou en YAML :

```yaml
type: custom:proxmox-card
title: Proxmox
```

Exemple complet :

```yaml
type: custom:proxmox-card
title: Homelab
node: pve                # ne garder que les appareils dont le nom contient "pve"
show_nodes: true
show_qemu: true
show_lxc: true
show_stopped: true
show_actions: true
show_ip: true
show_uptime: true
show_badges: true
show_alerts: true
show_storage: true
show_disks: true
show_swap: true
show_load: true
show_version: true
show_sort: true
sort: type               # type | id | name | status
language: fr
thresholds:
  cpu:         { warning: 60, critical: 85 }
  memory:      { warning: 80, critical: 95 }
  disk:        { warning: 80, critical: 90 }
  temperature: { warning: 55, critical: 70 }
  wear:        { warning: 70, critical: 90 }
```

| Option | Type | Défaut | Description |
|---|---|---|---|
| `title` | texte | `Proxmox` | Titre de la carte |
| `node` | texte | *(vide)* | Filtre : ne garde que les nœuds, VM et conteneurs dont le nom d'appareil (ou celui de l'appareil parent) contient ce texte, sans tenir compte de la casse |
| `show_nodes` | booléen | `true` | Afficher les tuiles de nœuds |
| `show_qemu` | booléen | `true` | Afficher les machines virtuelles |
| `show_lxc` | booléen | `true` | Afficher les conteneurs LXC |
| `show_stopped` | booléen | `true` | Afficher aussi les invités arrêtés (atténués) |
| `show_actions` | booléen | `true` | Afficher les boutons d'action |
| `show_ip` | booléen | `true` | Afficher l'adresse IP de l'invité |
| `show_uptime` | booléen | `true` | Afficher l'uptime des invités qui tournent |
| `show_badges` | booléen | `true` | Badges sur les invités : verrouillé, agent invité injoignable, problème signalé |
| `show_alerts` | booléen | `true` | Pastilles d'alerte (mises à jour, sauvegarde, tâches en échec, stockage inactif, disque en défaut) |
| `show_storage` | booléen | `true` | Section des stockages |
| `show_disks` | booléen | `true` | Section des disques physiques (SMART) |
| `show_swap` | booléen | `true` | Jauge de swap sur les nœuds |
| `show_load` | booléen | `true` | Charge système et IO delay sur les nœuds |
| `show_version` | booléen | `true` | Version de Proxmox VE sur les nœuds |
| `show_sort` | booléen | `true` | Boutons de tri (Type, ID, Nom, État) dans l'en-tête de la section des invités |
| `sort` | texte | `type` | Tri par défaut des invités : `type` (VM puis LXC, chacun par ID), `id`, `name` ou `status` (actifs d'abord) |
| `thresholds` | objet | voir ci-dessous | Seuils `warning` / `critical` par jauge |
| `language` | texte | `auto` | `auto`, `en` ou `fr` |

## Seuils des jauges

| Jauge | Orange à partir de | Rouge à partir de |
|---|---|---|
| `cpu` | 70 % | 90 % |
| `memory` | 80 % | 95 % |
| `disk` (nœuds, invités, stockages) | 80 % | 90 % |
| `temperature` (disques physiques) | 55 °C | 70 °C |
| `wear` (usure des disques) | 70 % | 90 % |

Vous pouvez ne surcharger qu'une partie des valeurs ; le reste garde sa valeur par défaut.

## Quelles entités sont utilisées ?

La carte parcourt les entités dont la plateforme est `proxmoxve`, les regroupe par appareil, puis reconnaît leur rôle grâce à leur clé de traduction ou à leur identifiant :

| Appareil | Rôles lus |
|---|---|
| **Nœud** | statut, CPU, mémoire (% ou utilisée / totale), disque (% ou utilisé / total), swap, uptime, charge 1 min, IO delay, version, mise à jour disponible et nombre de mises à jour, sauvegarde en cours, tâches en échec |
| **VM (QEMU)** et **conteneur (LXC)** | statut, CPU, mémoire, disque, adresse IP, uptime, verrouillé, agent invité, santé, boutons start / shutdown / reboot / stop |
| **Stockage** (`Storage nœud/nom`) | disque utilisé (%), stockage actif |
| **Disque physique** (`Disk nœud: modèle`) | santé, température, usure (ou vie restante), heures de fonctionnement |

Le type d'appareil est déterminé d'après son nom et son modèle (`Node …`, `QEMU … (109)`, `LXC … (516)`, `Storage …`, `Disk …`). Le numéro entre parenthèses devient le VMID affiché.

> **Important** : une partie des entités de l'intégration est **désactivée par défaut** (mémoire, boutons, etc.). Si une jauge affiche « – » ou si les boutons manquent, activez l'entité concernée : Réglages → Appareils et services → *Proxmox VE* → l'appareil → entités désactivées → ⚙ → **Activer**, puis rechargez l'intégration si nécessaire.

## Boutons d'action

| Bouton | Visible si | Entité utilisée |
|---|---|---|
| Démarrer | l'invité est arrêté | bouton « Start » |
| Arrêter (shutdown) | l'invité tourne | bouton « Shutdown » |
| Redémarrer | l'invité tourne | bouton « Reboot » |
| Forcer l'arrêt | l'invité tourne et le bouton « Shutdown » n'existe pas | bouton « Stop » |

Les actions **Arrêter**, **Redémarrer** et **Forcer l'arrêt** demandent un **second clic** dans les 4 secondes (le bouton devient rouge). **Démarrer** s'exécute directement.

Côté Proxmox, l'utilisateur de l'intégration doit avoir le privilège `VM.PowerMgmt` ; sans lui, les boutons ne sont pas créés par l'intégration.

Pour masquer tous les boutons : `show_actions: false`.

> Les sections et informations sans entité correspondante (par exemple pas de disques SMART, pas d'agent invité) n'apparaissent simplement pas.

## Dépannage

| Symptôme | Cause probable / solution |
|---|---|
| « Aucune entité Proxmox trouvée » | L'intégration `proxmoxve` n'est pas installée, ou aucun nœud / invité n'est suivi dans ses options |
| La carte n'apparaît pas dans le sélecteur | Ressource non ajoutée ou cache : vérifier `/local/proxmox-card.js` (type module) et faire Ctrl+F5 |
| Jauge RAM ou disque à « – » | Entité de mémoire / disque désactivée par défaut : l'activer (voir plus haut). Un conteneur arrêté remonte son disque en « inconnu » |
| Pas de boutons | Entités `button.*` désactivées, ou privilège `VM.PowerMgmt` manquant côté Proxmox |
| Un invité manque | Les modèles (templates) ne sont jamais suivis ; vérifier aussi `node` et `show_stopped` |
| Pas d'IP affichée | Capteur « IP address » absent : nécessite l'agent invité (VM) ou les droits `VM.Audit` (LXC) |
| Mauvais capteur reconnu | Ouvrez une *issue* en joignant la liste de vos entités `proxmoxve` (nom, clé de traduction, `entity_id`) |

## Développement

Le projet est un unique fichier JavaScript sans étape de build : [`dist/proxmox-card.js`](dist/proxmox-card.js).

Une page de test avec un faux objet `hass` est fournie dans [`test/`](test/index.html). Les modules ES ne se chargent pas depuis `file://`, il faut donc un petit serveur :

```bash
python -m http.server 8765
# puis ouvrir http://localhost:8765/test/index.html
```

## Remerciements

- [dougiteixeira/proxmoxve](https://github.com/dougiteixeira/proxmoxve) pour l'intégration Proxmox VE.

## Licence

[MIT](LICENSE)
