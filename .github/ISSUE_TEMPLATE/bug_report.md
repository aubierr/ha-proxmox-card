---
name: Problème d'affichage ou capteur non reconnu
about: Une jauge affiche « – », un invité manque, un bouton n'apparaît pas…
labels: bug
---

**Ce qui ne va pas**
<!-- Décrivez ce que vous voyez et ce que vous attendiez. Une capture d'écran aide beaucoup. -->

**Version de la carte** (HACS → Proxmox Card) :
**Version de Home Assistant** :
**Version de l'intégration proxmoxve** :
**Appareil / navigateur** (application Android, iOS, Chrome…) :

**Votre configuration YAML**
```yaml
type: custom:proxmox-card
```

**Entités concernées** (si un capteur n'est pas reconnu)
<!-- Collez le résultat de ce script dans la console du navigateur (F12) sur votre tableau de bord :
Object.values(document.querySelector('home-assistant').hass.entities)
  .filter(e => e.platform === 'proxmoxve')
  .map(e => `${e.entity_id} | ${e.translation_key} | ${document.querySelector('home-assistant').hass.states[e.entity_id]?.state}`)
  .join('\n')
-->
