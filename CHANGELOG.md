# Changelog

## 1.6.0

- Diagnostic : bouton « Copier le diagnostic » dans l'éditeur visuel. Il copie ce que la carte a reconnu (appareils, rôles, entités ignorées, versions de Home Assistant et de l'intégration), prêt à coller dans une issue GitHub.
- Performance : le classement des entités est mis en cache tant que le registre ne change pas ; sur une grosse installation, une mise à jour ne parcourt plus toutes les entités de Home Assistant.
- Courbes réseau (reçu / envoyé) dans le détail d'un invité, avec le débit maximal de la période.
- Thèmes : couleurs réglables par un thème Home Assistant avec les variables `--proxmox-card-accent`, `-ok`, `-warning`, `-critical`, `-off`, `-tile` et `-line`.
- README en anglais (`README.md`) et en français (`README.fr.md`).
- Tests : prévision de remplissage et courbe réseau dans `check-format.mjs`, nouveau `test/check-dom.mjs` pour la mise à jour en place du DOM.

## 1.5.0

- Prévision de remplissage (`show_forecast`, `thresholds.forecast`) : à partir des 7 derniers jours d'historique, chaque stockage, pool ZFS et Ceph qui se remplit affiche « plein dans ~23 j » ; pastille orange à 30 jours, rouge à 7 jours.
- Invités : champ de recherche (nom ou ID) et filtre « Problèmes » qui ne garde que les invités en alerte (`show_filter_bar`, à partir de 6 invités). Échap vide la recherche.
- Détail dépliable d'un invité (chevron à côté du nom) : courbes CPU et RAM, et liste de ses alertes en clair.
- Nouvelle carte `custom:proxmox-guest-card` pour un seul invité (`guest: 104`), avec son éditeur visuel.
- Mode compact (`compact`) : barres au lieu des anneaux, sans courbes ni lignes secondaires.
- Accessibilité : tuiles et pastilles atteignables au clavier (Tab, puis Entrée ou Espace), libellé lu par les lecteurs d'écran pour les boutons à icône, contour de focus visible.
- Éditeur visuel : noms et icônes des invités (option `guests:`), seuil de la prévision.
- Projet : `test/check-version.mjs` vérifie que la carte, le changelog et le tag annoncent la même version ; pousser un tag `vX.Y.Z` publie la release GitHub avec les notes du changelog (`.github/workflows/release.yml`).

## 1.4.0

