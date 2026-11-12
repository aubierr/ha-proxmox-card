# Changelog

## 0.4.1

- Tri des invités réglable dans la configuration : `sort` (`id`, `name`, `status`), `sort_dir` (`asc`, `desc`), `group_by_type` et `type_order` (`vm_first`, `lxc_first`). Section « Tri des invités » dans l'éditeur.
- Par défaut, tous les invités sont triés par ID croissant (VM et LXC mélangés). Le bouton « Type » de la carte active ou désactive le regroupement VM / LXC.
- `sort: type` (v0.4.0) reste accepté : tri par ID avec regroupement par type.
- Charge, IO delay et version de Proxmox mis en évidence : pastille orange « PVE 9.2.26 » à côté du nom du nœud, et une bande avec pastilles d'icônes, valeurs en gras et libellés pour la charge et l'IO delay ; l'IO delay passe en orange puis rouge (seuil `thresholds.io`, 5 % / 15 % par défaut).

## 0.4.0

- Tri des invités : boutons Type / ID / Nom / État dans l'en-tête de la section (un second clic inverse l'ordre), tri par défaut réglable avec `sort`, boutons masquables avec `show_sort`.
- Plus d'espace entre l'en-tête, les sections et dans les tuiles de nœuds.
- Jauges des nœuds de taille intermédiaire, plus soignées : trait fin en dégradé, fond teinté, animation adoucie.

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
