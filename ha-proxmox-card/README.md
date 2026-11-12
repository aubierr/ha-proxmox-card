# ha-proxmox-card

Carte Lovelace pour l'intégration [proxmoxve](https://github.com/dougiteixeira/proxmoxve) : nœuds (CPU / RAM / disque / uptime), VM et conteneurs LXC (statut, CPU, RAM, IP) et boutons marche / arrêt / redémarrage. JS pur, sans dépendance, thème clair/sombre automatique.

## Installation (manuelle)

1. Copier `src/proxmox-card.js` dans `/config/www/proxmox-card.js`.
2. Réglages → Tableaux de bord → Ressources → ajouter `/local/proxmox-card.js` (module JavaScript).

## Utilisation

```yaml
type: custom:proxmox-card
title: Proxmox
```

Les entités sont **découvertes automatiquement** (plateforme `proxmoxve`) : aucune entité à lister.

| Option | Défaut | Description |
|---|---|---|
| `title` | `Proxmox` | Titre |
| `node` | | Filtre sur le nom du nœud ou de l'appareil |
| `show_nodes` | `true` | Afficher les nœuds |
| `show_qemu` / `show_lxc` | `true` | Afficher VM / conteneurs |
| `show_stopped` | `true` | Afficher les invités arrêtés |
| `show_actions` | `true` | Boutons start / shutdown / reboot (double clic de confirmation pour les actions risquées) |
| `show_ip` | `true` | Afficher l'IP |
| `thresholds` | cpu 70/90, memory 80/95, disk 80/90 | `thresholds: { cpu: { warning: 60, critical: 85 } }` |
| `language` | `auto` | `auto`, `en`, `fr` |

Les capteurs mémoire/disque (%), et les boutons sont désactivés par défaut dans l'intégration : activez-les dans la page de l'appareil.