- Température CPU des nœuds (`show_temperature`, `thresholds.cpu_temperature`) dans la bande charge / IO delay, à partir des capteurs matériels de l'intégration (PVE-mods) ; les autres températures au survol.
- Nœud de chaque invité : affiché dans la ligne de détail sur un cluster (il suit les migrations grâce au capteur « Node »), et regroupement par nœud (`group_by_node`, bouton « Nœud »).
- Tri des invités par CPU ou par RAM (les plus chargés d'abord, invités arrêtés à la fin), dans la configuration et sur la carte.
- Menus « ⋯ » : fermeture avec Échap ou par un clic à côté.
- Éditeur visuel : section « Seuils » (tous les seuils, seules les valeurs modifiées sont écrites dans le YAML), action au clic et ordre des sections.
- Action au clic (`tap_action`) : action standard de Home Assistant sur les tuiles (naviguer, ouvrir une URL…).
- Ordre des sections (`section_order`).
- Pluriels : « 1 tâche en échec » / « 2 tâches en échec », avec les formes propres à chaque langue (polonais, tchèque, russe, ukrainien, roumain…).
- Statut des invités : l'état détaillé (en pause, suspendu…) est utilisé quand il existe, ce qui fiabilise le bouton « Reprendre ».
- Corrections : les capteurs « Disk RPM » et « Disk size » des disques physiques ne sont plus pris pour l'espace disque utilisé ; les capteurs matériels ne peuvent plus être pris pour l'usage CPU.
- Tests : nouveau `test/check-roles.mjs` (rôle de chaque entité de l'intégration) dans la validation GitHub ; `check-i18n.mjs` vérifie aussi les pluriels.

## 1.3.1 (non publiée, incluse dans la 1.4.0)

- Pools ZFS et Ceph : le nom n'est plus tronqué sur les cartes larges ; l'étiquette « ZFS » (avec le nœud quand il y en a plusieurs) ou « Cluster » passe sur une ligne à part, sous la barre.
- Invités : la taille et la part de l'hôte s'affichent sur deux lignes sous les jauges, au lieu d'une ligne tronquée.
- Captures d'écran du README mises à jour.

## 1.3.0

- Menu « ⋯ » sur les invités : reprendre, suspendre, mettre en veille prolongée (VM), réinitialiser, sauvegarder maintenant, déverrouiller. Seules les actions possibles dans l'état actuel sont proposées, avec confirmation par second clic pour les actions risquées.
- Menu « ⋯ » sur les nœuds : démarrer, arrêter, suspendre ou sauvegarder tous les invités, redémarrer ou éteindre le nœud, et Wake-on-LAN quand il est hors ligne.
- Haute disponibilité : état « HA » sur la tuile du cluster et menu pour armer / désarmer ; pastilles quand la HA est désarmée, quand des ressources HA sont en erreur ou quand le gestionnaire HA ne répond plus.
- Réplication : pastille « réplication en échec » (tâches et erreur au survol) et badge sur l'invité concerné.
- Charge 5 et 15 min à côté de la charge 1 min des nœuds.
- Part de l'hôte (`show_host_share`) : part du CPU et de la RAM du nœud utilisée par chaque invité, sous ses jauges ; message d'aide dans l'éditeur quand les entités manquent.
- Disques physiques : cycles d'alimentation et coupures brutales, en infobulle et sous les heures de fonctionnement.
- Robustesse : la mise à jour de la carte ne touche plus au contenu d'un élément personnalisé vide (icônes).
- Textes : nouveaux textes dans les 20 langues ; page de test enrichie (boutons, réplication, HA, charge, compteurs).

## 1.2.0

- Compatibilité avec l'intégration Proxmox VE Custom 6.0 : son domaine passe de `proxmoxve` à `proxmoxve_custom`. La carte lit les entités `proxmoxve_custom`, et celles de `proxmoxve` seulement quand l'intégration n'est pas encore migrée (5.x). Quand l'intégration native Proxmox VE de Home Assistant (domaine `proxmoxve`) est installée en même temps, ses entités sont ignorées.
- Nouvelle version de Proxmox VE : la pastille de version d'un nœud passe en orange (« PVE 9.2.26 → 9.2.27 ») quand l'entité de mise à jour du nœud annonce une nouvelle version ; un clic ouvre cette entité (notes de version). Seule une vraie nouvelle version de Proxmox VE est signalée, pas une simple mise à jour de paquets.
- Pastille « mises à jour » : utilise l'entité de mise à jour du nœud quand le capteur « Update available » est désactivé.
- Pools ZFS : tuile par pool dans les stockages (état, occupation, tailles), bordée de rouge avec l'état quand le pool n'est pas `ONLINE`, et pastille « pool ZFS dégradé ».
- Ceph : tuile « Ceph » dans les stockages (santé, occupation, tailles) et pastille orange ou rouge quand la santé passe en avertissement ou en erreur.
- Invités sans sauvegarde : pastille « N invités sans sauvegarde » (liste au survol) et badge sur chaque invité qu'aucune tâche de sauvegarde ne couvre ; `include` / `exclude` s'appliquent.
- Certificat et abonnement des nœuds : pastille quand le certificat expire bientôt (`thresholds.certificate`, 30 / 7 jours) ou a expiré, et quand l'abonnement est expiré, invalide ou suspendu.
- Pastilles d'alerte : un clic ouvre l'entité concernée, et une infobulle donne le détail.
- Textes : le message « aucune entité trouvée » nomme `proxmoxve_custom` ; nouveau texte dans les 20 langues. Page de test : domaine `proxmoxve_custom`, `?legacy=1` pour l'ancien domaine, `?calm=1` pour un état sans alerte.

## 1.1.1

- Réseau : le débit retombe à 0 quand le compteur d'un invité ne bouge plus (au lieu de rester figé sur la dernière valeur) ; un horodatage illisible n'affiche plus de débit aberrant ; les unités inconnues ne sont plus prises pour des octets.
- Amorçage du débit depuis l'historique : nouvel essai au rendu suivant en cas d'échec, remise à zéro au changement de configuration, purge des entités disparues.
- Pastille « stockage presque plein » : ignore les stockages inactifs ou désactivés.
- Nettoyage : calcul de l'infobulle des tailles et lecture des octets factorisés ; nouveau test `test/check-format.mjs` (formatage, unités, débit).

## 1.1.0

- Réseau entrant et sortant par invité (`show_network`) : débit calculé à partir des compteurs cumulés de l'intégration, affiché sous le nom de chaque invité qui tourne. Le débit apparaît tout de suite grâce à l'historique de Home Assistant.
- `network_mode` (`rate` pour le débit, `total` pour le volume depuis le démarrage) et `network_unit` (`bytes` ou `bits`), réglables dans l'éditeur ; message d'aide quand les capteurs réseau sont désactivés.
- Tailles réelles (`show_sizes`) : espace libre et total des stockages, mémoire et disque utilisés / totaux des nœuds et des invités. Les totaux manquants sont déduits des autres valeurs.
- Pression des invités (`show_pressure`, `thresholds.pressure`) : badge orange ou rouge pour le CPU, la mémoire ou les E/S saturés.
- Instantanés (`show_snapshots`) : nombre d'instantanés par invité et bouton pour en créer un, avec confirmation.
- Badge « haute disponibilité » sur les invités gérés par HA, icône « partagé » et grisé « désactivé » sur les stockages, pastille « stockage presque plein » (`thresholds.disk.critical`).
- Correction : les capteurs « libre en % » (mémoire et disque) ne sont plus confondus avec les capteurs « utilisé en % ».
- Traductions : nouveaux textes dans les 20 langues.

## 1.0.1

- Dernière sauvegarde : date et heure complètes avec secondes, dans la langue de l'utilisateur (par exemple « 12 novembre 2026 à 02:18:05 »).
- Bande charge / IO delay / dernière sauvegarde : la charge et l'IO delay sont centrés chacun dans sa moitié, et la ligne de dernière sauvegarde est centrée sur toute la largeur de la tuile.

## 1.0.0

Première version stable. Aucun changement de comportement par rapport à la 0.7.1.

- Nœuds, VM et conteneurs LXC, stockages et disques physiques, avec jauges, courbes d'historique, alertes, dernière sauvegarde et résumé du cluster.
- Boutons d'action avec confirmation, tri, filtres, noms et icônes personnalisés, sections repliables, 2 colonnes, couleur d'accent.
- Éditeur visuel et interface en 20 langues.
- Validation automatique sur GitHub (HACS, syntaxe JavaScript, traductions).

## 0.7.1

- La ligne « Dernière sauvegarde » est centrée sous la charge et l'IO delay, comme eux.
- Workflow GitHub : actions mises à jour (`actions/checkout` v7, `actions/setup-node` v7, Node 26) et runner `ubuntu-24.04`, ce qui supprime les avertissements de dépréciation.

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
