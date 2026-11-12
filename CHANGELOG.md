# Changelog

## 0.3.1

- Jauges circulaires des nœuds agrandies (jusqu'à 128 px), chiffre en gras qui s'adapte à la largeur de la carte.

## 0.3.0

- Refonte visuelle : bandeau dégradé et icône orange, jauges circulaires CPU / RAM / disque sur les nœuds, tuiles pour les invités avec bande d'état colorée, stockages et disques en tuiles, titres de section stylisés.
- Éditeur visuel : les cases affichent maintenant la vraie valeur de chaque option (une option absente est active par défaut), sections repliables, libellés FR/EN.

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
