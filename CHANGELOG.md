# Changelog

## 0.2.0

- Nouvelles sections : stockages et disques physiques (santé, température, usure, heures).
- Pastilles d'alerte : mises à jour, sauvegarde en cours, tâches en échec, stockage inactif, disque en défaut.
- Nœuds : swap, charge, IO delay et version de Proxmox.
- Invités : uptime et badges (verrouillé, agent injoignable, problème).
- Nouvelles options `show_*` pour afficher ou masquer chaque élément, seuils `temperature` et `wear`.

## 0.1.1

- Ajout du disque (avec CPU et RAM, libellés et jauges) sur chaque VM et conteneur.
- Les jauges des invités passent sous le nom sur une carte étroite au lieu d'être masquées.
- Correction : reconnaissance des capteurs `*_perc` (`memory_used_perc`, `disk_used_perc`) de l'intégration.

## 0.1.0

- Première version : nœuds, VM et LXC avec jauges CPU/RAM/disque, boutons démarrer/arrêter/redémarrer, éditeur visuel, FR/EN.
