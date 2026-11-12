# Changelog

## 0.7.0

- Courbes d'historique CPU et RAM sur les nœuds (`show_history`, `history_hours`), lues dans l'historique de Home Assistant.
- Dernière sauvegarde du nœud (`show_backup`) et alerte « sauvegarde en échec ».
- Résumé du cluster à partir de 2 nœuds (`show_cluster`), avec alerte de perte de quorum.
- Sections repliables d'un clic, état mémorisé dans le navigateur (`collapsed` pour l'état par défaut).
- Invités et disques sur 2 colonnes quand la carte est large (`guest_columns`), couleur d'accent réglable (`accent`) ; section « Disposition » dans l'éditeur.
- Performances : la carte n'est recalculée que lorsqu'une entité qu'elle affiche change.
- Correction : les attributs des éléments personnalisés (icônes) ne sont plus supprimés lors des mises à jour sur place.
- Éditeur : nouveaux libellés et messages d'aide dans les 20 langues.

## 0.6.0

- Filtres : `include` et `exclude` (ID ou nom) pour afficher ou masquer des invités, compteurs et tri compris ; option `guests` pour renommer un invité et changer son icône. Section « Filtres » dans l'éditeur.
- Éditeur : messages d'aide sous les options (combien d'invités ont des boutons marche / arrêt et que faire s'il n'y en a aucun, nombre de stockages et de disques détectés), traduits dans les 20 langues.
- Invités : la ligne de détail (ID, type, IP, uptime) n'est plus tronquée sur les cartes larges ; les jauges passent sous le nom jusqu'à 640 px de largeur.
- Mode masonry : `getCardSize` renvoie la hauteur réelle de la carte.
- Projet : captures d'écran dans le README, page de test avec vraies icônes et paramètres d'URL, workflow GitHub de validation (HACS, syntaxe JavaScript, traductions), modèle d'issue avec script de diagnostic.

## 0.5.1

- Mobile : la carte ne remplace plus tout son contenu quand une valeur change, elle ne met à jour que les éléments modifiés (les éléments, icônes et boutons restent en place). Cela supprime la dernière cause connue du saut de page, et les jauges s'animent maintenant d'une valeur à l'autre.
- Éditeur : les choix du champ « Sens » sont plus courts (« Croissant ↓ » / « Décroissant ↑ », sans le texte entre parenthèses), dans toutes les langues.

## 0.5.0

- Traduction complète de la carte et de l'éditeur en 20 langues : anglais, français, allemand, espagnol, italien, portugais, néerlandais, polonais, tchèque, suédois, danois, norvégien, finnois, russe, ukrainien, turc, roumain, hongrois, japonais et chinois. La langue suit celle de Home Assistant (`language: auto`) ou se choisit avec `language`.
- Sens du tri : « croissant » = du haut vers le bas (flèche ↓ sur le bouton et dans l'éditeur), « décroissant » = du bas vers le haut (flèche ↑).
- Correction mobile : la page remontait toute seule. La carte reconstruisait tout son contenu à chaque changement d'état de Home Assistant (identifiants SVG des jauges différents à chaque rendu) ; elle ne le fait plus que lorsqu'une valeur affichée change.
- Éditeur : il ne se réinitialise plus à chaque changement d'état de Home Assistant (même cause du saut de page sur mobile).
- Éditeur : libellés des listes (sens, critère, ordre des types) traduits dans la langue choisie au lieu de « Ascending / Croissant ».

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
