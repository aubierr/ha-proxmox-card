/*
 * ha-proxmox-card — Lovelace card for the Proxmox VE integration
 * https://github.com/dougiteixeira/proxmoxve
 * Vanilla JS, Shadow DOM, no dependencies.
 */
const VERSION = "1.5.0";
// Integration domain: `proxmoxve_custom` since proxmoxve 6.0; `proxmoxve` before (now also the domain of the core integration).
const PLATFORM = "proxmoxve_custom", LEGACY_PLATFORM = "proxmoxve";

const DEFAULT_THRESHOLDS = {
  cpu: { warning: 70, critical: 90 },
  memory: { warning: 80, critical: 95 },
  disk: { warning: 80, critical: 90 },
  temperature: { warning: 55, critical: 70 },
  wear: { warning: 70, critical: 90 },
  io: { warning: 5, critical: 15 },
  pressure: { warning: 10, critical: 30 },
  certificate: { warning: 30, critical: 7 }, // days left before the node certificate expires (lower = worse)
  cpu_temperature: { warning: 75, critical: 90 }, // node CPU, °C (hardware sensors)
  forecast: { warning: 30, critical: 7 }, // days before a storage is full at its current pace (lower = worse)
};

// Positional strings per language (see STRING_KEYS). Missing keys fall back to English.
const STRING_KEYS = ["nodes", "online", "vms", "cts", "disk", "start", "shutdown", "reboot", "stop", "noData", "noRegistry", "guests", "confirm", "storage", "disks", "swap", "load", "version", "updates", "backup", "failed", "inactive", "diskProblem", "wear", "locked", "agentDown", "problem", "sortType", "sortName", "sortStatus", "lastBackup", "backupFailed", "quorumLost", "cluster", "netIn", "netOut", "free", "pressure", "haManaged", "shared", "disabled", "snapshots", "snapshot", "storageFull", "newRelease", "zfsProblem", "cephWarn", "cephErr", "noBackup", "noBackupGuest", "certSoon", "certExpired", "subProblem", "replFailing", "haErrors", "crmStale", "haDisarmed", "haDisarming", "haStandby", "disarmHa", "armHa", "more", "resume", "suspend", "hibernate", "reset", "backupNow", "unlock", "wakeOnLan", "startAll", "stopAll", "suspendAll", "backupAll", "rebootNode", "shutdownNode", "ofHost", "cycles", "powerLoss", "cpuTemp", "node", "fullIn", "problems", "search", "details", "noMatch", "chooseGuest"];
const pack = (keys, langs) => Object.fromEntries(Object.entries(langs).map(([l, a]) => [l, Object.fromEntries(keys.map((k, i) => [k, a[i]]))]));
const STRINGS = pack(STRING_KEYS, {
  en: ["Nodes", "online", "VMs", "CTs", "Disk", "Start", "Shutdown", "Reboot", "Force stop", "No Proxmox entities found. Is the proxmoxve_custom integration set up?", "This card needs a recent Home Assistant (entity and device registry in the frontend).", "Guests", "Confirm: ", "Storage", "Physical disks", "Swap", "Load", "Version", "updates available", "backup running", "failed tasks", "storage inactive", "disk problem", "Wear", "Locked", "Guest agent not responding", "Problem reported", "Type", "Name", "Status", "Last backup", "backup failed", "quorum lost", "Cluster", "Received", "Sent", "free", "pressure", "Managed by high availability", "shared", "disabled", "snapshots", "Create snapshot", "storage almost full", "Proxmox VE {v} available", "ZFS pool degraded", "Ceph: warning", "Ceph: error", "guests without backup", "No backup job", "certificate expires in {d} d", "certificate expired", "subscription not valid", "replication failing", "HA resources in error", "HA manager not responding", "HA disarmed", "HA disarming", "HA standby", "Disarm HA", "Arm HA", "More actions", "Resume", "Suspend", "Hibernate", "Reset", "Back up now", "Unlock", "Wake-on-LAN", "Start all guests", "Stop all guests", "Suspend all guests", "Back up all guests", "Reboot node", "Shut down node", "of host", "power cycles", "unsafe shutdowns", "CPU temp.", "Node", "full in ~{d} d", "Problems", "Search a guest (name or ID)", "Details", "No guest matches.", "Choose a guest in the card settings."],
  fr: ["Nœuds", "en ligne", "VM", "CT", "Disque", "Démarrer", "Arrêter", "Redémarrer", "Forcer l'arrêt", "Aucune entité Proxmox trouvée. L'intégration proxmoxve_custom est-elle installée ?", "Cette carte nécessite une version récente de Home Assistant.", "Invités", "Confirmer : ", "Stockages", "Disques physiques", "Swap", "Charge", "Version", "mises à jour", "sauvegarde en cours", "tâches en échec", "stockage inactif", "disque en défaut", "Usure", "Verrouillé", "Agent invité injoignable", "Problème signalé", "Type", "Nom", "État", "Dernière sauvegarde", "sauvegarde en échec", "quorum perdu", "Cluster", "Reçu", "Envoyé", "libres", "pression", "Géré par la haute disponibilité", "partagé", "désactivé", "instantanés", "Créer un instantané", "stockage presque plein", "Proxmox VE {v} disponible", "pool ZFS dégradé", "Ceph : avertissement", "Ceph : erreur", "invités sans sauvegarde", "Aucune sauvegarde planifiée", "certificat expire dans {d} j", "certificat expiré", "abonnement non valide", "réplication en échec", "ressources HA en erreur", "gestionnaire HA injoignable", "HA désarmée", "HA en cours de désarmement", "HA en attente", "Désarmer la HA", "Armer la HA", "Plus d'actions", "Reprendre", "Suspendre", "Mettre en veille prolongée", "Réinitialiser", "Sauvegarder maintenant", "Déverrouiller", "Wake-on-LAN", "Démarrer tous les invités", "Arrêter tous les invités", "Suspendre tous les invités", "Sauvegarder tous les invités", "Redémarrer le nœud", "Éteindre le nœud", "de l'hôte", "cycles d'alimentation", "coupures brutales", "Temp. CPU", "Nœud", "plein dans ~{d} j", "Problèmes", "Chercher un invité (nom ou ID)", "Détails", "Aucun invité ne correspond.", "Choisissez un invité dans les réglages de la carte."],
  de: ["Knoten", "online", "VMs", "CTs", "Festplatte", "Starten", "Herunterfahren", "Neustarten", "Erzwungen stoppen", "Keine Proxmox-Entitäten gefunden. Ist die Integration proxmoxve_custom eingerichtet?", "Diese Karte benötigt ein aktuelles Home Assistant (Entitäts- und Geräteregister im Frontend).", "Gäste", "Bestätigen: ", "Speicher", "Physische Datenträger", "Swap", "Last", "Version", "Updates verfügbar", "Sicherung läuft", "fehlgeschlagene Aufgaben", "Speicher inaktiv", "Datenträgerproblem", "Verschleiß", "Gesperrt", "Gast-Agent antwortet nicht", "Problem gemeldet", "Typ", "Name", "Status", "Letzte Sicherung", "Sicherung fehlgeschlagen", "Quorum verloren", "Cluster", "Empfangen", "Gesendet", "frei", "Druck", "Von Hochverfügbarkeit verwaltet", "geteilt", "deaktiviert", "Snapshots", "Snapshot erstellen", "Speicher fast voll", "Proxmox VE {v} verfügbar", "ZFS-Pool beeinträchtigt", "Ceph: Warnung", "Ceph: Fehler", "Gäste ohne Sicherung", "Kein Sicherungsauftrag", "Zertifikat läuft in {d} T. ab", "Zertifikat abgelaufen", "Abonnement ungültig", "Replikation fehlgeschlagen", "HA-Ressourcen im Fehlerzustand", "HA-Manager antwortet nicht", "HA entschärft", "HA wird entschärft", "HA im Standby", "HA entschärfen", "HA scharf schalten", "Weitere Aktionen", "Fortsetzen", "Pausieren", "Ruhezustand", "Zurücksetzen", "Jetzt sichern", "Entsperren", "Wake-on-LAN", "Alle Gäste starten", "Alle Gäste stoppen", "Alle Gäste pausieren", "Alle Gäste sichern", "Knoten neu starten", "Knoten herunterfahren", "des Hosts", "Einschaltzyklen", "unerwartete Abschaltungen", "CPU-Temp.", "Knoten", "voll in ~{d} T.", "Probleme", "Gast suchen (Name oder ID)", "Details", "Kein Gast passt.", "Wählen Sie einen Gast in den Karteneinstellungen."],
  es: ["Nodos", "en línea", "VM", "CT", "Disco", "Iniciar", "Apagar", "Reiniciar", "Forzar parada", "No se encontraron entidades de Proxmox. ¿Está configurada la integración proxmoxve_custom?", "Esta tarjeta necesita una versión reciente de Home Assistant (registro de entidades y dispositivos en el frontend).", "Invitados", "Confirmar: ", "Almacenamiento", "Discos físicos", "Swap", "Carga", "Versión", "actualizaciones disponibles", "copia de seguridad en curso", "tareas fallidas", "almacenamiento inactivo", "problema de disco", "Desgaste", "Bloqueado", "El agente invitado no responde", "Problema detectado", "Tipo", "Nombre", "Estado", "Última copia de seguridad", "copia de seguridad fallida", "quórum perdido", "Clúster", "Recibido", "Enviado", "libres", "presión", "Gestionado por alta disponibilidad", "compartido", "deshabilitado", "instantáneas", "Crear instantánea", "almacenamiento casi lleno", "Proxmox VE {v} disponible", "pool ZFS degradado", "Ceph: advertencia", "Ceph: error", "invitados sin copia de seguridad", "Sin tarea de copia de seguridad", "el certificado caduca en {d} d", "certificado caducado", "suscripción no válida", "replicación fallida", "recursos HA con error", "el gestor HA no responde", "HA desarmada", "HA desarmándose", "HA en espera", "Desarmar HA", "Armar HA", "Más acciones", "Reanudar", "Suspender", "Hibernar", "Restablecer", "Hacer copia ahora", "Desbloquear", "Wake-on-LAN", "Iniciar todos los invitados", "Detener todos los invitados", "Suspender todos los invitados", "Copia de todos los invitados", "Reiniciar el nodo", "Apagar el nodo", "del host", "ciclos de encendido", "apagados bruscos", "Temp. CPU", "Nodo", "lleno en ~{d} d", "Problemas", "Buscar un invitado (nombre o ID)", "Detalles", "Ningún invitado coincide.", "Elija un invitado en los ajustes de la tarjeta."],
  it: ["Nodi", "online", "VM", "CT", "Disco", "Avvia", "Arresta", "Riavvia", "Arresto forzato", "Nessuna entità Proxmox trovata. L'integrazione proxmoxve_custom è configurata?", "Questa scheda richiede una versione recente di Home Assistant (registro di entità e dispositivi nel frontend).", "Guest", "Conferma: ", "Archiviazione", "Dischi fisici", "Swap", "Carico", "Versione", "aggiornamenti disponibili", "backup in corso", "attività non riuscite", "archiviazione inattiva", "problema al disco", "Usura", "Bloccato", "Guest agent non risponde", "Problema segnalato", "Tipo", "Nome", "Stato", "Ultimo backup", "backup non riuscito", "quorum perso", "Cluster", "Ricevuto", "Inviato", "liberi", "pressione", "Gestito dall'alta disponibilità", "condiviso", "disabilitato", "snapshot", "Crea snapshot", "archiviazione quasi piena", "Proxmox VE {v} disponibile", "pool ZFS degradato", "Ceph: avviso", "Ceph: errore", "guest senza backup", "Nessun job di backup", "il certificato scade tra {d} g", "certificato scaduto", "abbonamento non valido", "replica non riuscita", "risorse HA in errore", "il gestore HA non risponde", "HA disarmata", "HA in disarmo", "HA in standby", "Disarma HA", "Arma HA", "Altre azioni", "Riprendi", "Sospendi", "Iberna", "Reimposta", "Esegui backup ora", "Sblocca", "Wake-on-LAN", "Avvia tutti i guest", "Arresta tutti i guest", "Sospendi tutti i guest", "Backup di tutti i guest", "Riavvia il nodo", "Spegni il nodo", "dell'host", "cicli di accensione", "spegnimenti improvvisi", "Temp. CPU", "Nodo", "pieno tra ~{d} g", "Problemi", "Cerca un guest (nome o ID)", "Dettagli", "Nessun guest corrisponde.", "Scegli un guest nelle impostazioni della scheda."],
  pt: ["Nós", "online", "VMs", "CTs", "Disco", "Iniciar", "Desligar", "Reiniciar", "Forçar paragem", "Nenhuma entidade Proxmox encontrada. A integração proxmoxve_custom está configurada?", "Este cartão requer um Home Assistant recente (registo de entidades e dispositivos no frontend).", "Convidados", "Confirmar: ", "Armazenamento", "Discos físicos", "Swap", "Carga", "Versão", "atualizações disponíveis", "cópia de segurança em curso", "tarefas com falha", "armazenamento inativo", "problema no disco", "Desgaste", "Bloqueado", "O agente convidado não responde", "Problema reportado", "Tipo", "Nome", "Estado", "Última cópia de segurança", "cópia de segurança falhou", "quórum perdido", "Cluster", "Recebido", "Enviado", "livres", "pressão", "Gerido pela alta disponibilidade", "partilhado", "desativado", "instantâneos", "Criar instantâneo", "armazenamento quase cheio", "Proxmox VE {v} disponível", "pool ZFS degradado", "Ceph: aviso", "Ceph: erro", "convidados sem cópia de segurança", "Sem tarefa de cópia de segurança", "o certificado expira em {d} d", "certificado expirado", "subscrição inválida", "replicação com falha", "recursos HA com erro", "o gestor HA não responde", "HA desarmada", "HA a desarmar", "HA em espera", "Desarmar HA", "Armar HA", "Mais ações", "Retomar", "Suspender", "Hibernar", "Repor", "Fazer cópia agora", "Desbloquear", "Wake-on-LAN", "Iniciar todos os convidados", "Parar todos os convidados", "Suspender todos os convidados", "Cópia de todos os convidados", "Reiniciar o nó", "Desligar o nó", "do anfitrião", "ciclos de energia", "desligamentos abruptos", "Temp. CPU", "Nó", "cheio em ~{d} d", "Problemas", "Procurar um convidado (nome ou ID)", "Detalhes", "Nenhum convidado corresponde.", "Escolha um convidado nas definições do cartão."],
  nl: ["Nodes", "online", "VM's", "CT's", "Schijf", "Starten", "Afsluiten", "Herstarten", "Geforceerd stoppen", "Geen Proxmox-entiteiten gevonden. Is de proxmoxve_custom-integratie ingesteld?", "Deze kaart heeft een recente Home Assistant nodig (entiteiten- en apparatenregister in de frontend).", "Gasten", "Bevestig: ", "Opslag", "Fysieke schijven", "Swap", "Belasting", "Versie", "updates beschikbaar", "back-up bezig", "mislukte taken", "opslag inactief", "schijfprobleem", "Slijtage", "Vergrendeld", "Gastagent reageert niet", "Probleem gemeld", "Type", "Naam", "Status", "Laatste back-up", "back-up mislukt", "quorum verloren", "Cluster", "Ontvangen", "Verzonden", "vrij", "druk", "Beheerd door hoge beschikbaarheid", "gedeeld", "uitgeschakeld", "snapshots", "Snapshot maken", "opslag bijna vol", "Proxmox VE {v} beschikbaar", "ZFS-pool gedegradeerd", "Ceph: waarschuwing", "Ceph: fout", "gasten zonder back-up", "Geen back-uptaak", "certificaat verloopt over {d} d", "certificaat verlopen", "abonnement ongeldig", "replicatie mislukt", "HA-resources in fout", "HA-manager reageert niet", "HA uitgeschakeld", "HA wordt uitgeschakeld", "HA stand-by", "HA uitschakelen", "HA inschakelen", "Meer acties", "Hervatten", "Pauzeren", "Slaapstand", "Resetten", "Nu back-uppen", "Ontgrendelen", "Wake-on-LAN", "Alle gasten starten", "Alle gasten stoppen", "Alle gasten pauzeren", "Back-up van alle gasten", "Node herstarten", "Node afsluiten", "van host", "aan/uit-cycli", "onveilige uitschakelingen", "CPU-temp.", "Node", "vol over ~{d} d", "Problemen", "Gast zoeken (naam of ID)", "Details", "Geen gast gevonden.", "Kies een gast in de kaartinstellingen."],
  pl: ["Węzły", "online", "VM", "CT", "Dysk", "Uruchom", "Wyłącz", "Uruchom ponownie", "Wymuś zatrzymanie", "Nie znaleziono encji Proxmox. Czy integracja proxmoxve_custom jest skonfigurowana?", "Ta karta wymaga nowszej wersji Home Assistant (rejestr encji i urządzeń we frontendzie).", "Goście", "Potwierdź: ", "Magazyny", "Dyski fizyczne", "Swap", "Obciążenie", "Wersja", "dostępne aktualizacje", "trwa kopia zapasowa", "nieudane zadania", "magazyn nieaktywny", "problem z dyskiem", "Zużycie", "Zablokowany", "Agent gościa nie odpowiada", "Zgłoszono problem", "Typ", "Nazwa", "Stan", "Ostatnia kopia zapasowa", "kopia zapasowa nieudana", "utracono kworum", "Klaster", "Odebrano", "Wysłano", "wolne", "presja", "Zarządzane przez wysoką dostępność", "współdzielony", "wyłączony", "migawki", "Utwórz migawkę", "magazyn prawie pełny", "Dostępny Proxmox VE {v}", "pula ZFS zdegradowana", "Ceph: ostrzeżenie", "Ceph: błąd", "gości bez kopii zapasowej", "Brak zadania kopii zapasowej", "certyfikat wygasa za {d} dni", "certyfikat wygasł", "subskrypcja nieważna", "replikacja nieudana", "zasoby HA z błędem", "menedżer HA nie odpowiada", "HA rozbrojone", "HA w trakcie rozbrajania", "HA w gotowości", "Rozbrój HA", "Uzbrój HA", "Więcej akcji", "Wznów", "Wstrzymaj", "Hibernuj", "Resetuj", "Utwórz kopię teraz", "Odblokuj", "Wake-on-LAN", "Uruchom wszystkich gości", "Zatrzymaj wszystkich gości", "Wstrzymaj wszystkich gości", "Kopia wszystkich gości", "Uruchom ponownie węzeł", "Wyłącz węzeł", "hosta", "cykle zasilania", "nagłe wyłączenia", "Temp. CPU", "Węzeł", "pełny za ~{d} dni", "Problemy", "Szukaj gościa (nazwa lub ID)", "Szczegóły", "Brak pasujących gości.", "Wybierz gościa w ustawieniach karty."],
  cs: ["Uzly", "online", "VM", "CT", "Disk", "Spustit", "Vypnout", "Restartovat", "Vynutit zastavení", "Nebyly nalezeny žádné entity Proxmox. Je integrace proxmoxve_custom nastavena?", "Tato karta vyžaduje novější Home Assistant (registr entit a zařízení ve frontendu).", "Hosté", "Potvrdit: ", "Úložiště", "Fyzické disky", "Swap", "Zátěž", "Verze", "dostupné aktualizace", "probíhá záloha", "neúspěšné úlohy", "úložiště neaktivní", "problém s diskem", "Opotřebení", "Uzamčeno", "Agent hosta neodpovídá", "Nahlášen problém", "Typ", "Název", "Stav", "Poslední záloha", "záloha selhala", "kvórum ztraceno", "Cluster", "Přijato", "Odesláno", "volné", "tlak", "Spravováno vysokou dostupností", "sdílené", "zakázáno", "snímky", "Vytvořit snímek", "úložiště skoro plné", "K dispozici je Proxmox VE {v}", "ZFS pool degradován", "Ceph: varování", "Ceph: chyba", "hostů bez zálohy", "Žádná úloha zálohování", "certifikát vyprší za {d} d", "certifikát vypršel", "předplatné neplatné", "replikace selhává", "prostředky HA v chybě", "správce HA neodpovídá", "HA odstaveno", "HA se odstavuje", "HA v pohotovosti", "Odstavit HA", "Aktivovat HA", "Další akce", "Obnovit", "Pozastavit", "Hibernovat", "Resetovat", "Zálohovat nyní", "Odemknout", "Wake-on-LAN", "Spustit všechny hosty", "Zastavit všechny hosty", "Pozastavit všechny hosty", "Zálohovat všechny hosty", "Restartovat uzel", "Vypnout uzel", "hostitele", "cykly napájení", "nečekaná vypnutí", "Tepl. CPU", "Uzel", "plné za ~{d} d", "Problémy", "Hledat hosta (název nebo ID)", "Podrobnosti", "Žádný host neodpovídá.", "Vyberte hosta v nastavení karty."],
  sv: ["Noder", "online", "VM", "CT", "Disk", "Starta", "Stäng av", "Starta om", "Tvinga stopp", "Inga Proxmox-entiteter hittades. Är integrationen proxmoxve_custom konfigurerad?", "Det här kortet kräver en nyare Home Assistant (entitets- och enhetsregister i frontend).", "Gäster", "Bekräfta: ", "Lagring", "Fysiska diskar", "Swap", "Belastning", "Version", "uppdateringar tillgängliga", "säkerhetskopiering pågår", "misslyckade uppgifter", "lagring inaktiv", "diskproblem", "Slitage", "Låst", "Gästagenten svarar inte", "Problem rapporterat", "Typ", "Namn", "Status", "Senaste säkerhetskopia", "säkerhetskopiering misslyckades", "kvorum förlorat", "Kluster", "Mottaget", "Skickat", "lediga", "tryck", "Hanteras av hög tillgänglighet", "delad", "inaktiverad", "ögonblicksbilder", "Skapa ögonblicksbild", "lagring nästan full", "Proxmox VE {v} tillgänglig", "ZFS-pool degraderad", "Ceph: varning", "Ceph: fel", "gäster utan säkerhetskopia", "Inget säkerhetskopieringsjobb", "certifikatet går ut om {d} d", "certifikatet har gått ut", "prenumeration ogiltig", "replikering misslyckas", "HA-resurser med fel", "HA-hanteraren svarar inte", "HA avlarmerad", "HA avlarmeras", "HA i vänteläge", "Avlarmera HA", "Larma HA", "Fler åtgärder", "Återuppta", "Pausa", "Viloläge", "Återställ", "Säkerhetskopiera nu", "Lås upp", "Wake-on-LAN", "Starta alla gäster", "Stoppa alla gäster", "Pausa alla gäster", "Säkerhetskopiera alla gäster", "Starta om noden", "Stäng av noden", "av värden", "strömcykler", "oväntade avstängningar", "CPU-temp.", "Nod", "full om ~{d} d", "Problem", "Sök gäst (namn eller ID)", "Detaljer", "Ingen gäst matchar.", "Välj en gäst i kortets inställningar."],
  da: ["Noder", "online", "VM", "CT", "Disk", "Start", "Luk ned", "Genstart", "Gennemtving stop", "Ingen Proxmox-entiteter fundet. Er integrationen proxmoxve_custom sat op?", "Dette kort kræver en nyere Home Assistant (entitets- og enhedsregister i frontend).", "Gæster", "Bekræft: ", "Lager", "Fysiske diske", "Swap", "Belastning", "Version", "opdateringer tilgængelige", "sikkerhedskopiering i gang", "mislykkede opgaver", "lager inaktivt", "diskproblem", "Slid", "Låst", "Gæsteagenten svarer ikke", "Problem rapporteret", "Type", "Navn", "Status", "Seneste sikkerhedskopi", "sikkerhedskopi mislykkedes", "kvorum tabt", "Klynge", "Modtaget", "Sendt", "ledig", "tryk", "Styres af høj tilgængelighed", "delt", "deaktiveret", "snapshots", "Opret snapshot", "lager næsten fuldt", "Proxmox VE {v} tilgængelig", "ZFS-pool forringet", "Ceph: advarsel", "Ceph: fejl", "gæster uden sikkerhedskopi", "Intet sikkerhedskopijob", "certifikatet udløber om {d} d", "certifikatet er udløbet", "abonnement ugyldigt", "replikering fejler", "HA-ressourcer med fejl", "HA-styring svarer ikke", "HA afbrudt", "HA afbrydes", "HA på standby", "Afbryd HA", "Aktivér HA", "Flere handlinger", "Genoptag", "Sæt på pause", "Dvale", "Nulstil", "Sikkerhedskopiér nu", "Lås op", "Wake-on-LAN", "Start alle gæster", "Stop alle gæster", "Sæt alle gæster på pause", "Sikkerhedskopiér alle gæster", "Genstart node", "Luk node ned", "af værten", "strømcyklusser", "uventede nedlukninger", "CPU-temp.", "Node", "fuld om ~{d} d", "Problemer", "Søg efter gæst (navn eller ID)", "Detaljer", "Ingen gæst matcher.", "Vælg en gæst i kortets indstillinger."],
  nb: ["Noder", "online", "VM", "CT", "Disk", "Start", "Slå av", "Start på nytt", "Tvungen stopp", "Fant ingen Proxmox-entiteter. Er integrasjonen proxmoxve_custom satt opp?", "Dette kortet krever en nyere Home Assistant (entitets- og enhetsregister i frontend).", "Gjester", "Bekreft: ", "Lagring", "Fysiske disker", "Swap", "Belastning", "Versjon", "oppdateringer tilgjengelig", "sikkerhetskopiering pågår", "mislykkede oppgaver", "lagring inaktiv", "diskproblem", "Slitasje", "Låst", "Gjesteagenten svarer ikke", "Problem rapportert", "Type", "Navn", "Status", "Siste sikkerhetskopi", "sikkerhetskopi mislyktes", "kvorum tapt", "Klynge", "Mottatt", "Sendt", "ledig", "trykk", "Styres av høy tilgjengelighet", "delt", "deaktivert", "øyeblikksbilder", "Opprett øyeblikksbilde", "lagring nesten full", "Proxmox VE {v} tilgjengelig", "ZFS-pool degradert", "Ceph: advarsel", "Ceph: feil", "gjester uten sikkerhetskopi", "Ingen sikkerhetskopijobb", "sertifikatet utløper om {d} d", "sertifikatet er utløpt", "abonnement ugyldig", "replikering feiler", "HA-ressurser med feil", "HA-styring svarer ikke", "HA deaktivert", "HA deaktiveres", "HA i beredskap", "Deaktiver HA", "Aktiver HA", "Flere handlinger", "Gjenoppta", "Sett på pause", "Dvale", "Tilbakestill", "Ta sikkerhetskopi nå", "Lås opp", "Wake-on-LAN", "Start alle gjester", "Stopp alle gjester", "Sett alle gjester på pause", "Sikkerhetskopier alle gjester", "Start noden på nytt", "Slå av noden", "av verten", "strømsykluser", "uventede avslåinger", "CPU-temp.", "Node", "full om ~{d} d", "Problemer", "Søk etter gjest (navn eller ID)", "Detaljer", "Ingen gjest samsvarer.", "Velg en gjest i kortets innstillinger."],
  fi: ["Solmut", "verkossa", "VM", "CT", "Levy", "Käynnistä", "Sammuta", "Käynnistä uudelleen", "Pakota pysäytys", "Proxmox-entiteettejä ei löytynyt. Onko proxmoxve_custom-integraatio asennettu?", "Tämä kortti vaatii uudemman Home Assistantin (entiteetti- ja laiterekisteri käyttöliittymässä).", "Vieraat", "Vahvista: ", "Tallennustila", "Fyysiset levyt", "Swap", "Kuorma", "Versio", "päivityksiä saatavilla", "varmuuskopiointi käynnissä", "epäonnistuneet tehtävät", "tallennustila ei käytössä", "levyongelma", "Kuluminen", "Lukittu", "Vieras-agentti ei vastaa", "Ongelma ilmoitettu", "Tyyppi", "Nimi", "Tila", "Viimeisin varmuuskopio", "varmuuskopiointi epäonnistui", "kvoorumi menetetty", "Klusteri", "Vastaanotettu", "Lähetetty", "vapaana", "paine", "Korkean saatavuuden hallinnassa", "jaettu", "pois käytöstä", "tilannevedokset", "Luo tilannevedos", "tallennustila lähes täynnä", "Proxmox VE {v} saatavilla", "ZFS-pooli heikentynyt", "Ceph: varoitus", "Ceph: virhe", "vierasta ilman varmuuskopiota", "Ei varmuuskopiointitehtävää", "varmenne vanhenee {d} pv kuluttua", "varmenne vanhentunut", "tilaus ei voimassa", "replikointi epäonnistuu", "HA-resursseja virhetilassa", "HA-hallinta ei vastaa", "HA purettu", "HA:n purku käynnissä", "HA valmiustilassa", "Pura HA", "Aktivoi HA", "Lisää toimintoja", "Jatka", "Keskeytä", "Horrostila", "Nollaa", "Varmuuskopioi nyt", "Avaa lukitus", "Wake-on-LAN", "Käynnistä kaikki vieraat", "Pysäytä kaikki vieraat", "Keskeytä kaikki vieraat", "Varmuuskopioi kaikki vieraat", "Käynnistä solmu uudelleen", "Sammuta solmu", "isännästä", "virtajaksoa", "hallitsematonta sammutusta", "CPU:n lämpö", "Solmu", "täynnä ~{d} pv kuluttua", "Ongelmat", "Hae vierasta (nimi tai ID)", "Tiedot", "Yksikään vieras ei vastaa hakua.", "Valitse vieras kortin asetuksista."],
  ru: ["Узлы", "в сети", "ВМ", "КТ", "Диск", "Запустить", "Выключить", "Перезагрузить", "Принудительно остановить", "Сущности Proxmox не найдены. Настроена ли интеграция proxmoxve_custom?", "Для этой карточки нужна свежая версия Home Assistant (реестр сущностей и устройств во фронтенде).", "Гости", "Подтвердить: ", "Хранилища", "Физические диски", "Swap", "Нагрузка", "Версия", "обновлений доступно", "идёт резервное копирование", "неудачные задачи", "хранилище неактивно", "проблема с диском", "Износ", "Заблокировано", "Гостевой агент не отвечает", "Сообщено о проблеме", "Тип", "Имя", "Состояние", "Последняя резервная копия", "сбой резервного копирования", "кворум потерян", "Кластер", "Получено", "Отправлено", "свободно", "давление", "Управляется высокой доступностью", "общий", "отключено", "снимки", "Создать снимок", "хранилище почти заполнено", "Доступен Proxmox VE {v}", "пул ZFS деградирован", "Ceph: предупреждение", "Ceph: ошибка", "гостей без резервной копии", "Нет задания резервного копирования", "сертификат истекает через {d} дн.", "сертификат истёк", "подписка недействительна", "сбой репликации", "ресурсов HA с ошибкой", "менеджер HA не отвечает", "HA снята с охраны", "HA снимается с охраны", "HA в ожидании", "Снять HA с охраны", "Поставить HA на охрану", "Другие действия", "Возобновить", "Приостановить", "Гибернация", "Сброс", "Создать копию сейчас", "Разблокировать", "Wake-on-LAN", "Запустить всех гостей", "Остановить всех гостей", "Приостановить всех гостей", "Копия всех гостей", "Перезагрузить узел", "Выключить узел", "от хоста", "циклов питания", "аварийных отключений", "Темп. ЦП", "Узел", "заполнится через ~{d} дн.", "Проблемы", "Найти гостя (имя или ID)", "Подробности", "Нет подходящих гостей.", "Выберите гостя в настройках карточки."],
  uk: ["Вузли", "в мережі", "ВМ", "КТ", "Диск", "Запустити", "Вимкнути", "Перезавантажити", "Примусово зупинити", "Сутності Proxmox не знайдено. Чи налаштовано інтеграцію proxmoxve_custom?", "Для цієї картки потрібна свіжа версія Home Assistant (реєстр сутностей і пристроїв у фронтенді).", "Гості", "Підтвердити: ", "Сховища", "Фізичні диски", "Swap", "Навантаження", "Версія", "оновлень доступно", "триває резервне копіювання", "невдалі завдання", "сховище неактивне", "проблема з диском", "Знос", "Заблоковано", "Гостьовий агент не відповідає", "Повідомлено про проблему", "Тип", "Назва", "Стан", "Остання резервна копія", "збій резервного копіювання", "кворум втрачено", "Кластер", "Отримано", "Надіслано", "вільно", "тиск", "Керується високою доступністю", "спільне", "вимкнено", "знімки", "Створити знімок", "сховище майже заповнене", "Доступний Proxmox VE {v}", "пул ZFS деградований", "Ceph: попередження", "Ceph: помилка", "гостей без резервної копії", "Немає завдання резервного копіювання", "сертифікат спливає через {d} дн.", "сертифікат сплив", "підписка недійсна", "збій реплікації", "ресурсів HA з помилкою", "менеджер HA не відповідає", "HA знято з охорони", "HA знімається з охорони", "HA в очікуванні", "Зняти HA з охорони", "Поставити HA на охорону", "Інші дії", "Відновити", "Призупинити", "Гібернація", "Скинути", "Створити копію зараз", "Розблокувати", "Wake-on-LAN", "Запустити всіх гостей", "Зупинити всіх гостей", "Призупинити всіх гостей", "Копія всіх гостей", "Перезавантажити вузол", "Вимкнути вузол", "від хоста", "циклів живлення", "аварійних вимкнень", "Темп. ЦП", "Вузол", "заповниться через ~{d} дн.", "Проблеми", "Знайти гостя (назва або ID)", "Подробиці", "Немає відповідних гостей.", "Виберіть гостя в налаштуваннях картки."],
  tr: ["Düğümler", "çevrimiçi", "VM", "CT", "Disk", "Başlat", "Kapat", "Yeniden başlat", "Zorla durdur", "Proxmox varlığı bulunamadı. proxmoxve_custom entegrasyonu kurulu mu?", "Bu kart yeni bir Home Assistant sürümü gerektirir (arayüzde varlık ve cihaz kaydı).", "Konuklar", "Onayla: ", "Depolama", "Fiziksel diskler", "Swap", "Yük", "Sürüm", "güncelleme mevcut", "yedekleme sürüyor", "başarısız görevler", "depolama etkin değil", "disk sorunu", "Aşınma", "Kilitli", "Konuk aracısı yanıt vermiyor", "Sorun bildirildi", "Tür", "Ad", "Durum", "Son yedekleme", "yedekleme başarısız", "çoğunluk (quorum) kaybedildi", "Küme", "Alınan", "Gönderilen", "boş", "baskı", "Yüksek erişilebilirlik tarafından yönetiliyor", "paylaşımlı", "devre dışı", "anlık görüntüler", "Anlık görüntü oluştur", "depolama neredeyse dolu", "Proxmox VE {v} mevcut", "ZFS havuzu bozuk", "Ceph: uyarı", "Ceph: hata", "yedeksiz konuk", "Yedekleme görevi yok", "sertifika {d} gün içinde sona eriyor", "sertifikanın süresi doldu", "abonelik geçersiz", "çoğaltma başarısız", "hatalı HA kaynağı", "HA yöneticisi yanıt vermiyor", "HA devre dışı", "HA devre dışı bırakılıyor", "HA beklemede", "HA'yı devre dışı bırak", "HA'yı etkinleştir", "Diğer işlemler", "Sürdür", "Askıya al", "Hazırda beklet", "Sıfırla", "Şimdi yedekle", "Kilidi aç", "Wake-on-LAN", "Tüm konukları başlat", "Tüm konukları durdur", "Tüm konukları askıya al", "Tüm konukları yedekle", "Düğümü yeniden başlat", "Düğümü kapat", "ana makineden", "güç döngüsü", "beklenmedik kapanma", "CPU sıcaklığı", "Düğüm", "~{d} gün içinde dolu", "Sorunlar", "Konuk ara (ad veya ID)", "Ayrıntılar", "Eşleşen konuk yok.", "Kart ayarlarından bir konuk seçin."],
  ro: ["Noduri", "online", "VM", "CT", "Disc", "Pornește", "Oprește", "Repornește", "Oprire forțată", "Nu s-au găsit entități Proxmox. Este configurată integrarea proxmoxve_custom?", "Acest card necesită o versiune recentă de Home Assistant (registrul de entități și dispozitive în frontend).", "Oaspeți", "Confirmă: ", "Stocare", "Discuri fizice", "Swap", "Încărcare", "Versiune", "actualizări disponibile", "copie de rezervă în curs", "sarcini eșuate", "stocare inactivă", "problemă la disc", "Uzură", "Blocat", "Agentul oaspete nu răspunde", "Problemă raportată", "Tip", "Nume", "Stare", "Ultima copie de rezervă", "copie de rezervă eșuată", "cvorum pierdut", "Cluster", "Primit", "Trimis", "libere", "presiune", "Gestionat de înaltă disponibilitate", "partajat", "dezactivat", "instantanee", "Creează instantaneu", "stocare aproape plină", "Proxmox VE {v} disponibil", "pool ZFS degradat", "Ceph: avertisment", "Ceph: eroare", "oaspeți fără copie de rezervă", "Nicio sarcină de copie de rezervă", "certificatul expiră în {d} z", "certificat expirat", "abonament nevalid", "replicare eșuată", "resurse HA în eroare", "managerul HA nu răspunde", "HA dezarmată", "HA se dezarmează", "HA în așteptare", "Dezarmează HA", "Armează HA", "Mai multe acțiuni", "Reia", "Suspendă", "Hibernează", "Resetează", "Copie de rezervă acum", "Deblochează", "Wake-on-LAN", "Pornește toți oaspeții", "Oprește toți oaspeții", "Suspendă toți oaspeții", "Copie pentru toți oaspeții", "Repornește nodul", "Oprește nodul", "din gazdă", "cicluri de alimentare", "opriri bruște", "Temp. CPU", "Nod", "plin în ~{d} z", "Probleme", "Caută un oaspete (nume sau ID)", "Detalii", "Niciun oaspete nu corespunde.", "Alegeți un oaspete în setările cardului."],
  hu: ["Csomópontok", "online", "VM", "CT", "Lemez", "Indítás", "Leállítás", "Újraindítás", "Kényszerített leállítás", "Nem található Proxmox entitás. Be van állítva a proxmoxve_custom integráció?", "Ehhez a kártyához újabb Home Assistant szükséges (entitás- és eszközregiszter a frontendben).", "Vendégek", "Megerősítés: ", "Tárolók", "Fizikai lemezek", "Swap", "Terhelés", "Verzió", "frissítés érhető el", "mentés folyamatban", "sikertelen feladatok", "tároló inaktív", "lemezprobléma", "Kopás", "Zárolva", "A vendég ügynök nem válaszol", "Hiba jelezve", "Típus", "Név", "Állapot", "Utolsó mentés", "a mentés sikertelen", "kvórum elveszett", "Fürt", "Fogadott", "Küldött", "szabad", "nyomás", "Magas rendelkezésre állás kezeli", "megosztott", "letiltva", "pillanatképek", "Pillanatkép készítése", "a tároló majdnem megtelt", "Proxmox VE {v} elérhető", "ZFS-készlet leromlott", "Ceph: figyelmeztetés", "Ceph: hiba", "vendég mentés nélkül", "Nincs mentési feladat", "a tanúsítvány {d} nap múlva lejár", "a tanúsítvány lejárt", "az előfizetés érvénytelen", "a replikáció hibás", "hibás HA-erőforrás", "a HA-kezelő nem válaszol", "HA hatástalanítva", "HA hatástalanítása folyamatban", "HA készenlétben", "HA hatástalanítása", "HA élesítése", "További műveletek", "Folytatás", "Felfüggesztés", "Hibernálás", "Alaphelyzet", "Mentés most", "Feloldás", "Wake-on-LAN", "Összes vendég indítása", "Összes vendég leállítása", "Összes vendég felfüggesztése", "Összes vendég mentése", "Csomópont újraindítása", "Csomópont leállítása", "a gazdagépből", "bekapcsolási ciklus", "váratlan leállás", "CPU-hőm.", "Csomópont", "~{d} nap múlva megtelik", "Problémák", "Vendég keresése (név vagy ID)", "Részletek", "Nincs egyező vendég.", "Válasszon vendéget a kártya beállításaiban."],
  ja: ["ノード", "オンライン", "VM", "CT", "ディスク", "起動", "シャットダウン", "再起動", "強制停止", "Proxmox エンティティが見つかりません。proxmoxve_custom インテグレーションは設定されていますか？", "このカードには新しい Home Assistant が必要です（フロントエンドのエンティティ／デバイスレジストリ）。", "ゲスト", "確認: ", "ストレージ", "物理ディスク", "スワップ", "負荷", "バージョン", "件の更新あり", "バックアップ実行中", "失敗したタスク", "ストレージが無効", "ディスクの問題", "摩耗", "ロック中", "ゲストエージェントが応答しません", "問題が報告されました", "種類", "名前", "状態", "最後のバックアップ", "バックアップ失敗", "クォーラム喪失", "クラスター", "受信", "送信", "空き", "プレッシャー", "高可用性で管理", "共有", "無効", "スナップショット", "スナップショットを作成", "ストレージがほぼ満杯", "Proxmox VE {v} が利用可能", "ZFS プールの劣化", "Ceph: 警告", "Ceph: エラー", "台のゲストにバックアップなし", "バックアップジョブなし", "証明書の期限まで {d} 日", "証明書の期限切れ", "サブスクリプションが無効", "レプリケーション失敗", "件の HA リソースがエラー", "HA マネージャーが応答しません", "HA 解除済み", "HA 解除中", "HA 待機中", "HA を解除", "HA を有効化", "その他の操作", "再開", "一時停止", "ハイバネート", "リセット", "今すぐバックアップ", "ロック解除", "Wake-on-LAN", "すべてのゲストを起動", "すべてのゲストを停止", "すべてのゲストを一時停止", "すべてのゲストをバックアップ", "ノードを再起動", "ノードをシャットダウン", "（ホスト比）", "電源投入回数", "異常電源断", "CPU 温度", "ノード", "約 {d} 日で満杯", "問題", "ゲストを検索（名前または ID）", "詳細", "一致するゲストはありません。", "カードの設定でゲストを選択してください。"],
  zh: ["节点", "在线", "虚拟机", "容器", "磁盘", "启动", "关机", "重启", "强制停止", "未找到 Proxmox 实体。是否已设置 proxmoxve_custom 集成？", "此卡片需要较新版本的 Home Assistant（前端中的实体和设备注册表）。", "客户机", "确认：", "存储", "物理磁盘", "交换", "负载", "版本", "个可用更新", "正在备份", "失败的任务", "存储未激活", "磁盘故障", "磨损", "已锁定", "客户机代理无响应", "已报告问题", "类型", "名称", "状态", "上次备份", "备份失败", "仲裁丢失", "集群", "已接收", "已发送", "可用", "压力", "由高可用管理", "共享", "已禁用", "快照", "创建快照", "存储空间即将用尽", "Proxmox VE {v} 可用", "ZFS 池降级", "Ceph：警告", "Ceph：错误", "个客户机无备份", "无备份任务", "证书将在 {d} 天后过期", "证书已过期", "订阅无效", "复制失败", "个 HA 资源出错", "HA 管理器无响应", "HA 已解除", "HA 正在解除", "HA 待机", "解除 HA", "启用 HA", "更多操作", "恢复", "暂停", "休眠", "重置", "立即备份", "解锁", "网络唤醒", "启动所有客户机", "停止所有客户机", "暂停所有客户机", "备份所有客户机", "重启节点", "关闭节点", "占主机", "通电次数", "异常断电", "CPU 温度", "节点", "约 {d} 天后满", "问题", "搜索客户机（名称或 ID）", "详情", "没有匹配的客户机。", "请在卡片设置中选择一个客户机。"],
});
// Plural forms of the counted texts ("2 failed tasks"), per language, in the order of PLURAL_CATS. One form = no plural.
const PLURAL_KEYS = ["updates", "failed", "inactive", "diskProblem", "storageFull", "zfsProblem", "noBackup", "haErrors", "snapshots"];
const PLURALS = pack(PLURAL_KEYS, {
  en: [["update available", "updates available"], ["failed task", "failed tasks"], ["storage inactive", "storages inactive"], ["disk problem", "disk problems"], ["storage almost full", "storages almost full"], ["ZFS pool degraded", "ZFS pools degraded"], ["guest without backup", "guests without backup"], ["HA resource in error", "HA resources in error"], ["snapshot", "snapshots"]],
  fr: [["mise à jour", "mises à jour"], ["tâche en échec", "tâches en échec"], ["stockage inactif", "stockages inactifs"], ["disque en défaut", "disques en défaut"], ["stockage presque plein", "stockages presque pleins"], ["pool ZFS dégradé", "pools ZFS dégradés"], ["invité sans sauvegarde", "invités sans sauvegarde"], ["ressource HA en erreur", "ressources HA en erreur"], ["instantané", "instantanés"]],
  de: [["Update verfügbar", "Updates verfügbar"], ["fehlgeschlagene Aufgabe", "fehlgeschlagene Aufgaben"], ["Speicher inaktiv", "Speicher inaktiv"], ["Datenträgerproblem", "Datenträgerprobleme"], ["Speicher fast voll", "Speicher fast voll"], ["ZFS-Pool beeinträchtigt", "ZFS-Pools beeinträchtigt"], ["Gast ohne Sicherung", "Gäste ohne Sicherung"], ["HA-Ressource im Fehlerzustand", "HA-Ressourcen im Fehlerzustand"], ["Snapshot", "Snapshots"]],
  es: [["actualización disponible", "actualizaciones disponibles"], ["tarea fallida", "tareas fallidas"], ["almacenamiento inactivo", "almacenamientos inactivos"], ["problema de disco", "problemas de disco"], ["almacenamiento casi lleno", "almacenamientos casi llenos"], ["pool ZFS degradado", "pools ZFS degradados"], ["invitado sin copia de seguridad", "invitados sin copia de seguridad"], ["recurso HA con error", "recursos HA con error"], ["instantánea", "instantáneas"]],
  it: [["aggiornamento disponibile", "aggiornamenti disponibili"], ["attività non riuscita", "attività non riuscite"], ["archiviazione inattiva", "archiviazioni inattive"], ["problema al disco", "problemi ai dischi"], ["archiviazione quasi piena", "archiviazioni quasi piene"], ["pool ZFS degradato", "pool ZFS degradati"], ["guest senza backup", "guest senza backup"], ["risorsa HA in errore", "risorse HA in errore"], ["snapshot", "snapshot"]],
  pt: [["atualização disponível", "atualizações disponíveis"], ["tarefa com falha", "tarefas com falha"], ["armazenamento inativo", "armazenamentos inativos"], ["problema no disco", "problemas nos discos"], ["armazenamento quase cheio", "armazenamentos quase cheios"], ["pool ZFS degradado", "pools ZFS degradados"], ["convidado sem cópia de segurança", "convidados sem cópia de segurança"], ["recurso HA com erro", "recursos HA com erro"], ["instantâneo", "instantâneos"]],
  nl: [["update beschikbaar", "updates beschikbaar"], ["mislukte taak", "mislukte taken"], ["opslag inactief", "opslagen inactief"], ["schijfprobleem", "schijfproblemen"], ["opslag bijna vol", "opslagen bijna vol"], ["ZFS-pool gedegradeerd", "ZFS-pools gedegradeerd"], ["gast zonder back-up", "gasten zonder back-up"], ["HA-resource in fout", "HA-resources in fout"], ["snapshot", "snapshots"]],
  pl: [["dostępna aktualizacja", "dostępne aktualizacje", "dostępnych aktualizacji"], ["nieudane zadanie", "nieudane zadania", "nieudanych zadań"], ["nieaktywny magazyn", "nieaktywne magazyny", "nieaktywnych magazynów"], ["problem z dyskiem", "problemy z dyskami", "problemów z dyskami"], ["prawie pełny magazyn", "prawie pełne magazyny", "prawie pełnych magazynów"], ["zdegradowana pula ZFS", "zdegradowane pule ZFS", "zdegradowanych pul ZFS"], ["gość bez kopii zapasowej", "gości bez kopii zapasowej", "gości bez kopii zapasowej"], ["zasób HA z błędem", "zasoby HA z błędem", "zasobów HA z błędem"], ["migawka", "migawki", "migawek"]],
  cs: [["dostupná aktualizace", "dostupné aktualizace", "dostupných aktualizací"], ["neúspěšná úloha", "neúspěšné úlohy", "neúspěšných úloh"], ["neaktivní úložiště", "neaktivní úložiště", "neaktivních úložišť"], ["problém s diskem", "problémy s disky", "problémů s disky"], ["téměř plné úložiště", "téměř plná úložiště", "téměř plných úložišť"], ["degradovaný ZFS pool", "degradované ZFS pooly", "degradovaných ZFS poolů"], ["host bez zálohy", "hosté bez zálohy", "hostů bez zálohy"], ["prostředek HA v chybě", "prostředky HA v chybě", "prostředků HA v chybě"], ["snímek", "snímky", "snímků"]],
  sv: [["uppdatering tillgänglig", "uppdateringar tillgängliga"], ["misslyckad uppgift", "misslyckade uppgifter"], ["lagring inaktiv", "lagringar inaktiva"], ["diskproblem", "diskproblem"], ["lagring nästan full", "lagringar nästan fulla"], ["ZFS-pool degraderad", "ZFS-pooler degraderade"], ["gäst utan säkerhetskopia", "gäster utan säkerhetskopia"], ["HA-resurs med fel", "HA-resurser med fel"], ["ögonblicksbild", "ögonblicksbilder"]],
  da: [["opdatering tilgængelig", "opdateringer tilgængelige"], ["mislykket opgave", "mislykkede opgaver"], ["lager inaktivt", "lagre inaktive"], ["diskproblem", "diskproblemer"], ["lager næsten fuldt", "lagre næsten fulde"], ["ZFS-pool forringet", "ZFS-pools forringet"], ["gæst uden sikkerhedskopi", "gæster uden sikkerhedskopi"], ["HA-ressource med fejl", "HA-ressourcer med fejl"], ["snapshot", "snapshots"]],
  nb: [["oppdatering tilgjengelig", "oppdateringer tilgjengelig"], ["mislykket oppgave", "mislykkede oppgaver"], ["lagring inaktiv", "lagringer inaktive"], ["diskproblem", "diskproblemer"], ["lagring nesten full", "lagringer nesten fulle"], ["ZFS-pool degradert", "ZFS-pooler degradert"], ["gjest uten sikkerhetskopi", "gjester uten sikkerhetskopi"], ["HA-ressurs med feil", "HA-ressurser med feil"], ["øyeblikksbilde", "øyeblikksbilder"]],
  fi: [["päivitys saatavilla", "päivitystä saatavilla"], ["epäonnistunut tehtävä", "epäonnistunutta tehtävää"], ["tallennustila ei käytössä", "tallennustilaa ei käytössä"], ["levyongelma", "levyongelmaa"], ["tallennustila lähes täynnä", "tallennustilaa lähes täynnä"], ["ZFS-pooli heikentynyt", "ZFS-poolia heikentynyt"], ["vieras ilman varmuuskopiota", "vierasta ilman varmuuskopiota"], ["HA-resurssi virhetilassa", "HA-resurssia virhetilassa"], ["tilannevedos", "tilannevedosta"]],
  ru: [["обновление доступно", "обновления доступно", "обновлений доступно"], ["неудачная задача", "неудачные задачи", "неудачных задач"], ["хранилище неактивно", "хранилища неактивны", "хранилищ неактивно"], ["проблема с диском", "проблемы с дисками", "проблем с дисками"], ["хранилище почти заполнено", "хранилища почти заполнены", "хранилищ почти заполнено"], ["пул ZFS деградирован", "пула ZFS деградированы", "пулов ZFS деградировано"], ["гость без резервной копии", "гостя без резервной копии", "гостей без резервной копии"], ["ресурс HA с ошибкой", "ресурса HA с ошибкой", "ресурсов HA с ошибкой"], ["снимок", "снимка", "снимков"]],
  uk: [["оновлення доступне", "оновлення доступні", "оновлень доступно"], ["невдале завдання", "невдалі завдання", "невдалих завдань"], ["сховище неактивне", "сховища неактивні", "сховищ неактивні"], ["проблема з диском", "проблеми з дисками", "проблем з дисками"], ["сховище майже заповнене", "сховища майже заповнені", "сховищ майже заповнені"], ["пул ZFS деградований", "пули ZFS деградовані", "пулів ZFS деградовано"], ["гість без резервної копії", "гості без резервної копії", "гостей без резервної копії"], ["ресурс HA з помилкою", "ресурси HA з помилкою", "ресурсів HA з помилкою"], ["знімок", "знімки", "знімків"]],
  tr: [["güncelleme mevcut"], ["başarısız görev"], ["depolama etkin değil"], ["disk sorunu"], ["depolama neredeyse dolu"], ["ZFS havuzu bozuk"], ["yedeksiz konuk"], ["hatalı HA kaynağı"], ["anlık görüntü"]],
  ro: [["actualizare disponibilă", "actualizări disponibile", "de actualizări disponibile"], ["sarcină eșuată", "sarcini eșuate", "de sarcini eșuate"], ["stocare inactivă", "stocări inactive", "de stocări inactive"], ["problemă la disc", "probleme la discuri", "de probleme la discuri"], ["stocare aproape plină", "stocări aproape pline", "de stocări aproape pline"], ["pool ZFS degradat", "pool-uri ZFS degradate", "de pool-uri ZFS degradate"], ["oaspete fără copie de rezervă", "oaspeți fără copie de rezervă", "de oaspeți fără copie de rezervă"], ["resursă HA în eroare", "resurse HA în eroare", "de resurse HA în eroare"], ["instantaneu", "instantanee", "de instantanee"]],
  hu: [["frissítés érhető el"], ["sikertelen feladat"], ["inaktív tároló"], ["lemezprobléma"], ["majdnem megtelt tároló"], ["leromlott ZFS-készlet"], ["vendég mentés nélkül"], ["hibás HA-erőforrás"], ["pillanatkép"]],
  ja: [["件の更新あり"], ["件のタスクが失敗"], ["件のストレージが無効"], ["件のディスクの問題"], ["件のストレージがほぼ満杯"], ["件の ZFS プールが劣化"], ["台のゲストにバックアップなし"], ["件の HA リソースがエラー"], ["件のスナップショット"]],
  zh: [["个可用更新"], ["个失败的任务"], ["个存储未激活"], ["个磁盘故障"], ["个存储空间即将用尽"], ["个 ZFS 池降级"], ["个客户机无备份"], ["个 HA 资源出错"], ["个快照"]],
});
const PLURAL_CATS = { pl: ["one", "few", "many"], ru: ["one", "few", "many"], uk: ["one", "few", "many"], cs: ["one", "few", "other"], ro: ["one", "few", "other"] };
// strings that are identical or not translated per language
Object.assign(STRINGS.en, { cpu: "CPU", ram: "RAM", io: "IO delay", uptime: "Uptime", running: "running", stopped: "stopped", unknown: "unknown", temp: "Temp", sortId: "ID" });
const LANGUAGES = [["auto", "Auto"], ["en", "English"], ["fr", "Français"], ["de", "Deutsch"], ["es", "Español"], ["it", "Italiano"], ["pt", "Português"], ["nl", "Nederlands"], ["pl", "Polski"], ["cs", "Čeština"], ["sv", "Svenska"], ["da", "Dansk"], ["nb", "Norsk"], ["fi", "Suomi"], ["ru", "Русский"], ["uk", "Українська"], ["tr", "Türkçe"], ["ro", "Română"], ["hu", "Magyar"], ["ja", "日本語"], ["zh", "中文"]];

const css = `
:host { display:block; height:100%;
  --px-accent:#e57000; --px-ok:var(--success-color,#43a047); --px-warn:var(--warning-color,#ffa600);
  --px-crit:var(--error-color,#db4437); --px-off:var(--disabled-text-color,#9e9e9e);
  --px-tile:var(--secondary-background-color,rgba(127,127,127,.08)); --px-line:color-mix(in srgb,var(--primary-text-color) 9%,transparent); }
ha-card { --px-accent2:color-mix(in srgb,var(--px-accent) 70%,#fff); position:relative; height:100%; overflow:hidden; container-type:inline-size; overflow-anchor:none; padding:18px 16px 16px; box-sizing:border-box; display:flex; flex-direction:column; gap:24px; }
ha-card::before { content:""; position:absolute; inset:0 0 auto 0; height:110px; pointer-events:none;
  background:linear-gradient(135deg,color-mix(in srgb,var(--px-accent) 24%,transparent),transparent 72%); }
ha-card > * { position:relative; }
.hdr { display:flex; align-items:center; gap:12px; }
.badge { --mdc-icon-size:26px; width:46px; height:46px; border-radius:14px; flex:none; display:grid; place-items:center; color:#fff;
  background:linear-gradient(135deg,var(--px-accent),var(--px-accent2)); box-shadow:0 4px 12px color-mix(in srgb,var(--px-accent) 40%,transparent); }
.title { font-size:18px; font-weight:600; letter-spacing:.01em; color:var(--primary-text-color); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.chips { display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }
.chip { font-size:12px; font-weight:500; padding:4px 10px; border-radius:14px; white-space:nowrap; background:color-mix(in srgb,var(--px-ok) 16%,transparent); color:color-mix(in srgb,var(--px-ok) 65%,var(--primary-text-color)); }
.chip.warn { background:color-mix(in srgb,var(--px-warn) 20%,transparent); color:color-mix(in srgb,var(--px-warn) 65%,var(--primary-text-color)); }
.chip.crit { background:color-mix(in srgb,var(--px-crit) 18%,transparent); color:color-mix(in srgb,var(--px-crit) 65%,var(--primary-text-color)); }
.chip.info { background:color-mix(in srgb,var(--px-accent) 18%,transparent); color:color-mix(in srgb,var(--px-accent) 70%,var(--primary-text-color)); }
.alerts { display:flex; flex-wrap:wrap; gap:6px; margin-top:-12px; }
.sec { display:flex; align-items:center; gap:10px; margin-bottom:-10px; font-size:11px; font-weight:600; letter-spacing:.09em; text-transform:uppercase; color:var(--secondary-text-color); }
.sec { cursor:pointer; user-select:none; -webkit-user-select:none; }
.sec:hover .stt { color:var(--primary-text-color); }
.sec .chev { --mdc-icon-size:18px; order:3; display:inline-flex; transition:transform .2s; }
.sec.closed .chev { transform:rotate(-90deg); }
.sec::before { content:""; width:6px; height:6px; border-radius:50%; background:var(--px-accent); }
.sec::after { content:""; flex:1; height:1px; background:var(--px-line); order:1; }
.sortbar { cursor:default; order:2; display:flex; gap:4px; flex-wrap:wrap; text-transform:none; letter-spacing:0; }
.sortbtn { font:inherit; font-size:11px; font-weight:500; padding:3px 10px; border-radius:12px; cursor:pointer; border:1px solid var(--px-line); background:transparent; color:var(--secondary-text-color); transition:all .15s; }
.sortbtn:hover { color:var(--px-accent); border-color:var(--px-accent); }
.sortbtn.on { background:color-mix(in srgb,var(--px-accent) 16%,transparent); color:var(--px-accent); border-color:var(--px-accent); }
.dot { width:9px; height:9px; border-radius:50%; background:var(--px-off); flex:none; }
.dot.on { background:var(--px-ok); box-shadow:0 0 0 3px color-mix(in srgb,var(--px-ok) 25%,transparent); }
.dot.off { background:var(--px-crit); }
.bar { height:7px; border-radius:4px; background:color-mix(in srgb,var(--primary-text-color) 11%,transparent); overflow:hidden; }
.bar > i { display:block; height:100%; border-radius:4px; transition:width .7s ease; background:linear-gradient(90deg,color-mix(in srgb,var(--px-ok) 65%,#fff),var(--px-ok)); }
.bar > i.warn { background:linear-gradient(90deg,color-mix(in srgb,var(--px-warn) 65%,#fff),var(--px-warn)); }
.bar > i.crit { background:linear-gradient(90deg,color-mix(in srgb,var(--px-crit) 65%,#fff),var(--px-crit)); }
.nodes { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:12px; }
.node { border-radius:18px; padding:18px 14px 16px; background:var(--px-tile); border:1px solid var(--px-line); cursor:pointer; display:flex; flex-direction:column; gap:16px; transition:transform .15s, box-shadow .15s; }
.node:hover { transform:translateY(-1px); box-shadow:0 6px 16px rgba(0,0,0,.12); }
.node.off { opacity:.6; }
.nhead { display:flex; align-items:center; gap:8px; }
.nname { font-weight:600; font-size:15px; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--primary-text-color); }
.up { font-size:11px; padding:2px 8px; border-radius:10px; background:color-mix(in srgb,var(--primary-text-color) 8%,transparent); color:var(--secondary-text-color); }
.rings { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.ring { --c:var(--px-ok); display:flex; flex-direction:column; align-items:center; gap:4px; }
.ring.warn { --c:var(--px-warn); } .ring.crit { --c:var(--px-crit); } .ring.none { --c:var(--px-off); }
.rg { position:relative; width:100%; max-width:100px; aspect-ratio:1; }
.rg svg { width:100%; height:100%; display:block; }
.rf { fill:color-mix(in srgb,var(--c) 7%,transparent); stroke:none; }
.rt { fill:none; stroke:color-mix(in srgb,var(--primary-text-color) 10%,transparent); stroke-width:6; }
.rv { fill:none; stroke:var(--c); stroke-width:6; stroke-linecap:round; transition:stroke-dashoffset .9s cubic-bezier(.3,.7,.2,1); filter:drop-shadow(0 1px 3px color-mix(in srgb,var(--c) 40%,transparent)); }
.rg b { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:clamp(16px,5cqw,21px); font-weight:700; letter-spacing:-.02em; color:var(--primary-text-color); font-variant-numeric:tabular-nums; }
.rg b small { font-size:.55em; font-weight:500; opacity:.65; margin-left:1px; }
.ring > span { font-size:12px; font-weight:500; color:var(--secondary-text-color); }
.metric { display:grid; grid-template-columns:42px 1fr 44px; align-items:center; gap:8px; font-size:12px; color:var(--secondary-text-color); }
.metric b { text-align:right; font-weight:600; color:var(--primary-text-color); font-variant-numeric:tabular-nums; }
.ver { font-size:11px; font-weight:600; padding:3px 10px; border-radius:10px; white-space:nowrap; color:var(--px-accent); background:color-mix(in srgb,var(--px-accent) 14%,transparent); }
.ver.new { cursor:pointer; color:color-mix(in srgb,var(--px-warn) 75%,var(--primary-text-color)); background:color-mix(in srgb,var(--px-warn) 20%,transparent); }
.strip { display:grid; grid-template-columns:repeat(var(--n,2),minmax(0,1fr)); row-gap:12px; padding-top:14px; border-top:1px solid var(--px-line); }
.si { --c:var(--px-accent); display:flex; align-items:center; justify-content:center; gap:10px; min-width:0; padding:0 10px; }
.si + .si { border-left:1px solid var(--px-line); }
.strip[style*="--n:3"] .si { gap:6px; padding:0 4px; } .strip[style*="--n:3"] .si .ic { width:28px; height:28px; --mdc-icon-size:16px; } .strip[style*="--n:3"] .si b { font-size:16px; }
.ghead { grid-column:1 / -1; display:flex; align-items:center; gap:6px; margin:6px 0 -2px 4px; font-size:12px; font-weight:600; color:var(--secondary-text-color); --mdc-icon-size:16px; }
.ghead ha-icon { color:var(--px-accent); }
.si.warn { --c:var(--px-warn); } .si.crit { --c:var(--px-crit); }
.si .ic { --mdc-icon-size:18px; flex:none; width:34px; height:34px; border-radius:50%; display:grid; place-items:center; color:var(--c); background:color-mix(in srgb,var(--c) 14%,transparent); }
.si b { display:block; font-size:18px; font-weight:700; letter-spacing:-.01em; line-height:1.1; color:var(--primary-text-color); font-variant-numeric:tabular-nums; white-space:nowrap; }
.si.warn b { color:var(--px-warn); } .si.crit b { color:var(--px-crit); }
.si small { display:block; font-size:11px; color:var(--secondary-text-color); margin-top:2px; white-space:nowrap; }
.guests { display:flex; flex-direction:column; gap:8px; }
.g { display:grid; grid-template-columns:40px minmax(0,1.7fr) minmax(0,2.2fr) auto; align-items:center; gap:12px; padding:10px 12px; border-radius:14px; background:var(--px-tile); border:1px solid var(--px-line); border-left:4px solid var(--px-ok); cursor:pointer; transition:background .15s; }
.g:hover { background:color-mix(in srgb,var(--px-tile) 80%,var(--primary-text-color) 8%); }
.g.off { border-left-color:var(--px-off); } .g.other { border-left-color:var(--px-warn); }
.g.off .gn, .g.off .gms { opacity:.55; }
.gi { --mdc-icon-size:22px; width:40px; height:40px; border-radius:12px; display:grid; place-items:center; color:var(--px-ok); background:color-mix(in srgb,var(--px-ok) 16%,transparent); }
.g.off .gi { color:var(--px-off); background:color-mix(in srgb,var(--px-off) 18%,transparent); }
.g.other .gi { color:var(--px-warn); background:color-mix(in srgb,var(--px-warn) 18%,transparent); }
.gi .dot { display:none; }
.gn { min-width:0; } .gn .gname { font-size:14px; font-weight:600; color:var(--primary-text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.gn .gsub { font-size:11px; color:var(--secondary-text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ring > span em { display:block; font-style:normal; font-size:10px; font-weight:400; opacity:.8; font-variant-numeric:tabular-nums; }
.gm .gs { font-size:10px; opacity:.8; font-variant-numeric:tabular-nums; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.snap { display:inline-flex; align-items:center; gap:2px; margin-left:8px; font-size:11px; font-weight:500; color:var(--secondary-text-color); vertical-align:1px; }
.snap ha-icon { --mdc-icon-size:14px; color:var(--px-accent); }
.bd.info { color:var(--secondary-text-color); }
.ssz { font-size:11px; color:var(--secondary-text-color); font-variant-numeric:tabular-nums; margin-top:-2px; }
.stor.dis { opacity:.55; }
.ssz.kind { display:flex; align-items:center; gap:6px; margin-top:-4px; } .ssz .tag { font-size:10px; font-weight:600; padding:1px 6px; border-radius:8px; background:color-mix(in srgb,var(--primary-text-color) 8%,transparent); }
.ssz.crit { color:var(--px-crit); font-weight:600; } .ssz.warn { color:var(--px-warn); font-weight:600; }
.dot.warn { background:var(--px-warn); }
.alerts .chip[data-more] { cursor:pointer; }
.sh .shr { --mdc-icon-size:14px; color:var(--secondary-text-color); flex:none; }
.gnet { display:flex; flex-wrap:wrap; gap:4px 12px; margin-top:3px; font-size:11px; color:var(--secondary-text-color); font-variant-numeric:tabular-nums; }
.gnet span { display:inline-flex; align-items:center; gap:4px; white-space:nowrap; }
.gnet ha-icon { --mdc-icon-size:14px; color:var(--px-accent); }
.gms { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; min-width:0; }
.gm { display:flex; flex-direction:column; gap:4px; font-size:11px; color:var(--secondary-text-color); min-width:0; }
.gl { display:flex; justify-content:space-between; gap:4px; }
.gl b { font-weight:600; color:var(--primary-text-color); font-variant-numeric:tabular-nums; }
.acts { display:flex; gap:4px; }
.act { --mdc-icon-size:20px; width:32px; height:32px; border-radius:50%; display:grid; place-items:center; cursor:pointer; color:var(--secondary-text-color); border:1px solid var(--px-line); background:transparent; padding:0; transition:all .15s; }
.act:hover { background:color-mix(in srgb,var(--px-accent) 18%,transparent); color:var(--px-accent); border-color:var(--px-accent); }
.act.armed { background:var(--px-crit); color:#fff; border-color:var(--px-crit); }
.act.on { background:color-mix(in srgb,var(--px-accent) 16%,transparent); color:var(--px-accent); border-color:var(--px-accent); }
.nhead .act { width:28px; height:28px; --mdc-icon-size:18px; flex:none; }
.menu { grid-column:1 / -1; display:flex; flex-wrap:wrap; gap:6px; padding-top:8px; border-top:1px solid var(--px-line); cursor:default; }
.mbtn { font:inherit; font-size:12px; font-weight:500; display:inline-flex; align-items:center; gap:6px; padding:5px 12px 5px 8px; border-radius:16px; cursor:pointer; border:1px solid var(--px-line); background:transparent; color:var(--primary-text-color); transition:all .15s; --mdc-icon-size:16px; }
.mbtn ha-icon { color:var(--px-accent); }
.mbtn:hover { border-color:var(--px-accent); background:color-mix(in srgb,var(--px-accent) 12%,transparent); }
.mbtn.armed { background:var(--px-crit); border-color:var(--px-crit); color:#fff; } .mbtn.armed ha-icon { color:#fff; }
.dk .hr small { display:block; font-size:10px; opacity:.8; white-space:nowrap; }
.chip[data-more] { cursor:pointer; }
[data-more]:focus-visible, button:focus-visible, .sec:focus-visible, .gsearch:focus-visible { outline:2px solid var(--px-accent); outline-offset:2px; }
.ssz.fc { display:flex; align-items:center; gap:4px; --mdc-icon-size:13px; } .ssz.fc ha-icon { color:var(--px-accent); } .ssz.fc.warn ha-icon, .ssz.fc.crit ha-icon { color:inherit; }
.gtools { display:flex; gap:8px; align-items:center; margin-bottom:-12px; }
.gsearch { flex:1; min-width:0; font:inherit; font-size:13px; padding:6px 12px; border-radius:16px; border:1px solid var(--px-line); background:var(--px-tile); color:var(--primary-text-color); }
.gtools .sortbtn { display:inline-flex; align-items:center; gap:4px; --mdc-icon-size:14px; white-space:nowrap; padding:5px 12px; }
.exp { display:inline-flex; vertical-align:-3px; margin-left:4px; padding:0; border:0; background:none; cursor:pointer; color:var(--secondary-text-color); --mdc-icon-size:18px; border-radius:6px; }
.exp:hover { color:var(--px-accent); }
.gx { grid-column:1 / -1; display:flex; flex-direction:column; gap:8px; padding-top:8px; border-top:1px solid var(--px-line); cursor:default; }
.gxl { display:flex; flex-wrap:wrap; gap:6px; } .gxl .chip { display:inline-flex; align-items:center; gap:4px; --mdc-icon-size:14px; white-space:normal; }
ha-card.single { padding:12px; gap:0; } ha-card.single::before { display:none; } ha-card.single .g { border:0; background:none; padding:0; border-left:4px solid var(--px-ok); padding-left:10px; border-radius:0; }
ha-card.single .g.off { border-left-color:var(--px-off); } ha-card.single .g.other { border-left-color:var(--px-warn); }
ha-card.compact { padding:12px; gap:16px; } ha-card.compact::before { height:80px; } ha-card.compact .badge { width:38px; height:38px; --mdc-icon-size:22px; }
ha-card.compact .node { padding:12px; gap:10px; } ha-card.compact .g { padding:6px 10px; row-gap:4px; } ha-card.compact .gi { width:32px; height:32px; }
ha-card.compact .gnet, ha-card.compact .gs, ha-card.compact .ssz:not(.crit):not(.warn), ha-card.compact .strip .si.wide { display:none; } ha-card.compact .stor { padding:8px 10px; gap:6px; }
.bd { --mdc-icon-size:15px; display:inline-flex; vertical-align:-3px; margin-left:6px; color:var(--px-warn); }
.bd.crit { color:var(--px-crit); }
.stors { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:10px; }
.stor { border-radius:14px; padding:10px 12px; background:var(--px-tile); border:1px solid var(--px-line); cursor:pointer; display:flex; flex-direction:column; gap:8px; min-width:0; transition:transform .15s; }
.stor:hover { transform:translateY(-1px); }
.stor.off { border-color:var(--px-crit); }
.sh { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:var(--primary-text-color); min-width:0; }
.sh span:nth-child(2) { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.sh b { font-weight:700; font-size:15px; font-variant-numeric:tabular-nums; }
.dks { display:flex; flex-direction:column; gap:6px; }
.dk { display:grid; grid-template-columns:14px minmax(0,1.6fr) auto minmax(0,1fr) 86px; align-items:center; gap:12px; padding:8px 12px; border-radius:12px; background:var(--px-tile); border:1px solid var(--px-line); cursor:pointer; font-size:12px; color:var(--secondary-text-color); }
.dk .dn { font-size:13px; font-weight:500; color:var(--primary-text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dk .tp { font-weight:600; padding:2px 9px; border-radius:10px; font-variant-numeric:tabular-nums; color:var(--px-ok); background:color-mix(in srgb,var(--px-ok) 14%,transparent); }
.dk .tp.warn { color:var(--px-warn); background:color-mix(in srgb,var(--px-warn) 16%,transparent); }
.dk .tp.crit { color:var(--px-crit); background:color-mix(in srgb,var(--px-crit) 16%,transparent); }
.dk .hr { text-align:right; font-variant-numeric:tabular-nums; }
.dk .wr { display:flex; flex-direction:column; gap:3px; }
.empty { padding:16px; text-align:center; color:var(--secondary-text-color); }
.guests.cols-2, .dks.cols-2 { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.guests.cols-2 .g { grid-template-columns:40px minmax(0,1fr) auto; row-gap:8px; } .guests.cols-2 .g .gms { grid-column:1 / -1; grid-row:2; }
.dks.cols-2 .dk { grid-template-columns:14px minmax(0,1fr) auto minmax(0,1fr); } .dks.cols-2 .dk .hr { display:none; }
@container (min-width:900px) {
  .guests.cols-auto, .dks.cols-auto { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
  .guests.cols-auto .g { grid-template-columns:40px minmax(0,1fr) auto; row-gap:8px; } .guests.cols-auto .g .gms { grid-column:1 / -1; grid-row:2; }
  .dks.cols-auto .dk { grid-template-columns:14px minmax(0,1fr) auto minmax(0,1fr); } .dks.cols-auto .dk .hr { display:none; }
}
.strip .si.wide { grid-column:1 / -1; justify-content:center; text-align:center; border-left:0; border-top:1px solid var(--px-line); padding-top:12px; }
.strip .si.wide b { font-size:15px; white-space:normal; }
.hist { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; }
.sp { --c:var(--px-ok); display:flex; flex-direction:column; gap:4px; min-width:0; }
.sp.warn { --c:var(--px-warn); } .sp.crit { --c:var(--px-crit); } .sp.none { --c:var(--px-off); }
.sp .sl { font-size:11px; color:var(--secondary-text-color); display:flex; justify-content:space-between; }
.sp svg { width:100%; height:44px; display:block; border-radius:8px; background:color-mix(in srgb,var(--primary-text-color) 4%,transparent); }
.sp .sa { fill:color-mix(in srgb,var(--c) 22%,transparent); stroke:none; }
.sp .sk { fill:none; stroke:var(--c); stroke-width:1.6; stroke-linejoin:round; stroke-linecap:round; vector-effect:non-scaling-stroke; }
.sp.skel svg { animation:px-pulse 1.4s ease-in-out infinite; }
@keyframes px-pulse { 50% { opacity:.45; } }
.node.cluster { border-color:color-mix(in srgb,var(--px-accent) 35%,transparent); background:color-mix(in srgb,var(--px-accent) 7%,var(--px-tile)); cursor:default; gap:10px; }
.node.cluster .nhead ha-icon { --mdc-icon-size:20px; color:var(--px-accent); }
@container (max-width:640px) {
  .g { grid-template-columns:40px minmax(0,1fr) auto; row-gap:8px; } .g .gms { grid-column:1 / -1; grid-row:2; }
}
@container (max-width:520px) {
  .dk { grid-template-columns:14px minmax(0,1fr) auto minmax(0,1fr); } .dk .hr { display:none; }
}
@container (max-width:340px) {
  .badge { width:38px; height:38px; } .chips { display:none; } .g .gms { gap:8px; }
}
@media (prefers-reduced-motion:reduce) { .bar > i, .rv, .node, .stor, .sec .chev { transition:none; } .sp.skel svg { animation:none; } }
`;

const ICON = { server: "mdi:server", vm: "mdi:monitor", ct: "mdi:cube-outline", power: "mdi:power", restart: "mdi:restart", stop: "mdi:stop-circle-outline", proxmox: "mdi:server-network" };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (s) => { if (s === undefined || s === null || s === "" || s === "unknown" || s === "unavailable") return null; const n = Number(s); return Number.isFinite(n) ? n : null; };
const level = (v, t) => (v === null ? "" : v >= t.critical ? "crit" : v >= t.warning ? "warn" : "");
const clamp = (v) => Math.max(0, Math.min(100, v));

function fmtUptime(state) {
  let s = num(state);
  if (s === null) {
    const d = Date.parse(state);
    if (Number.isNaN(d)) return "";
    s = (Date.now() - d) / 1000; // timestamp sensor = boot time
  }
  if (s < 0) return "";
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}

/**
 * Update `target` in place so it matches `html`, keeping every unchanged DOM node.
 * Replacing innerHTML on each value change tears down the whole card (icons, focus, scroll anchors),
 * which made the page jump on mobile; patching only touches what actually changed.
 */
function morph(target, html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  patchChildren(target, tpl.content);
}
function patchChildren(a, b) {
  while (a.childNodes.length > b.childNodes.length) a.removeChild(a.lastChild);
  for (let i = 0; i < b.childNodes.length; i++) {
    const nb = b.childNodes[i], na = a.childNodes[i];
    if (!na) { a.appendChild(document.importNode(nb, true)); continue; }
    if (na.nodeType !== nb.nodeType || na.nodeName !== nb.nodeName) { a.replaceChild(document.importNode(nb, true), na); continue; }
    if (nb.nodeType === 3) { if (na.nodeValue !== nb.nodeValue) na.nodeValue = nb.nodeValue; continue; }
    if (nb.nodeType === 1) {
      // custom elements (ha-icon…) manage some of their own attributes: never strip those
      if (!na.localName.includes("-")) for (const at of [...na.attributes]) if (!nb.hasAttribute(at.name)) na.removeAttribute(at.name);
      for (const at of nb.attributes) if (na.getAttribute(at.name) !== at.value) na.setAttribute(at.name, at.value);
      // an empty custom element in the template may have rendered its own content: leave it alone
      if (na.localName.includes("-") && !nb.childNodes.length) continue;
      patchChildren(na, nb);
    }
  }
}

function fmtDate(state, lang) {
  const d = Date.parse(state);
  if (Number.isNaN(d)) return "";
  try { return new Date(d).toLocaleString(lang || undefined, { dateStyle: "long", timeStyle: "medium" }); } catch (e) { return new Date(d).toLocaleString(); }
}
const BYTES = { bit: 1 / 8, kbit: 1e3 / 8, Mbit: 1e6 / 8, Gbit: 1e9 / 8, Tbit: 1e12 / 8, kibit: 1024 / 8, Mibit: 1048576 / 8, Gibit: 1073741824 / 8,
  B: 1, kB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, PB: 1e15, KiB: 1024, MiB: 1048576, GiB: 1073741824, TiB: 1099511627776 };
const RATE_BYTES = ["B/s", "kB/s", "MB/s", "GB/s"], RATE_BITS = ["bit/s", "kbit/s", "Mbit/s", "Gbit/s"], SIZES = ["B", "kB", "MB", "GB", "TB"];
function fmtScaled(v, units) {
  let i = 0;
  while (v >= 1000 && i < units.length - 1) { v /= 1000; i++; }
  const d = i === 0 ? 0 : v >= 100 ? 0 : v >= 10 ? 1 : 2;
  return `${v.toFixed(d)} ${units[i]}`;
}
/** "2.5 / 4.0 GB": both values in the unit of the total. */
function fmtUsedTotal(used, total) {
  let i = 0, t = total, u = used;
  while (t >= 1000 && i < SIZES.length - 1) { t /= 1000; u /= 1000; i++; }
  const d = t >= 100 ? 0 : t >= 10 ? 1 : 2;
  return `${u.toFixed(d)} / ${t.toFixed(d)} ${SIZES[i]}`;
}
/** Bytes per unit of an entity ("" = bytes); null when the unit is unknown, so a wrong scale is never shown silently. */
function unitFactor(st) {
  const u = st?.attributes?.unit_of_measurement;
  return u ? BYTES[u] ?? null : 1;
}
/** Next network sample record for a cumulative counter. rec / cur = { b: bytes, t: ms }; the rate is in bytes per second. */
function nextNet(rec, cur, now) {
  if (!rec) return { ...cur, dt: 0, rate: null };
  if (cur.t !== rec.t) {
    const dt = (cur.t - rec.t) / 1000, r = dt > 0 ? (cur.b - rec.b) / dt : null; // negative = counter reset (guest restarted)
    return { ...cur, dt, rate: r !== null && r >= 0 ? r : null };
  }
  // HA does not update a state whose value is unchanged: no new sample for a few polls = no traffic
  return (now - rec.t) / 1000 > Math.max(3 * rec.dt, 90) ? { ...rec, rate: 0 } : rec;
}
/** Sparkline paths (viewBox 120 x 36) for a series of 0..100 values; null = no data. */
function sparkPaths(pts) {
  const W = 120, H = 36, n = pts.length;
  const xy = pts.map((v, i) => (v === null ? null : [(i * W) / (n - 1), H - (Math.max(0, Math.min(100, v)) / 100) * (H - 2) - 1]));
  let line = "", area = "", seg = [];
  const flush = () => {
    if (seg.length > 1) {
      line += "M" + seg.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L");
      area += `M${seg[0][0].toFixed(1)},${H}L` + seg.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L") + `L${seg[seg.length - 1][0].toFixed(1)},${H}Z`;
    }
    seg = [];
  };
  for (const p of xy) { if (p) seg.push(p); else flush(); }
  flush();
  return { line, area };
}

/** Roles recognised from the exact translation key of the integration. */
const EXTRA_ROLES = {
  backup_running: "backup_running", failed_tasks_count: "failed", update_avail: "update_avail", updates_total: "updates_total",
  swap_used_perc: "swap_pct", load_1m: "load", io_wait: "io", version: "version", locked: "locked", guest_agent: "agent",
  health: "health", storage_active: "active", temperature: "temp", disk_wearout: "wearout", life_left: "life_left", power_hours: "power_hours",
  backup_last: "backup_last", backup_duration: "backup_dur", backup_status: "backup_status",
  cluster_nodes_online: "c_nodes", cluster_qemu_running: "c_qemu", cluster_lxc_running: "c_lxc",
  network_in: "net_in", network_out: "net_out",
  // "free %" must not be mistaken for the "used %" sensors by the generic matching
  memory_free_perc: "mem_free_pct", disk_free_perc: "disk_free_pct", memory_free: "mem_free", disk_free: "disk_free",
  pressure_cpu_some: "p_cpu", pressure_io_some: "p_io", pressure_memory_some: "p_mem",
  ha_managed: "ha_managed", snapshots: "snapshots", storage_shared: "shared", storage_enabled: "enabled",
  node_update: "pve_update", // update entity of the node: latest_version is a new Proxmox VE release only when pve-manager is pending
  // ZFS pools (device "ZFS node: pool"): read like a storage
  zfs_health: "zfs_health", zfs_used_perc: "disk_pct", zfs_free_perc: "disk_free_pct", zfs_total: "disk_total", zfs_used: "disk_used",
  // "Proxmox Cluster" device: Ceph and backup coverage
  ceph_health: "ceph_health", ceph_used_perc: "ceph_pct", ceph_used: "ceph_used", ceph_total: "ceph_total", guests_without_backup: "no_backup",
  // node: certificate and subscription
  certificate_expires: "cert_expires", subscription_status: "subscription",
  // replication (node), HA stack (cluster), load averages, guest share of the host, disk counters
  replication_failing: "repl_failing", replication_last_sync: "repl_sync",
  ha_armed_state: "ha_armed", ha_crm_master_stale: "crm_stale", ha_resources_error: "ha_errors",
  load_5m: "load5", load_15m: "load15", cpu_of_host: "cpu_host", memory_of_host: "mem_host",
  power_cycles: "power_cycles", power_loss: "power_loss",
  // not displayed, but named so the generic matching below cannot take them for something else
  disk_rpm: "disk_rpm", disk_size: "disk_size", status_raw: "status_raw", node: "node_name",
};
/** Buttons by translation key. Guests: start…snapshot are the main row, the others go in the "⋯" menu; nodes and cluster: menu only. */
const BUTTON_ROLES = {
  start: "btn_start", shutdown: "btn_shutdown", reboot: "btn_reboot", stop: "btn_stop", snapshot: "btn_snapshot",
  backup: "btn_backup", unlock: "btn_unlock", resume: "btn_resume", suspend: "btn_suspend", hibernate: "btn_hibernate", reset: "btn_reset",
  start_all: "btn_start_all", stop_all: "btn_stop_all", suspend_all: "btn_suspend_all", backup_all: "btn_backup_all", wakeonlan: "btn_wol",
  arm_ha: "btn_arm_ha", disarm_ha: "btn_disarm_ha",
};
// [role, icon, text key, needs confirmation]
const GUEST_MENU = [["btn_resume", "mdi:play-pause", "resume", 0], ["btn_suspend", "mdi:pause", "suspend", 1], ["btn_hibernate", "mdi:power-sleep", "hibernate", 1],
  ["btn_reset", "mdi:restore-alert", "reset", 1], ["btn_backup", "mdi:backup-restore", "backupNow", 1], ["btn_unlock", "mdi:lock-open-variant-outline", "unlock", 1]];
const NODE_MENU = [["btn_wol", "mdi:lan-connect", "wakeOnLan", 0], ["btn_start_all", "mdi:play-box-multiple-outline", "startAll", 1], ["btn_stop_all", "mdi:stop-circle-outline", "stopAll", 1],
  ["btn_suspend_all", "mdi:pause-box-outline", "suspendAll", 1], ["btn_backup_all", "mdi:backup-restore", "backupAll", 1], ["btn_reboot", "mdi:restart", "rebootNode", 1], ["btn_shutdown", "mdi:power", "shutdownNode", 1]];
const ZFS_OK = /^(online|unknown|unavailable)$/i; // anything else (DEGRADED, FAULTED, OFFLINE, UNAVAIL, REMOVED…) is a problem
const SUB_BAD = ["expired", "invalid", "suspended"];

/** `include` / `exclude` (lists of IDs or names) as a predicate on { vmid, name }. */
function guestFilter(cfg) {
  const list = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  const inc = list(cfg?.include), exc = list(cfg?.exclude);
  const hit = (g, l) => { const n = String(g.name || "").toLowerCase(), id = String(g.vmid ?? ""); return l.some((q) => q === id || n === q || (!/^\d+$/.test(q) && n.includes(q))); };
  return (g) => (!inc.length || hit(g, inc)) && !hit(g, exc);
}

/** Classify an entity of the proxmoxve integration by translation key / entity_id. */
function roleOf(ent) {
  const id = ent.entity_id;
  const domain = id.split(".")[0];
  // The translation key is reliable; the entity_id also contains guest/storage names, so only fall back to it.
  const k = (ent.translation_key || id.split(".")[1]).toLowerCase();
  if (domain === "button") {
    if (BUTTON_ROLES[k]) return BUTTON_ROLES[k];
    if (/_all$|wakeonlan|_ha$/.test(k)) return null; // unknown variants of node / cluster buttons: never a guest power button
    if (/shutdown/.test(k)) return "btn_shutdown";
    if (/reboot/.test(k)) return "btn_reboot";
    if (/(^|_|\s)stop(_|\s|$)/.test(k) && !/stop_all/.test(k)) return "btn_stop";
    if (/(^|_|\s)start(_|\s|$)/.test(k) && !/start_all/.test(k)) return "btn_start";
    if (k === "snapshot") return "btn_snapshot";
    return null;
  }
  const tk = (ent.translation_key || "").toLowerCase();
  if (EXTRA_ROLES[tk]) return EXTRA_ROLES[tk];
  if (/quorat/.test(tk)) return "quorate";
  if (/pressure|stalled|of_host|on_host|smart|backup|replication|snapshot|cert|subscription|failed|update/.test(tk || k)) return null;
  if (domain === "sensor" || domain === "binary_sensor") {
    if (/status/.test(k) && !/storage/.test(k)) return "status";
    if (/cpu_used|(^|_)cpu(_|\s|$)/.test(k) && !/cpus/.test(k)) return "cpu";
    if (/memory.*(perc|usage)|mem.*perc/.test(k)) return "mem_pct";
    if (/memory_total|mem_total/.test(k)) return "mem_total";
    if (/memory_used|mem_used|(^|_)memory(_|\s|$)/.test(k)) return "mem_used";
    if (/disk.*(perc|usage)/.test(k)) return "disk_pct";
    if (/disk_total/.test(k)) return "disk_total";
    if (/disk_used|(^|_)disk(_|\s|$)/.test(k)) return "disk_used";
    if (/uptime/.test(k)) return "uptime";
    if (/ip_address/.test(k)) return "ip";
  }
  return null;
}

function statusOf(ent, hass) {
  const st = ent && hass.states[ent.entity_id];
  if (!st) return "unknown";
  const s = st.state.toLowerCase();
  if (["running", "online", "on"].includes(s)) return "on";
  if (["stopped", "offline", "off"].includes(s)) return "off";
  return s === "unavailable" ? "unknown" : "other";
}

const SORTS = ["id", "name", "status", "cpu", "mem"];
const SECTIONS = ["nodes", "guests", "storage", "disks"];
const EDITOR_DEFAULTS = {
  sort: "id", sort_dir: "asc", group_by_type: false, type_order: "vm_first", show_sort: true, include: [], exclude: [], show_cluster: true, show_history: true, show_backup: true, guest_columns: "auto", history_hours: 24, collapsed: [], show_network: true, network_mode: "rate", network_unit: "bytes", show_sizes: true, show_pressure: true, show_snapshots: true, show_host_share: true, show_temperature: true, group_by_node: false, section_order: [], show_forecast: true, show_filter_bar: true, compact: false,
  title: "Proxmox", node: "", show_nodes: true, show_qemu: true, show_lxc: true, show_stopped: true, show_actions: true, show_ip: true,
  show_uptime: true, show_badges: true, show_alerts: true, show_storage: true, show_disks: true, show_swap: true, show_load: true,
  show_version: true, language: "auto",
};
const bool = (name) => ({ name, selector: { boolean: {} } });
// thresholds editable in the visual editor: [key, unit, max]; fields are flat (`t_cpu_warning`…) and folded back into `thresholds`
const THRESHOLD_FIELDS = [["cpu", "%", 100], ["memory", "%", 100], ["disk", "%", 100], ["io", "%", 100], ["pressure", "%", 100], ["cpu_temperature", "°C", 150], ["temperature", "°C", 150], ["wear", "%", 100], ["certificate", "d", 365], ["forecast", "d", 365]];
const editorSchema = (L, guests = []) => [
  { name: "title", selector: { text: {} } },
  { name: "node", selector: { text: {} } },
  { type: "expandable", name: "", title: L.Sections, icon: "mdi:view-dashboard-outline", expanded: true, schema: [
    { type: "grid", name: "", schema: ["show_nodes", "show_qemu", "show_lxc", "show_stopped", "show_alerts", "show_cluster", "show_storage", "show_disks"].map(bool) },
  ] },
  { type: "expandable", name: "", title: L.Details, icon: "mdi:tune-variant", expanded: true, schema: [
    { type: "grid", name: "", schema: ["show_actions", "show_ip", "show_uptime", "show_badges", "show_swap", "show_load", "show_backup", "show_version", "show_history", "show_sort", "show_network", "show_sizes", "show_pressure", "show_snapshots", "show_host_share", "show_temperature", "show_forecast", "show_filter_bar"].map(bool) },
    { name: "network_mode", selector: { select: { options: [{ value: "rate", label: L.o_net_rate }, { value: "total", label: L.o_net_total }], mode: "dropdown" } } },
    { name: "network_unit", selector: { select: { options: [{ value: "bytes", label: L.o_unit_bytes }, { value: "bits", label: L.o_unit_bits }], mode: "dropdown" } } },
  ] },
  { type: "expandable", name: "", title: L.Sort, icon: "mdi:sort", expanded: true, schema: [
    { name: "sort", selector: { select: { options: [{ value: "id", label: "ID" }, { value: "name", label: L.o_name }, { value: "status", label: L.o_status }, { value: "cpu", label: L.o_cpu }, { value: "mem", label: L.o_mem }], mode: "dropdown" } } },
    { name: "sort_dir", selector: { select: { options: [{ value: "asc", label: L.o_asc }, { value: "desc", label: L.o_desc }], mode: "dropdown" } } },
    bool("group_by_type"),
    bool("group_by_node"),
    { name: "type_order", selector: { select: { options: [{ value: "vm_first", label: L.o_vm }, { value: "lxc_first", label: L.o_lxc }], mode: "dropdown" } } },
  ] },
  { type: "expandable", name: "", title: L.Layout, icon: "mdi:view-column-outline", expanded: false, schema: [
    bool("compact"),
    { name: "guest_columns", selector: { select: { options: [{ value: "auto", label: L.o_cols_auto }, { value: "1", label: L.o_cols_1 }, { value: "2", label: L.o_cols_2 }], mode: "dropdown" } } },
    { name: "history_hours", selector: { select: { options: ["6", "12", "24", "48", "72"].map((v) => ({ value: v, label: v + " h" })), mode: "dropdown" } } },
    { name: "accent", selector: { color_rgb: {} } },
    { name: "collapsed", selector: { select: { multiple: true, options: [["nodes", L.s_nodes], ["guests", L.s_guests], ["storage", L.s_storage], ["disks", L.s_disks]].map(([value, label]) => ({ value, label })), mode: "list" } } },
    { name: "section_order", selector: { select: { multiple: true, reorder: true, options: [["nodes", L.s_nodes], ["guests", L.s_guests], ["storage", L.s_storage], ["disks", L.s_disks]].map(([value, label]) => ({ value, label })), mode: "list" } } },
    { name: "tap_action", selector: { ui_action: {} } },
  ] },
  { type: "expandable", name: "", title: L.Thresholds, icon: "mdi:gauge", expanded: false, schema: [
    { type: "grid", name: "", schema: THRESHOLD_FIELDS.flatMap(([k, unit, max]) => ["warning", "critical"].map((lv) => ({ name: `t_${k}_${lv}`, selector: { number: { min: 0, max, step: k === "io" || k === "pressure" ? 0.5 : 1, mode: "box", unit_of_measurement: unit } } }))) },
  ] },
  { type: "expandable", name: "", title: L.Filters, icon: "mdi:filter-variant", expanded: false, schema: [
    { name: "include", selector: { text: { multiple: true } } },
    { name: "exclude", selector: { text: { multiple: true } } },
  ] },
  // one name + icon pair per detected guest, folded back into the `guests:` option (keyed by ID)
  ...(guests.length ? [{ type: "expandable", name: "", title: L.GuestsCustom, icon: "mdi:rename-outline", expanded: false, schema: [
    { type: "grid", name: "", schema: guests.flatMap((g) => [{ name: `gn_${g.vmid}`, selector: { text: {} } }, { name: `gi_${g.vmid}`, selector: { icon: {} } }]) },
  ] }] : []),
  { name: "language", selector: { select: { options: LANGUAGES.map(([value, label]) => ({ value, label })), mode: "dropdown" } } },
];
const EDITOR_KEYS = ["title", "node", "show_nodes", "show_qemu", "show_lxc", "show_stopped", "show_alerts", "show_storage", "show_disks", "show_actions", "show_ip", "show_uptime", "show_badges", "show_swap", "show_load", "show_version", "show_sort", "sort", "sort_dir", "group_by_type", "type_order", "language", "Sections", "Details", "Sort", "o_name", "o_status", "o_asc", "o_desc", "o_vm", "o_lxc", "Filters", "include", "exclude", "h_buttons", "h_nobuttons", "h_found", "h_filters", "show_cluster", "show_history", "show_backup", "guest_columns", "accent", "history_hours", "collapsed", "Layout", "o_cols_auto", "o_cols_1", "o_cols_2", "h_backup", "h_cluster", "show_network", "network_mode", "network_unit", "o_net_rate", "o_net_total", "o_unit_bytes", "o_unit_bits", "h_network", "show_sizes", "show_pressure", "show_snapshots", "h_sizes", "h_pressure", "show_host_share", "h_host", "show_temperature", "group_by_node", "section_order", "tap_action", "Thresholds", "th_warn", "th_crit", "th_cert", "th_disk_temp", "h_tap", "h_temp", "o_cpu", "o_mem", "show_forecast", "h_forecast", "show_filter_bar", "compact", "GuestsCustom", "g_name", "g_icon", "th_forecast", "guest", "show_details"];
const EDITOR_LABELS = pack(EDITOR_KEYS, {
  en: ["Title", "Filter by node / name (optional)", "Nodes", "Virtual machines", "Containers", "Stopped guests", "Alerts (updates, backup, failed tasks…)", "Storages", "Physical disks", "Power buttons", "IP address", "Guest uptime", "Guest badges (locked, agent, problem)", "Node swap", "Load and IO delay", "Proxmox version", "Sort buttons on the card", "Sort guests by", "Direction", "Group by type (VM / LXC)", "Type order (when grouped)", "Language", "Sections", "Details", "Guest sort", "Name", "Status (running first)", "Ascending ↓", "Descending ↑", "VMs, then containers", "Containers, then VMs", "Filters", "Show only these guests (ID or name)", "Hide these guests (ID or name)", "{n} of {m} guests have power buttons.", "No power button found: enable the Start / Shutdown / Reboot entities of the Proxmox VE integration (Settings → Devices & services → the guest → disabled entities).", "{n} detected", "Type an ID or a name, then press Enter. To rename guests or change their icon, use the guests: option in YAML.", "Cluster summary (2 nodes or more)", "History curves", "Last backup", "Guest columns", "Accent color", "History period (hours)", "Collapsed sections", "Layout", "Automatic (2 columns when wide)", "1 column", "2 columns", "Needs the “Last backup” entity of the node (disabled by default: Settings → Devices & services → the node → disabled entities).", "Shown when the cluster has 2 nodes or more.", "Network in / out per guest", "Network display", "Rate unit", "Rate (per second)", "Total since start", "Bytes (kB/s, MB/s…)", "Bits (kbit/s, Mbit/s…)", "Needs the “Network in” and “Network out” entities of each guest (disabled by default: Settings → Devices & services → the guest → disabled entities). They are cumulative counters, so the card computes the rate.", "Sizes (used / free / total)", "Pressure badges (CPU, memory, IO)", "Snapshots (count and button)", "Needs the “Disk total” and “Disk free” entities of the storages (disabled by default: Settings → Devices & services → the storage → disabled entities). Memory totals are deduced from “Memory used” and “Memory free”.", "Needs the “CPU / IO / Memory pressure” entities of the guests (disabled by default, Proxmox 9 or later).", "Guest share of the host (CPU / RAM)", "Needs the “CPU used of host” and “Memory used of host” entities of the guests (disabled by default: Settings → Devices & services → the guest → disabled entities).", "Node CPU temperature", "Group by node (clusters)", "Section order", "Action when a tile is clicked", "Thresholds", "orange from", "red from", "Certificate (days left)", "Disk temperature", "Empty = open the entity details. The alert, version and HA pills always open their entity.", "Needs the hardware sensors of the node (PVE-mods with lm-sensors on the Proxmox host).", "CPU (busiest first)", "RAM (busiest first)", "Storage fill forecast", "Computed from the last 7 days of history; shown when the storage would be full within a year.", "Search and “Problems” filter (6 guests or more)", "Compact mode", "Guest names and icons", "name", "icon", "Storage full (days left)", "Guest", "Details unfolded (history, alerts)"],
  fr: ["Titre", "Filtrer par nœud / nom (facultatif)", "Nœuds", "Machines virtuelles", "Conteneurs", "Invités arrêtés", "Alertes (mises à jour, sauvegarde, tâches en échec…)", "Stockages", "Disques physiques", "Boutons marche / arrêt", "Adresse IP", "Uptime des invités", "Badges des invités (verrouillé, agent, problème)", "Swap des nœuds", "Charge et IO delay", "Version de Proxmox", "Boutons de tri sur la carte", "Trier les invités par", "Sens", "Regrouper par type (VM / LXC)", "Ordre des types (si regroupé)", "Langue", "Sections", "Détails", "Tri des invités", "Nom", "État (actifs d'abord)", "Croissant ↓", "Décroissant ↑", "VM, puis conteneurs", "Conteneurs, puis VM", "Filtres", "Afficher uniquement ces invités (ID ou nom)", "Masquer ces invités (ID ou nom)", "{n} invités sur {m} ont des boutons marche / arrêt.", "Aucun bouton trouvé : activez les entités Démarrer / Arrêter / Redémarrer de l'intégration Proxmox VE (Paramètres → Appareils et services → l'invité → entités désactivées).", "{n} détecté(s)", "Saisissez un ID ou un nom, puis Entrée. Pour renommer un invité ou changer son icône, utilisez l'option guests: en YAML.", "Résumé du cluster (2 nœuds ou plus)", "Courbes d'historique", "Dernière sauvegarde", "Colonnes des invités", "Couleur d'accent", "Période de l'historique (heures)", "Sections repliées", "Disposition", "Automatique (2 colonnes si large)", "1 colonne", "2 colonnes", "Nécessite l'entité « Last backup » du nœud (désactivée par défaut : Paramètres → Appareils et services → le nœud → entités désactivées).", "Affiché à partir de 2 nœuds.", "Réseau entrant / sortant par invité", "Affichage du réseau", "Unité du débit", "Débit (par seconde)", "Total depuis le démarrage", "Octets (kB/s, MB/s…)", "Bits (kbit/s, Mbit/s…)", "Nécessite les entités « Réseau descendant » et « Réseau montant » de chaque invité (désactivées par défaut : Paramètres → Appareils et services → l'invité → entités désactivées). Ce sont des compteurs cumulés : la carte calcule le débit.", "Tailles (utilisé / libre / total)", "Badges de pression (CPU, mémoire, E/S)", "Instantanés (nombre et bouton)", "Nécessite les entités « Disque espace total » et « Disque libre » des stockages (désactivées par défaut : Paramètres → Appareils et services → le stockage → entités désactivées). Les totaux de mémoire sont déduits de « Mémoire utilisée » et « Mémoire libre ».", "Nécessite les entités de pression CPU / E/S / mémoire des invités (désactivées par défaut, Proxmox 9 ou plus).", "Part de l'hôte des invités (CPU / RAM)", "Nécessite les entités « CPU used of host » et « Memory used of host » des invités (désactivées par défaut : Paramètres → Appareils et services → l'invité → entités désactivées).", "Température CPU des nœuds", "Regrouper par nœud (clusters)", "Ordre des sections", "Action au clic sur une tuile", "Seuils", "orange à partir de", "rouge à partir de", "Certificat (jours restants)", "Température des disques", "Vide = ouvrir la fiche de l'entité. Les pastilles d'alerte, de version et de HA ouvrent toujours leur entité.", "Nécessite les capteurs matériels du nœud (PVE-mods avec lm-sensors sur l'hôte Proxmox).", "CPU (les plus chargés d'abord)", "RAM (les plus chargés d'abord)", "Prévision de remplissage des stockages", "Calculée sur les 7 derniers jours d'historique ; affichée quand le stockage serait plein dans moins d'un an.", "Recherche et filtre « Problèmes » (à partir de 6 invités)", "Mode compact", "Noms et icônes des invités", "nom", "icône", "Stockage plein (jours restants)", "Invité", "Détails dépliés (historique, alertes)"],
  de: ["Titel", "Nach Knoten / Name filtern (optional)", "Knoten", "Virtuelle Maschinen", "Container", "Gestoppte Gäste", "Warnungen (Updates, Sicherung, fehlgeschlagene Aufgaben …)", "Speicher", "Physische Datenträger", "Ein-/Aus-Schaltflächen", "IP-Adresse", "Gast-Laufzeit", "Gast-Badges (gesperrt, Agent, Problem)", "Knoten-Swap", "Last und IO-Delay", "Proxmox-Version", "Sortier-Schaltflächen auf der Karte", "Gäste sortieren nach", "Richtung", "Nach Typ gruppieren (VM / LXC)", "Reihenfolge der Typen (bei Gruppierung)", "Sprache", "Bereiche", "Details", "Gäste sortieren", "Name", "Status (laufende zuerst)", "Aufsteigend ↓", "Absteigend ↑", "VMs, dann Container", "Container, dann VMs", "Filter", "Nur diese Gäste anzeigen (ID oder Name)", "Diese Gäste ausblenden (ID oder Name)", "{n} von {m} Gästen haben Ein-/Aus-Schaltflächen.", "Keine Schaltfläche gefunden: Aktivieren Sie die Entitäten Starten / Herunterfahren / Neustarten der Proxmox-VE-Integration (Einstellungen → Geräte & Dienste → Gast → deaktivierte Entitäten).", "{n} erkannt", "ID oder Namen eingeben und Enter drücken. Zum Umbenennen von Gästen oder Ändern ihres Symbols die Option guests: in YAML verwenden.", "Cluster-Übersicht (ab 2 Knoten)", "Verlaufskurven", "Letzte Sicherung", "Spalten der Gäste", "Akzentfarbe", "Verlaufszeitraum (Stunden)", "Eingeklappte Bereiche", "Layout", "Automatisch (2 Spalten bei breiter Karte)", "1 Spalte", "2 Spalten", "Benötigt die Entität „Last backup“ des Knotens (standardmäßig deaktiviert: Einstellungen → Geräte & Dienste → der Knoten → deaktivierte Entitäten).", "Wird ab 2 Knoten angezeigt.", "Netzwerk ein / aus pro Gast", "Netzwerkanzeige", "Einheit der Rate", "Rate (pro Sekunde)", "Gesamt seit dem Start", "Bytes (kB/s, MB/s …)", "Bits (kbit/s, Mbit/s …)", "Benötigt die Entitäten „Network in“ und „Network out“ jedes Gastes (standardmäßig deaktiviert: Einstellungen → Geräte & Dienste → der Gast → deaktivierte Entitäten). Es sind kumulierte Zähler, die Karte berechnet die Rate.", "Größen (belegt / frei / gesamt)", "Druck-Badges (CPU, Speicher, E/A)", "Snapshots (Anzahl und Schaltfläche)", "Benötigt die Entitäten „Disk total“ und „Disk free“ der Speicher (standardmäßig deaktiviert: Einstellungen → Geräte & Dienste → der Speicher → deaktivierte Entitäten). Arbeitsspeicher-Summen werden aus „Memory used“ und „Memory free“ abgeleitet.", "Benötigt die Druck-Entitäten (CPU / E/A / Speicher) der Gäste (standardmäßig deaktiviert, Proxmox 9 oder neuer).", "Anteil der Gäste am Host (CPU / RAM)", "Benötigt die Entitäten „CPU used of host“ und „Memory used of host“ der Gäste (standardmäßig deaktiviert: Einstellungen → Geräte & Dienste → der Gast → deaktivierte Entitäten).", "CPU-Temperatur der Knoten", "Nach Knoten gruppieren (Cluster)", "Reihenfolge der Bereiche", "Aktion beim Klick auf eine Kachel", "Schwellenwerte", "orange ab", "rot ab", "Zertifikat (verbleibende Tage)", "Datenträgertemperatur", "Leer = Details der Entität öffnen. Die Warn-, Versions- und HA-Pillen öffnen immer ihre Entität.", "Benötigt die Hardwaresensoren des Knotens (PVE-mods mit lm-sensors auf dem Proxmox-Host).", "CPU (stärkste zuerst)", "RAM (stärkste zuerst)", "Füllprognose der Speicher", "Aus den letzten 7 Tagen des Verlaufs berechnet; angezeigt, wenn der Speicher innerhalb eines Jahres voll wäre.", "Suche und Filter „Probleme“ (ab 6 Gästen)", "Kompaktmodus", "Namen und Symbole der Gäste", "Name", "Symbol", "Speicher voll (verbleibende Tage)", "Gast", "Details aufgeklappt (Verlauf, Warnungen)"],
  es: ["Título", "Filtrar por nodo / nombre (opcional)", "Nodos", "Máquinas virtuales", "Contenedores", "Invitados detenidos", "Alertas (actualizaciones, copia de seguridad, tareas fallidas…)", "Almacenamientos", "Discos físicos", "Botones de encendido", "Dirección IP", "Tiempo activo de invitados", "Insignias de invitados (bloqueado, agente, problema)", "Swap de los nodos", "Carga e IO delay", "Versión de Proxmox", "Botones de orden en la tarjeta", "Ordenar invitados por", "Sentido", "Agrupar por tipo (VM / LXC)", "Orden de los tipos (si se agrupa)", "Idioma", "Secciones", "Detalles", "Orden de invitados", "Nombre", "Estado (en ejecución primero)", "Ascendente ↓", "Descendente ↑", "VM, luego contenedores", "Contenedores, luego VM", "Filtros", "Mostrar solo estos invitados (ID o nombre)", "Ocultar estos invitados (ID o nombre)", "{n} de {m} invitados tienen botones de encendido.", "No se encontró ningún botón: active las entidades Iniciar / Apagar / Reiniciar de la integración Proxmox VE (Ajustes → Dispositivos y servicios → el invitado → entidades deshabilitadas).", "{n} detectados", "Escriba un ID o un nombre y pulse Intro. Para renombrar invitados o cambiar su icono, use la opción guests: en YAML.", "Resumen del clúster (2 nodos o más)", "Curvas de historial", "Última copia de seguridad", "Columnas de invitados", "Color de acento", "Periodo del historial (horas)", "Secciones plegadas", "Diseño", "Automático (2 columnas si es ancha)", "1 columna", "2 columnas", "Requiere la entidad «Last backup» del nodo (desactivada por defecto: Ajustes → Dispositivos y servicios → el nodo → entidades deshabilitadas).", "Se muestra a partir de 2 nodos.", "Red entrante / saliente por invitado", "Visualización de la red", "Unidad de la tasa", "Tasa (por segundo)", "Total desde el inicio", "Bytes (kB/s, MB/s…)", "Bits (kbit/s, Mbit/s…)", "Requiere las entidades «Network in» y «Network out» de cada invitado (desactivadas por defecto: Ajustes → Dispositivos y servicios → el invitado → entidades deshabilitadas). Son contadores acumulados: la tarjeta calcula la tasa.", "Tamaños (usado / libre / total)", "Insignias de presión (CPU, memoria, E/S)", "Instantáneas (número y botón)", "Requiere las entidades «Disk total» y «Disk free» de los almacenamientos (desactivadas por defecto: Ajustes → Dispositivos y servicios → el almacenamiento → entidades deshabilitadas). Los totales de memoria se deducen de «Memory used» y «Memory free».", "Requiere las entidades de presión de CPU / E/S / memoria de los invitados (desactivadas por defecto, Proxmox 9 o posterior).", "Parte del host de los invitados (CPU / RAM)", "Requiere las entidades «CPU used of host» y «Memory used of host» de los invitados (desactivadas por defecto: Ajustes → Dispositivos y servicios → el invitado → entidades deshabilitadas).", "Temperatura de CPU de los nodos", "Agrupar por nodo (clústeres)", "Orden de las secciones", "Acción al pulsar un mosaico", "Umbrales", "naranja desde", "rojo desde", "Certificado (días restantes)", "Temperatura de los discos", "Vacío = abrir los detalles de la entidad. Las píldoras de alerta, versión y HA siempre abren su entidad.", "Requiere los sensores de hardware del nodo (PVE-mods con lm-sensors en el host Proxmox).", "CPU (los más cargados primero)", "RAM (los más cargados primero)", "Previsión de llenado de almacenamientos", "Calculada con los últimos 7 días de historial; se muestra cuando el almacenamiento se llenaría en menos de un año.", "Búsqueda y filtro «Problemas» (desde 6 invitados)", "Modo compacto", "Nombres e iconos de los invitados", "nombre", "icono", "Almacenamiento lleno (días restantes)", "Invitado", "Detalles desplegados (historial, alertas)"],
  it: ["Titolo", "Filtra per nodo / nome (facoltativo)", "Nodi", "Macchine virtuali", "Container", "Guest arrestati", "Avvisi (aggiornamenti, backup, attività non riuscite…)", "Archiviazioni", "Dischi fisici", "Pulsanti di alimentazione", "Indirizzo IP", "Uptime dei guest", "Badge dei guest (bloccato, agent, problema)", "Swap dei nodi", "Carico e IO delay", "Versione di Proxmox", "Pulsanti di ordinamento sulla scheda", "Ordina i guest per", "Direzione", "Raggruppa per tipo (VM / LXC)", "Ordine dei tipi (se raggruppati)", "Lingua", "Sezioni", "Dettagli", "Ordinamento guest", "Nome", "Stato (attivi per primi)", "Crescente ↓", "Decrescente ↑", "VM, poi container", "Container, poi VM", "Filtri", "Mostra solo questi guest (ID o nome)", "Nascondi questi guest (ID o nome)", "{n} guest su {m} hanno i pulsanti di alimentazione.", "Nessun pulsante trovato: abilita le entità Avvia / Arresta / Riavvia dell'integrazione Proxmox VE (Impostazioni → Dispositivi e servizi → il guest → entità disabilitate).", "{n} rilevati", "Digita un ID o un nome, poi premi Invio. Per rinominare i guest o cambiarne l'icona usa l'opzione guests: in YAML.", "Riepilogo del cluster (2 nodi o più)", "Curve di cronologia", "Ultimo backup", "Colonne dei guest", "Colore di accento", "Periodo della cronologia (ore)", "Sezioni compresse", "Layout", "Automatico (2 colonne se larga)", "1 colonna", "2 colonne", "Richiede l'entità «Last backup» del nodo (disabilitata per impostazione predefinita: Impostazioni → Dispositivi e servizi → il nodo → entità disabilitate).", "Mostrato da 2 nodi in su.", "Rete in entrata / in uscita per guest", "Visualizzazione della rete", "Unità della velocità", "Velocità (al secondo)", "Totale dall'avvio", "Byte (kB/s, MB/s…)", "Bit (kbit/s, Mbit/s…)", "Richiede le entità «Network in» e «Network out» di ogni guest (disabilitate per impostazione predefinita: Impostazioni → Dispositivi e servizi → il guest → entità disabilitate). Sono contatori cumulativi: la scheda calcola la velocità.", "Dimensioni (usato / libero / totale)", "Badge di pressione (CPU, memoria, I/O)", "Snapshot (numero e pulsante)", "Richiede le entità «Disk total» e «Disk free» delle archiviazioni (disabilitate per impostazione predefinita: Impostazioni → Dispositivi e servizi → l'archiviazione → entità disabilitate). I totali di memoria sono dedotti da «Memory used» e «Memory free».", "Richiede le entità di pressione CPU / I/O / memoria dei guest (disabilitate per impostazione predefinita, Proxmox 9 o successivo).", "Quota dell'host dei guest (CPU / RAM)", "Richiede le entità «CPU used of host» e «Memory used of host» dei guest (disabilitate per impostazione predefinita: Impostazioni → Dispositivi e servizi → il guest → entità disabilitate).", "Temperatura CPU dei nodi", "Raggruppa per nodo (cluster)", "Ordine delle sezioni", "Azione al clic su un riquadro", "Soglie", "arancione da", "rosso da", "Certificato (giorni rimanenti)", "Temperatura dei dischi", "Vuoto = apri i dettagli dell'entità. Le pillole di avviso, versione e HA aprono sempre la loro entità.", "Richiede i sensori hardware del nodo (PVE-mods con lm-sensors sull'host Proxmox).", "CPU (i più carichi prima)", "RAM (i più carichi prima)", "Previsione di riempimento delle archiviazioni", "Calcolata sugli ultimi 7 giorni di cronologia; mostrata quando l'archiviazione sarebbe piena entro un anno.", "Ricerca e filtro «Problemi» (da 6 guest)", "Modalità compatta", "Nomi e icone dei guest", "nome", "icona", "Archiviazione piena (giorni rimanenti)", "Guest", "Dettagli espansi (cronologia, avvisi)"],
  pt: ["Título", "Filtrar por nó / nome (opcional)", "Nós", "Máquinas virtuais", "Contentores", "Convidados parados", "Alertas (atualizações, cópia de segurança, tarefas com falha…)", "Armazenamentos", "Discos físicos", "Botões de energia", "Endereço IP", "Tempo de atividade dos convidados", "Distintivos dos convidados (bloqueado, agente, problema)", "Swap dos nós", "Carga e IO delay", "Versão do Proxmox", "Botões de ordenação no cartão", "Ordenar convidados por", "Sentido", "Agrupar por tipo (VM / LXC)", "Ordem dos tipos (se agrupado)", "Idioma", "Secções", "Detalhes", "Ordenação dos convidados", "Nome", "Estado (em execução primeiro)", "Ascendente ↓", "Descendente ↑", "VMs, depois contentores", "Contentores, depois VMs", "Filtros", "Mostrar apenas estes convidados (ID ou nome)", "Ocultar estes convidados (ID ou nome)", "{n} de {m} convidados têm botões de energia.", "Nenhum botão encontrado: ative as entidades Iniciar / Desligar / Reiniciar da integração Proxmox VE (Definições → Dispositivos e serviços → o convidado → entidades desativadas).", "{n} detetados", "Escreva um ID ou um nome e prima Enter. Para renomear convidados ou mudar o ícone, use a opção guests: em YAML.", "Resumo do cluster (2 nós ou mais)", "Curvas de histórico", "Última cópia de segurança", "Colunas dos convidados", "Cor de destaque", "Período do histórico (horas)", "Secções recolhidas", "Disposição", "Automático (2 colunas se larga)", "1 coluna", "2 colunas", "Requer a entidade «Last backup» do nó (desativada por predefinição: Definições → Dispositivos e serviços → o nó → entidades desativadas).", "Mostrado a partir de 2 nós.", "Rede de entrada / saída por convidado", "Apresentação da rede", "Unidade do débito", "Débito (por segundo)", "Total desde o arranque", "Bytes (kB/s, MB/s…)", "Bits (kbit/s, Mbit/s…)", "Requer as entidades «Network in» e «Network out» de cada convidado (desativadas por predefinição: Definições → Dispositivos e serviços → o convidado → entidades desativadas). São contadores acumulados: o cartão calcula o débito.", "Tamanhos (usado / livre / total)", "Distintivos de pressão (CPU, memória, E/S)", "Instantâneos (número e botão)", "Requer as entidades «Disk total» e «Disk free» dos armazenamentos (desativadas por predefinição: Definições → Dispositivos e serviços → o armazenamento → entidades desativadas). Os totais de memória são deduzidos de «Memory used» e «Memory free».", "Requer as entidades de pressão de CPU / E/S / memória dos convidados (desativadas por predefinição, Proxmox 9 ou posterior).", "Parte do anfitrião dos convidados (CPU / RAM)", "Requer as entidades «CPU used of host» e «Memory used of host» dos convidados (desativadas por predefinição: Definições → Dispositivos e serviços → o convidado → entidades desativadas).", "Temperatura da CPU dos nós", "Agrupar por nó (clusters)", "Ordem das secções", "Ação ao clicar num mosaico", "Limiares", "laranja a partir de", "vermelho a partir de", "Certificado (dias restantes)", "Temperatura dos discos", "Vazio = abrir os detalhes da entidade. As pílulas de alerta, versão e HA abrem sempre a sua entidade.", "Requer os sensores de hardware do nó (PVE-mods com lm-sensors no anfitrião Proxmox).", "CPU (mais carregados primeiro)", "RAM (mais carregados primeiro)", "Previsão de enchimento dos armazenamentos", "Calculada com os últimos 7 dias de histórico; mostrada quando o armazenamento ficaria cheio em menos de um ano.", "Pesquisa e filtro «Problemas» (a partir de 6 convidados)", "Modo compacto", "Nomes e ícones dos convidados", "nome", "ícone", "Armazenamento cheio (dias restantes)", "Convidado", "Detalhes expandidos (histórico, alertas)"],
  nl: ["Titel", "Filteren op node / naam (optioneel)", "Nodes", "Virtuele machines", "Containers", "Gestopte gasten", "Meldingen (updates, back-up, mislukte taken…)", "Opslag", "Fysieke schijven", "Aan/uit-knoppen", "IP-adres", "Uptime van gasten", "Badges van gasten (vergrendeld, agent, probleem)", "Swap van nodes", "Belasting en IO-delay", "Proxmox-versie", "Sorteerknoppen op de kaart", "Gasten sorteren op", "Richting", "Groeperen op type (VM / LXC)", "Volgorde van typen (bij groeperen)", "Taal", "Secties", "Details", "Sortering van gasten", "Naam", "Status (actieve eerst)", "Oplopend ↓", "Aflopend ↑", "VM's, dan containers", "Containers, dan VM's", "Filters", "Alleen deze gasten tonen (ID of naam)", "Deze gasten verbergen (ID of naam)", "{n} van {m} gasten hebben aan/uit-knoppen.", "Geen knop gevonden: schakel de entiteiten Starten / Afsluiten / Herstarten van de Proxmox VE-integratie in (Instellingen → Apparaten & diensten → de gast → uitgeschakelde entiteiten).", "{n} gevonden", "Typ een ID of naam en druk op Enter. Gebruik de optie guests: in YAML om gasten te hernoemen of hun pictogram te wijzigen.", "Clusteroverzicht (vanaf 2 nodes)", "Geschiedeniscurves", "Laatste back-up", "Kolommen van gasten", "Accentkleur", "Geschiedenisperiode (uren)", "Ingeklapte secties", "Indeling", "Automatisch (2 kolommen als breed)", "1 kolom", "2 kolommen", "Vereist de entiteit ‘Last backup’ van de node (standaard uitgeschakeld: Instellingen → Apparaten & diensten → de node → uitgeschakelde entiteiten).", "Getoond vanaf 2 nodes.", "Netwerk in / uit per gast", "Netwerkweergave", "Eenheid van de snelheid", "Snelheid (per seconde)", "Totaal sinds de start", "Bytes (kB/s, MB/s…)", "Bits (kbit/s, Mbit/s…)", "Vereist de entiteiten ‘Network in’ en ‘Network out’ van elke gast (standaard uitgeschakeld: Instellingen → Apparaten & diensten → de gast → uitgeschakelde entiteiten). Het zijn cumulatieve tellers: de kaart berekent de snelheid.", "Groottes (gebruikt / vrij / totaal)", "Drukbadges (CPU, geheugen, I/O)", "Snapshots (aantal en knop)", "Vereist de entiteiten ‘Disk total’ en ‘Disk free’ van de opslag (standaard uitgeschakeld: Instellingen → Apparaten & diensten → de opslag → uitgeschakelde entiteiten). Geheugentotalen worden afgeleid van ‘Memory used’ en ‘Memory free’.", "Vereist de drukentiteiten (CPU / I/O / geheugen) van de gasten (standaard uitgeschakeld, Proxmox 9 of nieuwer).", "Aandeel van de host per gast (CPU / RAM)", "Vereist de entiteiten ‘CPU used of host’ en ‘Memory used of host’ van de gasten (standaard uitgeschakeld: Instellingen → Apparaten & diensten → de gast → uitgeschakelde entiteiten).", "CPU-temperatuur van nodes", "Groeperen per node (clusters)", "Volgorde van secties", "Actie bij klikken op een tegel", "Drempels", "oranje vanaf", "rood vanaf", "Certificaat (resterende dagen)", "Schijftemperatuur", "Leeg = details van de entiteit openen. De meldings-, versie- en HA-labels openen altijd hun entiteit.", "Vereist de hardwaresensoren van de node (PVE-mods met lm-sensors op de Proxmox-host).", "CPU (zwaarste eerst)", "RAM (zwaarste eerst)", "Vulprognose van de opslag", "Berekend op de laatste 7 dagen geschiedenis; getoond als de opslag binnen een jaar vol zou zijn.", "Zoeken en filter ‘Problemen’ (vanaf 6 gasten)", "Compacte modus", "Namen en pictogrammen van gasten", "naam", "pictogram", "Opslag vol (resterende dagen)", "Gast", "Details uitgeklapt (geschiedenis, meldingen)"],
  pl: ["Tytuł", "Filtruj po węźle / nazwie (opcjonalnie)", "Węzły", "Maszyny wirtualne", "Kontenery", "Zatrzymani goście", "Alerty (aktualizacje, kopia zapasowa, nieudane zadania…)", "Magazyny", "Dyski fizyczne", "Przyciski zasilania", "Adres IP", "Czas działania gości", "Odznaki gości (zablokowany, agent, problem)", "Swap węzłów", "Obciążenie i IO delay", "Wersja Proxmox", "Przyciski sortowania na karcie", "Sortuj gości według", "Kierunek", "Grupuj według typu (VM / LXC)", "Kolejność typów (przy grupowaniu)", "Język", "Sekcje", "Szczegóły", "Sortowanie gości", "Nazwa", "Stan (działające najpierw)", "Rosnąco ↓", "Malejąco ↑", "VM, potem kontenery", "Kontenery, potem VM", "Filtry", "Pokaż tylko tych gości (ID lub nazwa)", "Ukryj tych gości (ID lub nazwa)", "{n} z {m} gości ma przyciski zasilania.", "Nie znaleziono przycisków: włącz encje Uruchom / Wyłącz / Uruchom ponownie integracji Proxmox VE (Ustawienia → Urządzenia i usługi → gość → wyłączone encje).", "Wykryto: {n}", "Wpisz ID lub nazwę i naciśnij Enter. Aby zmienić nazwę gościa lub jego ikonę, użyj opcji guests: w YAML.", "Podsumowanie klastra (od 2 węzłów)", "Wykresy historii", "Ostatnia kopia zapasowa", "Kolumny gości", "Kolor akcentu", "Okres historii (godziny)", "Zwinięte sekcje", "Układ", "Automatycznie (2 kolumny, gdy szeroka)", "1 kolumna", "2 kolumny", "Wymaga encji „Last backup” węzła (domyślnie wyłączona: Ustawienia → Urządzenia i usługi → węzeł → wyłączone encje).", "Pokazywane od 2 węzłów.", "Sieć przychodząca / wychodząca na gościa", "Wyświetlanie sieci", "Jednostka przepływności", "Przepływność (na sekundę)", "Suma od uruchomienia", "Bajty (kB/s, MB/s…)", "Bity (kbit/s, Mbit/s…)", "Wymaga encji „Network in” i „Network out” każdego gościa (domyślnie wyłączone: Ustawienia → Urządzenia i usługi → gość → wyłączone encje). To liczniki skumulowane, więc karta wylicza przepływność.", "Rozmiary (użyte / wolne / razem)", "Odznaki presji (CPU, pamięć, we/wy)", "Migawki (liczba i przycisk)", "Wymaga encji „Disk total” i „Disk free” magazynów (domyślnie wyłączone: Ustawienia → Urządzenia i usługi → magazyn → wyłączone encje). Sumy pamięci są wyliczane z „Memory used” i „Memory free”.", "Wymaga encji presji CPU / we/wy / pamięci gości (domyślnie wyłączone, Proxmox 9 lub nowszy).", "Udział gości w hoście (CPU / RAM)", "Wymaga encji „CPU used of host” i „Memory used of host” gości (domyślnie wyłączone: Ustawienia → Urządzenia i usługi → gość → wyłączone encje).", "Temperatura CPU węzłów", "Grupuj według węzła (klastry)", "Kolejność sekcji", "Akcja po kliknięciu kafelka", "Progi", "pomarańczowy od", "czerwony od", "Certyfikat (pozostałe dni)", "Temperatura dysków", "Puste = otwórz szczegóły encji. Plakietki alertów, wersji i HA zawsze otwierają swoją encję.", "Wymaga czujników sprzętowych węzła (PVE-mods z lm-sensors na hoście Proxmox).", "CPU (najbardziej obciążone najpierw)", "RAM (najbardziej obciążone najpierw)", "Prognoza zapełnienia magazynów", "Liczona z ostatnich 7 dni historii; pokazywana, gdy magazyn zapełniłby się w ciągu roku.", "Wyszukiwanie i filtr „Problemy” (od 6 gości)", "Tryb kompaktowy", "Nazwy i ikony gości", "nazwa", "ikona", "Pełny magazyn (pozostałe dni)", "Gość", "Rozwinięte szczegóły (historia, alerty)"],
  cs: ["Název", "Filtrovat podle uzlu / názvu (volitelné)", "Uzly", "Virtuální stroje", "Kontejnery", "Zastavení hosté", "Upozornění (aktualizace, záloha, neúspěšné úlohy…)", "Úložiště", "Fyzické disky", "Tlačítka napájení", "IP adresa", "Doba běhu hostů", "Odznaky hostů (uzamčeno, agent, problém)", "Swap uzlů", "Zátěž a IO delay", "Verze Proxmoxu", "Tlačítka řazení na kartě", "Řadit hosty podle", "Směr", "Seskupit podle typu (VM / LXC)", "Pořadí typů (při seskupení)", "Jazyk", "Sekce", "Podrobnosti", "Řazení hostů", "Název", "Stav (běžící první)", "Vzestupně ↓", "Sestupně ↑", "VM, potom kontejnery", "Kontejnery, potom VM", "Filtry", "Zobrazit pouze tyto hosty (ID nebo název)", "Skrýt tyto hosty (ID nebo název)", "{n} z {m} hostů má tlačítka napájení.", "Nenalezeno žádné tlačítko: povolte entity Spustit / Vypnout / Restartovat integrace Proxmox VE (Nastavení → Zařízení a služby → host → zakázané entity).", "Nalezeno: {n}", "Zadejte ID nebo název a stiskněte Enter. K přejmenování hostů nebo změně ikony použijte volbu guests: v YAML.", "Přehled clusteru (od 2 uzlů)", "Křivky historie", "Poslední záloha", "Sloupce hostů", "Barva zvýraznění", "Období historie (hodiny)", "Sbalené sekce", "Rozložení", "Automaticky (2 sloupce u široké karty)", "1 sloupec", "2 sloupce", "Vyžaduje entitu „Last backup“ uzlu (ve výchozím stavu zakázána: Nastavení → Zařízení a služby → uzel → zakázané entity).", "Zobrazí se od 2 uzlů.", "Síť příchozí / odchozí na hosta", "Zobrazení sítě", "Jednotka rychlosti", "Rychlost (za sekundu)", "Celkem od spuštění", "Bajty (kB/s, MB/s…)", "Bity (kbit/s, Mbit/s…)", "Vyžaduje entity „Network in“ a „Network out“ každého hosta (ve výchozím stavu zakázané: Nastavení → Zařízení a služby → host → zakázané entity). Jde o kumulativní čítače, rychlost proto počítá karta.", "Velikosti (využito / volné / celkem)", "Odznaky tlaku (CPU, paměť, I/O)", "Snímky (počet a tlačítko)", "Vyžaduje entity „Disk total“ a „Disk free“ úložišť (ve výchozím stavu zakázané: Nastavení → Zařízení a služby → úložiště → zakázané entity). Součty paměti se odvozují z „Memory used“ a „Memory free“.", "Vyžaduje entity tlaku CPU / I/O / paměti hostů (ve výchozím stavu zakázané, Proxmox 9 nebo novější).", "Podíl hostů na hostiteli (CPU / RAM)", "Vyžaduje entity „CPU used of host“ a „Memory used of host“ hostů (ve výchozím stavu zakázané: Nastavení → Zařízení a služby → host → zakázané entity).", "Teplota CPU uzlů", "Seskupit podle uzlu (clustery)", "Pořadí sekcí", "Akce po kliknutí na dlaždici", "Prahy", "oranžová od", "červená od", "Certifikát (zbývající dny)", "Teplota disků", "Prázdné = otevřít podrobnosti entity. Štítky upozornění, verze a HA vždy otevřou svou entitu.", "Vyžaduje hardwarové senzory uzlu (PVE-mods s lm-sensors na hostiteli Proxmox).", "CPU (nejvytíženější první)", "RAM (nejvytíženější první)", "Předpověď zaplnění úložišť", "Počítá se z posledních 7 dní historie; zobrazí se, když by se úložiště zaplnilo do roka.", "Hledání a filtr „Problémy“ (od 6 hostů)", "Kompaktní režim", "Názvy a ikony hostů", "název", "ikona", "Plné úložiště (zbývající dny)", "Host", "Rozbalené podrobnosti (historie, upozornění)"],
  sv: ["Titel", "Filtrera på nod / namn (valfritt)", "Noder", "Virtuella maskiner", "Containrar", "Stoppade gäster", "Aviseringar (uppdateringar, säkerhetskopiering, misslyckade uppgifter…)", "Lagring", "Fysiska diskar", "Strömknappar", "IP-adress", "Gästernas drifttid", "Gästmärken (låst, agent, problem)", "Nodernas swap", "Belastning och IO delay", "Proxmox-version", "Sorteringsknappar på kortet", "Sortera gäster efter", "Riktning", "Gruppera efter typ (VM / LXC)", "Typordning (vid gruppering)", "Språk", "Sektioner", "Detaljer", "Gästsortering", "Namn", "Status (igång först)", "Stigande ↓", "Fallande ↑", "VM, sedan containrar", "Containrar, sedan VM", "Filter", "Visa endast dessa gäster (ID eller namn)", "Dölj dessa gäster (ID eller namn)", "{n} av {m} gäster har strömknappar.", "Ingen knapp hittades: aktivera entiteterna Starta / Stäng av / Starta om i Proxmox VE-integrationen (Inställningar → Enheter och tjänster → gästen → inaktiverade entiteter).", "{n} hittade", "Skriv ett ID eller namn och tryck på Enter. Använd alternativet guests: i YAML för att byta namn på gäster eller ändra deras ikon.", "Klustersammanfattning (från 2 noder)", "Historikkurvor", "Senaste säkerhetskopia", "Kolumner för gäster", "Accentfärg", "Historikperiod (timmar)", "Hopfällda sektioner", "Layout", "Automatisk (2 kolumner när bred)", "1 kolumn", "2 kolumner", "Kräver entiteten ”Last backup” för noden (inaktiverad som standard: Inställningar → Enheter och tjänster → noden → inaktiverade entiteter).", "Visas från 2 noder.", "Nätverk in / ut per gäst", "Nätverksvisning", "Enhet för hastighet", "Hastighet (per sekund)", "Totalt sedan start", "Byte (kB/s, MB/s…)", "Bitar (kbit/s, Mbit/s…)", "Kräver entiteterna ”Network in” och ”Network out” för varje gäst (inaktiverade som standard: Inställningar → Enheter och tjänster → gästen → inaktiverade entiteter). De är ackumulerade räknare, så kortet beräknar hastigheten.", "Storlekar (använt / ledigt / totalt)", "Tryckmärken (CPU, minne, I/O)", "Ögonblicksbilder (antal och knapp)", "Kräver entiteterna ”Disk total” och ”Disk free” för lagringarna (inaktiverade som standard: Inställningar → Enheter och tjänster → lagringen → inaktiverade entiteter). Minnestotaler härleds från ”Memory used” och ”Memory free”.", "Kräver tryckentiteterna (CPU / I/O / minne) för gästerna (inaktiverade som standard, Proxmox 9 eller senare).", "Gästernas andel av värden (CPU / RAM)", "Kräver entiteterna ”CPU used of host” och ”Memory used of host” för gästerna (inaktiverade som standard: Inställningar → Enheter och tjänster → gästen → inaktiverade entiteter).", "Nodernas CPU-temperatur", "Gruppera per nod (kluster)", "Sektionsordning", "Åtgärd vid klick på en ruta", "Tröskelvärden", "orange från", "röd från", "Certifikat (dagar kvar)", "Disktemperatur", "Tomt = öppna entitetens detaljer. Varnings-, versions- och HA-märkena öppnar alltid sin entitet.", "Kräver nodens hårdvarusensorer (PVE-mods med lm-sensors på Proxmox-värden).", "CPU (mest belastade först)", "RAM (mest belastade först)", "Prognos för lagringsfyllnad", "Beräknas på de senaste 7 dagarnas historik; visas när lagringen skulle bli full inom ett år.", "Sökning och filtret ”Problem” (från 6 gäster)", "Kompakt läge", "Gästernas namn och ikoner", "namn", "ikon", "Full lagring (dagar kvar)", "Gäst", "Utfällda detaljer (historik, varningar)"],
  da: ["Titel", "Filtrer efter node / navn (valgfrit)", "Noder", "Virtuelle maskiner", "Containere", "Stoppede gæster", "Advarsler (opdateringer, sikkerhedskopi, mislykkede opgaver…)", "Lager", "Fysiske diske", "Tænd/sluk-knapper", "IP-adresse", "Gæsternes oppetid", "Gæstemærker (låst, agent, problem)", "Nodernes swap", "Belastning og IO delay", "Proxmox-version", "Sorteringsknapper på kortet", "Sortér gæster efter", "Retning", "Gruppér efter type (VM / LXC)", "Typerækkefølge (ved gruppering)", "Sprog", "Sektioner", "Detaljer", "Sortering af gæster", "Navn", "Status (kørende først)", "Stigende ↓", "Faldende ↑", "VM, derefter containere", "Containere, derefter VM", "Filtre", "Vis kun disse gæster (ID eller navn)", "Skjul disse gæster (ID eller navn)", "{n} af {m} gæster har tænd/sluk-knapper.", "Ingen knap fundet: aktivér entiteterne Start / Luk ned / Genstart i Proxmox VE-integrationen (Indstillinger → Enheder og tjenester → gæsten → deaktiverede entiteter).", "{n} fundet", "Skriv et ID eller navn og tryk på Enter. Brug indstillingen guests: i YAML til at omdøbe gæster eller ændre deres ikon.", "Klyngeoversigt (fra 2 noder)", "Historikkurver", "Seneste sikkerhedskopi", "Kolonner for gæster", "Accentfarve", "Historikperiode (timer)", "Sammenfoldede sektioner", "Layout", "Automatisk (2 kolonner når bred)", "1 kolonne", "2 kolonner", "Kræver entiteten “Last backup” for noden (deaktiveret som standard: Indstillinger → Enheder og tjenester → noden → deaktiverede entiteter).", "Vises fra 2 noder.", "Netværk ind / ud pr. gæst", "Netværksvisning", "Enhed for hastighed", "Hastighed (pr. sekund)", "Samlet siden start", "Bytes (kB/s, MB/s…)", "Bits (kbit/s, Mbit/s…)", "Kræver entiteterne “Network in” og “Network out” for hver gæst (deaktiveret som standard: Indstillinger → Enheder og tjenester → gæsten → deaktiverede entiteter). Det er akkumulerede tællere, så kortet beregner hastigheden.", "Størrelser (brugt / ledig / i alt)", "Trykmærker (CPU, hukommelse, I/O)", "Snapshots (antal og knap)", "Kræver entiteterne “Disk total” og “Disk free” for lagrene (deaktiveret som standard: Indstillinger → Enheder og tjenester → lageret → deaktiverede entiteter). Hukommelsestotaler udledes af “Memory used” og “Memory free”.", "Kræver trykentiteterne (CPU / I/O / hukommelse) for gæsterne (deaktiveret som standard, Proxmox 9 eller nyere).", "Gæsternes andel af værten (CPU / RAM)", "Kræver entiteterne “CPU used of host” og “Memory used of host” for gæsterne (deaktiveret som standard: Indstillinger → Enheder og tjenester → gæsten → deaktiverede entiteter).", "Nodernes CPU-temperatur", "Gruppér efter node (klynger)", "Rækkefølge af sektioner", "Handling ved klik på en flise", "Tærskler", "orange fra", "rød fra", "Certifikat (dage tilbage)", "Disktemperatur", "Tom = åbn entitetens detaljer. Advarsels-, versions- og HA-mærkerne åbner altid deres entitet.", "Kræver nodens hardwaresensorer (PVE-mods med lm-sensors på Proxmox-værten).", "CPU (mest belastede først)", "RAM (mest belastede først)", "Prognose for lagerfyldning", "Beregnet på de seneste 7 dages historik; vises, når lageret ville være fuldt inden for et år.", "Søgning og filteret “Problemer” (fra 6 gæster)", "Kompakt tilstand", "Gæsternes navne og ikoner", "navn", "ikon", "Fuldt lager (dage tilbage)", "Gæst", "Udfoldede detaljer (historik, advarsler)"],
  nb: ["Tittel", "Filtrer på node / navn (valgfritt)", "Noder", "Virtuelle maskiner", "Containere", "Stoppede gjester", "Varsler (oppdateringer, sikkerhetskopi, mislykkede oppgaver…)", "Lagring", "Fysiske disker", "Strømknapper", "IP-adresse", "Gjestenes oppetid", "Gjestemerker (låst, agent, problem)", "Nodenes swap", "Belastning og IO delay", "Proxmox-versjon", "Sorteringsknapper på kortet", "Sorter gjester etter", "Retning", "Grupper etter type (VM / LXC)", "Typerekkefølge (ved gruppering)", "Språk", "Seksjoner", "Detaljer", "Sortering av gjester", "Navn", "Status (kjørende først)", "Stigende ↓", "Synkende ↑", "VM, deretter containere", "Containere, deretter VM", "Filtre", "Vis bare disse gjestene (ID eller navn)", "Skjul disse gjestene (ID eller navn)", "{n} av {m} gjester har strømknapper.", "Ingen knapp funnet: aktiver entitetene Start / Slå av / Start på nytt i Proxmox VE-integrasjonen (Innstillinger → Enheter og tjenester → gjesten → deaktiverte entiteter).", "{n} funnet", "Skriv en ID eller et navn og trykk Enter. Bruk alternativet guests: i YAML for å gi gjester nytt navn eller endre ikonet.", "Klyngeoversikt (fra 2 noder)", "Historikkurver", "Siste sikkerhetskopi", "Kolonner for gjester", "Aksentfarge", "Historikkperiode (timer)", "Sammenfoldede seksjoner", "Oppsett", "Automatisk (2 kolonner når bred)", "1 kolonne", "2 kolonner", "Krever entiteten «Last backup» for noden (deaktivert som standard: Innstillinger → Enheter og tjenester → noden → deaktiverte entiteter).", "Vises fra 2 noder.", "Nettverk inn / ut per gjest", "Nettverksvisning", "Enhet for hastighet", "Hastighet (per sekund)", "Totalt siden start", "Byte (kB/s, MB/s…)", "Biter (kbit/s, Mbit/s…)", "Krever entitetene «Network in» og «Network out» for hver gjest (deaktivert som standard: Innstillinger → Enheter og tjenester → gjesten → deaktiverte entiteter). Dette er akkumulerte tellere, så kortet beregner hastigheten.", "Størrelser (brukt / ledig / totalt)", "Trykkmerker (CPU, minne, I/O)", "Øyeblikksbilder (antall og knapp)", "Krever entitetene «Disk total» og «Disk free» for lagringene (deaktivert som standard: Innstillinger → Enheter og tjenester → lagringen → deaktiverte entiteter). Minnetotaler utledes fra «Memory used» og «Memory free».", "Krever trykkentitetene (CPU / I/O / minne) for gjestene (deaktivert som standard, Proxmox 9 eller nyere).", "Gjestenes andel av verten (CPU / RAM)", "Krever entitetene «CPU used of host» og «Memory used of host» for gjestene (deaktivert som standard: Innstillinger → Enheter og tjenester → gjesten → deaktiverte entiteter).", "Nodenes CPU-temperatur", "Grupper etter node (klynger)", "Rekkefølge på seksjoner", "Handling ved klikk på en flis", "Terskler", "oransje fra", "rød fra", "Sertifikat (dager igjen)", "Disktemperatur", "Tom = åpne entitetens detaljer. Varsel-, versjons- og HA-merkene åpner alltid sin entitet.", "Krever nodens maskinvaresensorer (PVE-mods med lm-sensors på Proxmox-verten).", "CPU (mest belastede først)", "RAM (mest belastede først)", "Prognose for lagringsfylling", "Beregnet fra de siste 7 dagenes historikk; vises når lagringen ville vært full innen et år.", "Søk og filteret «Problemer» (fra 6 gjester)", "Kompakt modus", "Gjestenes navn og ikoner", "navn", "ikon", "Full lagring (dager igjen)", "Gjest", "Utvidede detaljer (historikk, varsler)"],
  fi: ["Otsikko", "Suodata solmun / nimen mukaan (valinnainen)", "Solmut", "Virtuaalikoneet", "Kontit", "Pysäytetyt vieraat", "Hälytykset (päivitykset, varmuuskopiointi, epäonnistuneet tehtävät…)", "Tallennustilat", "Fyysiset levyt", "Virtapainikkeet", "IP-osoite", "Vieraiden käyttöaika", "Vieraiden merkit (lukittu, agentti, ongelma)", "Solmujen swap", "Kuorma ja IO delay", "Proxmox-versio", "Lajittelupainikkeet kortilla", "Lajittele vieraat", "Suunta", "Ryhmittele tyypin mukaan (VM / LXC)", "Tyyppien järjestys (ryhmitettäessä)", "Kieli", "Osiot", "Tiedot", "Vieraiden lajittelu", "Nimi", "Tila (käynnissä olevat ensin)", "Nouseva ↓", "Laskeva ↑", "VM:t, sitten kontit", "Kontit, sitten VM:t", "Suodattimet", "Näytä vain nämä vieraat (ID tai nimi)", "Piilota nämä vieraat (ID tai nimi)", "{n}/{m} vieraalla on virtapainikkeet.", "Painikkeita ei löytynyt: ota käyttöön Proxmox VE -integraation Käynnistä / Sammuta / Käynnistä uudelleen -entiteetit (Asetukset → Laitteet ja palvelut → vieras → käytöstä poistetut entiteetit).", "{n} löytyi", "Kirjoita ID tai nimi ja paina Enter. Nimeä vieraita uudelleen tai vaihda kuvake YAML:n guests:-asetuksella.", "Klusterin yhteenveto (vähintään 2 solmua)", "Historiakäyrät", "Viimeisin varmuuskopio", "Vieraiden sarakkeet", "Korostusväri", "Historian jakso (tuntia)", "Tiivistetyt osiot", "Asettelu", "Automaattinen (2 saraketta leveänä)", "1 sarake", "2 saraketta", "Vaatii solmun “Last backup” -entiteetin (oletuksena pois käytöstä: Asetukset → Laitteet ja palvelut → solmu → käytöstä poistetut entiteetit).", "Näytetään vähintään 2 solmulla.", "Verkko sisään / ulos vierasta kohti", "Verkon näyttö", "Nopeuden yksikkö", "Nopeus (sekunnissa)", "Yhteensä käynnistyksestä", "Tavut (kB/s, MB/s…)", "Bitit (kbit/s, Mbit/s…)", "Vaatii jokaisen vieraan entiteetit “Network in” ja “Network out” (oletuksena pois käytöstä: Asetukset → Laitteet ja palvelut → vieras → käytöstä poistetut entiteetit). Ne ovat kumulatiivisia laskureita, joten kortti laskee nopeuden.", "Koot (käytetty / vapaa / yhteensä)", "Painemerkit (CPU, muisti, I/O)", "Tilannevedokset (määrä ja painike)", "Vaatii tallennustilojen entiteetit “Disk total” ja “Disk free” (oletuksena pois käytöstä: Asetukset → Laitteet ja palvelut → tallennustila → käytöstä poistetut entiteetit). Muistin kokonaismäärät johdetaan entiteeteistä “Memory used” ja “Memory free”.", "Vaatii vieraiden paine-entiteetit (CPU / I/O / muisti) (oletuksena pois käytöstä, Proxmox 9 tai uudempi).", "Vieraiden osuus isännästä (CPU / RAM)", "Vaatii vieraiden entiteetit “CPU used of host” ja “Memory used of host” (oletuksena pois käytöstä: Asetukset → Laitteet ja palvelut → vieras → käytöstä poistetut entiteetit).", "Solmujen CPU-lämpötila", "Ryhmittele solmun mukaan (klusterit)", "Osioiden järjestys", "Toiminto ruutua napsautettaessa", "Kynnysarvot", "oranssi alkaen", "punainen alkaen", "Varmenne (päiviä jäljellä)", "Levyjen lämpötila", "Tyhjä = avaa entiteetin tiedot. Hälytys-, versio- ja HA-merkit avaavat aina oman entiteettinsä.", "Vaatii solmun laitteistoanturit (PVE-mods ja lm-sensors Proxmox-isännässä).", "CPU (kuormitetuimmat ensin)", "RAM (kuormitetuimmat ensin)", "Tallennustilojen täyttymisennuste", "Lasketaan viimeisen 7 päivän historiasta; näytetään, jos tallennustila täyttyisi vuoden sisällä.", "Haku ja ”Ongelmat”-suodatin (vähintään 6 vierasta)", "Tiivis tila", "Vieraiden nimet ja kuvakkeet", "nimi", "kuvake", "Tallennustila täynnä (päiviä jäljellä)", "Vieras", "Avatut tiedot (historia, hälytykset)"],
  ru: ["Заголовок", "Фильтр по узлу / имени (необязательно)", "Узлы", "Виртуальные машины", "Контейнеры", "Остановленные гости", "Оповещения (обновления, резервное копирование, неудачные задачи…)", "Хранилища", "Физические диски", "Кнопки питания", "IP-адрес", "Время работы гостей", "Значки гостей (заблокирован, агент, проблема)", "Swap узлов", "Нагрузка и IO delay", "Версия Proxmox", "Кнопки сортировки на карточке", "Сортировать гостей по", "Направление", "Группировать по типу (ВМ / LXC)", "Порядок типов (при группировке)", "Язык", "Разделы", "Подробности", "Сортировка гостей", "Имени", "Состоянию (работающие первыми)", "По возрастанию ↓", "По убыванию ↑", "ВМ, затем контейнеры", "Контейнеры, затем ВМ", "Фильтры", "Показывать только этих гостей (ID или имя)", "Скрыть этих гостей (ID или имя)", "У {n} из {m} гостей есть кнопки питания.", "Кнопки не найдены: включите сущности «Запустить / Выключить / Перезагрузить» интеграции Proxmox VE (Настройки → Устройства и службы → гость → отключённые сущности).", "Найдено: {n}", "Введите ID или имя и нажмите Enter. Чтобы переименовать гостей или сменить значок, используйте параметр guests: в YAML.", "Сводка по кластеру (от 2 узлов)", "Графики истории", "Последняя резервная копия", "Столбцы гостей", "Акцентный цвет", "Период истории (часы)", "Свёрнутые разделы", "Раскладка", "Автоматически (2 столбца при большой ширине)", "1 столбец", "2 столбца", "Нужна сущность «Last backup» узла (по умолчанию отключена: Настройки → Устройства и службы → узел → отключённые сущности).", "Показывается от 2 узлов.", "Сеть входящая / исходящая по гостям", "Отображение сети", "Единица скорости", "Скорость (в секунду)", "Всего с запуска", "Байты (kB/s, MB/s…)", "Биты (kbit/s, Mbit/s…)", "Нужны сущности «Network in» и «Network out» каждого гостя (по умолчанию отключены: Настройки → Устройства и службы → гость → отключённые сущности). Это накопительные счётчики, поэтому карточка вычисляет скорость.", "Размеры (занято / свободно / всего)", "Значки давления (ЦП, память, ввод-вывод)", "Снимки (число и кнопка)", "Нужны сущности «Disk total» и «Disk free» хранилищ (по умолчанию отключены: Настройки → Устройства и службы → хранилище → отключённые сущности). Объём памяти вычисляется из «Memory used» и «Memory free».", "Нужны сущности давления (ЦП / ввод-вывод / память) гостей (по умолчанию отключены, Proxmox 9 или новее).", "Доля гостей от хоста (ЦП / ОЗУ)", "Нужны сущности «CPU used of host» и «Memory used of host» гостей (по умолчанию отключены: Настройки → Устройства и службы → гость → отключённые сущности).", "Температура ЦП узлов", "Группировать по узлам (кластеры)", "Порядок разделов", "Действие при нажатии на плитку", "Пороги", "оранжевый от", "красный от", "Сертификат (осталось дней)", "Температура дисков", "Пусто = открыть сведения о сущности. Значки оповещений, версии и HA всегда открывают свою сущность.", "Нужны аппаратные датчики узла (PVE-mods с lm-sensors на хосте Proxmox).", "ЦП (самые загруженные первыми)", "ОЗУ (самые загруженные первыми)", "Прогноз заполнения хранилищ", "Рассчитывается по истории за 7 дней; показывается, если хранилище заполнится в течение года.", "Поиск и фильтр «Проблемы» (от 6 гостей)", "Компактный режим", "Имена и значки гостей", "имя", "значок", "Хранилище заполнено (осталось дней)", "Гость", "Развёрнутые подробности (история, оповещения)"],
  uk: ["Заголовок", "Фільтр за вузлом / назвою (необов'язково)", "Вузли", "Віртуальні машини", "Контейнери", "Зупинені гості", "Сповіщення (оновлення, резервне копіювання, невдалі завдання…)", "Сховища", "Фізичні диски", "Кнопки живлення", "IP-адреса", "Час роботи гостей", "Значки гостей (заблоковано, агент, проблема)", "Swap вузлів", "Навантаження та IO delay", "Версія Proxmox", "Кнопки сортування на картці", "Сортувати гостей за", "Напрямок", "Групувати за типом (ВМ / LXC)", "Порядок типів (при групуванні)", "Мова", "Розділи", "Подробиці", "Сортування гостей", "Назвою", "Станом (працюючі першими)", "За зростанням ↓", "За спаданням ↑", "ВМ, потім контейнери", "Контейнери, потім ВМ", "Фільтри", "Показувати лише цих гостей (ID або назва)", "Приховати цих гостей (ID або назва)", "У {n} з {m} гостей є кнопки живлення.", "Кнопок не знайдено: увімкніть сутності «Запустити / Вимкнути / Перезавантажити» інтеграції Proxmox VE (Налаштування → Пристрої та служби → гість → вимкнені сутності).", "Знайдено: {n}", "Введіть ID або назву й натисніть Enter. Щоб перейменувати гостей або змінити значок, використовуйте параметр guests: у YAML.", "Зведення кластера (від 2 вузлів)", "Графіки історії", "Остання резервна копія", "Стовпці гостей", "Акцентний колір", "Період історії (години)", "Згорнуті розділи", "Розкладка", "Автоматично (2 стовпці за великої ширини)", "1 стовпець", "2 стовпці", "Потрібна сутність «Last backup» вузла (типово вимкнена: Налаштування → Пристрої та служби → вузол → вимкнені сутності).", "Показується від 2 вузлів.", "Мережа вхідна / вихідна по гостях", "Відображення мережі", "Одиниця швидкості", "Швидкість (за секунду)", "Усього від запуску", "Байти (kB/s, MB/s…)", "Біти (kbit/s, Mbit/s…)", "Потрібні сутності «Network in» і «Network out» кожного гостя (типово вимкнені: Налаштування → Пристрої та служби → гість → вимкнені сутності). Це накопичувальні лічильники, тож картка обчислює швидкість.", "Розміри (зайнято / вільно / усього)", "Значки тиску (ЦП, пам'ять, введення-виведення)", "Знімки (кількість і кнопка)", "Потрібні сутності «Disk total» і «Disk free» сховищ (типово вимкнені: Налаштування → Пристрої та служби → сховище → вимкнені сутності). Обсяги пам'яті обчислюються з «Memory used» і «Memory free».", "Потрібні сутності тиску (ЦП / введення-виведення / пам'ять) гостей (типово вимкнені, Proxmox 9 або новіший).", "Частка гостей від хоста (ЦП / ОЗП)", "Потрібні сутності «CPU used of host» і «Memory used of host» гостей (типово вимкнені: Налаштування → Пристрої та служби → гість → вимкнені сутності).", "Температура ЦП вузлів", "Групувати за вузлами (кластери)", "Порядок розділів", "Дія при натисканні на плитку", "Пороги", "помаранчевий від", "червоний від", "Сертифікат (залишилось днів)", "Температура дисків", "Порожньо = відкрити відомості про сутність. Значки сповіщень, версії та HA завжди відкривають свою сутність.", "Потрібні апаратні датчики вузла (PVE-mods з lm-sensors на хості Proxmox).", "ЦП (найзавантаженіші першими)", "ОЗП (найзавантаженіші першими)", "Прогноз заповнення сховищ", "Обчислюється за історією за 7 днів; показується, якщо сховище заповниться протягом року.", "Пошук і фільтр «Проблеми» (від 6 гостей)", "Компактний режим", "Назви та значки гостей", "назва", "значок", "Сховище заповнене (залишилось днів)", "Гість", "Розгорнуті подробиці (історія, сповіщення)"],
  tr: ["Başlık", "Düğüm / ada göre filtrele (isteğe bağlı)", "Düğümler", "Sanal makineler", "Konteynerler", "Durdurulmuş konuklar", "Uyarılar (güncellemeler, yedekleme, başarısız görevler…)", "Depolamalar", "Fiziksel diskler", "Güç düğmeleri", "IP adresi", "Konuk çalışma süresi", "Konuk rozetleri (kilitli, aracı, sorun)", "Düğüm swap", "Yük ve IO delay", "Proxmox sürümü", "Karttaki sıralama düğmeleri", "Konukları sırala", "Yön", "Türe göre grupla (VM / LXC)", "Tür sırası (gruplanınca)", "Dil", "Bölümler", "Ayrıntılar", "Konuk sıralaması", "Ad", "Durum (çalışanlar önce)", "Artan ↓", "Azalan ↑", "VM'ler, sonra konteynerler", "Konteynerler, sonra VM'ler", "Filtreler", "Yalnızca bu konukları göster (ID veya ad)", "Bu konukları gizle (ID veya ad)", "{m} konuktan {n} tanesinde güç düğmeleri var.", "Düğme bulunamadı: Proxmox VE entegrasyonunun Başlat / Kapat / Yeniden başlat varlıklarını etkinleştirin (Ayarlar → Cihazlar ve hizmetler → konuk → devre dışı varlıklar).", "{n} bulundu", "Bir ID veya ad yazıp Enter'a basın. Konukları yeniden adlandırmak veya simgelerini değiştirmek için YAML'daki guests: seçeneğini kullanın.", "Küme özeti (2 veya daha fazla düğüm)", "Geçmiş eğrileri", "Son yedekleme", "Konuk sütunları", "Vurgu rengi", "Geçmiş süresi (saat)", "Daraltılmış bölümler", "Düzen", "Otomatik (geniş olduğunda 2 sütun)", "1 sütun", "2 sütun", "Düğümün “Last backup” varlığı gerekir (varsayılan olarak devre dışı: Ayarlar → Cihazlar ve hizmetler → düğüm → devre dışı varlıklar).", "2 düğümden itibaren gösterilir.", "Konuk başına gelen / giden ağ", "Ağ gösterimi", "Hız birimi", "Hız (saniye başına)", "Başlangıçtan beri toplam", "Bayt (kB/s, MB/s…)", "Bit (kbit/s, Mbit/s…)", "Her konuğun “Network in” ve “Network out” varlıkları gerekir (varsayılan olarak devre dışı: Ayarlar → Cihazlar ve hizmetler → konuk → devre dışı varlıklar). Bunlar kümülatif sayaçlardır, bu yüzden kart hızı hesaplar.", "Boyutlar (kullanılan / boş / toplam)", "Baskı rozetleri (CPU, bellek, G/Ç)", "Anlık görüntüler (sayı ve düğme)", "Depolamaların “Disk total” ve “Disk free” varlıkları gerekir (varsayılan olarak devre dışı: Ayarlar → Cihazlar ve hizmetler → depolama → devre dışı varlıklar). Bellek toplamları “Memory used” ve “Memory free” varlıklarından çıkarılır.", "Konukların baskı varlıkları (CPU / G/Ç / bellek) gerekir (varsayılan olarak devre dışı, Proxmox 9 veya üstü).", "Konukların ana makinedeki payı (CPU / RAM)", "Konukların “CPU used of host” ve “Memory used of host” varlıkları gerekir (varsayılan olarak devre dışı: Ayarlar → Cihazlar ve hizmetler → konuk → devre dışı varlıklar).", "Düğüm CPU sıcaklığı", "Düğüme göre grupla (kümeler)", "Bölüm sırası", "Bir kutucuğa tıklanınca yapılacak işlem", "Eşikler", "turuncu başlangıcı", "kırmızı başlangıcı", "Sertifika (kalan gün)", "Disk sıcaklığı", "Boş = varlık ayrıntılarını aç. Uyarı, sürüm ve HA rozetleri her zaman kendi varlıklarını açar.", "Düğümün donanım sensörleri gerekir (Proxmox ana makinesinde lm-sensors ile PVE-mods).", "CPU (en yoğun önce)", "RAM (en yoğun önce)", "Depolama doluluk tahmini", "Son 7 günlük geçmişten hesaplanır; depolama bir yıl içinde dolacaksa gösterilir.", "Arama ve “Sorunlar” filtresi (6 konuktan itibaren)", "Kompakt mod", "Konuk adları ve simgeleri", "ad", "simge", "Depolama dolu (kalan gün)", "Konuk", "Açık ayrıntılar (geçmiş, uyarılar)"],
  ro: ["Titlu", "Filtrare după nod / nume (opțional)", "Noduri", "Mașini virtuale", "Containere", "Oaspeți opriți", "Alerte (actualizări, copie de rezervă, sarcini eșuate…)", "Stocări", "Discuri fizice", "Butoane de alimentare", "Adresă IP", "Timp de funcționare oaspeți", "Insigne oaspeți (blocat, agent, problemă)", "Swap noduri", "Încărcare și IO delay", "Versiune Proxmox", "Butoane de sortare pe card", "Sortează oaspeții după", "Sens", "Grupare după tip (VM / LXC)", "Ordinea tipurilor (la grupare)", "Limbă", "Secțiuni", "Detalii", "Sortarea oaspeților", "Nume", "Stare (cei activi primii)", "Crescător ↓", "Descrescător ↑", "VM, apoi containere", "Containere, apoi VM", "Filtre", "Afișează doar acești oaspeți (ID sau nume)", "Ascunde acești oaspeți (ID sau nume)", "{n} din {m} oaspeți au butoane de alimentare.", "Niciun buton găsit: activați entitățile Pornește / Oprește / Repornește ale integrării Proxmox VE (Setări → Dispozitive și servicii → oaspetele → entități dezactivate).", "{n} detectate", "Introduceți un ID sau un nume și apăsați Enter. Pentru a redenumi oaspeții sau a schimba pictograma, folosiți opțiunea guests: în YAML.", "Rezumatul clusterului (2 noduri sau mai multe)", "Curbe de istoric", "Ultima copie de rezervă", "Coloane oaspeți", "Culoare de accent", "Perioada istoricului (ore)", "Secțiuni restrânse", "Aspect", "Automat (2 coloane când e lat)", "1 coloană", "2 coloane", "Necesită entitatea „Last backup” a nodului (dezactivată implicit: Setări → Dispozitive și servicii → nodul → entități dezactivate).", "Afișat de la 2 noduri.", "Rețea intrare / ieșire per oaspete", "Afișarea rețelei", "Unitatea vitezei", "Viteză (pe secundă)", "Total de la pornire", "Octeți (kB/s, MB/s…)", "Biți (kbit/s, Mbit/s…)", "Necesită entitățile „Network in” și „Network out” ale fiecărui oaspete (dezactivate implicit: Setări → Dispozitive și servicii → oaspetele → entități dezactivate). Sunt contoare cumulative, deci cardul calculează viteza.", "Dimensiuni (folosit / liber / total)", "Insigne de presiune (CPU, memorie, I/O)", "Instantanee (număr și buton)", "Necesită entitățile „Disk total” și „Disk free” ale stocărilor (dezactivate implicit: Setări → Dispozitive și servicii → stocarea → entități dezactivate). Totalurile de memorie se deduc din „Memory used” și „Memory free”.", "Necesită entitățile de presiune (CPU / I/O / memorie) ale oaspeților (dezactivate implicit, Proxmox 9 sau mai nou).", "Ponderea oaspeților în gazdă (CPU / RAM)", "Necesită entitățile „CPU used of host” și „Memory used of host” ale oaspeților (dezactivate implicit: Setări → Dispozitive și servicii → oaspetele → entități dezactivate).", "Temperatura CPU a nodurilor", "Grupare după nod (clustere)", "Ordinea secțiunilor", "Acțiune la clic pe o casetă", "Praguri", "portocaliu de la", "roșu de la", "Certificat (zile rămase)", "Temperatura discurilor", "Gol = deschide detaliile entității. Insignele de alertă, versiune și HA deschid mereu entitatea lor.", "Necesită senzorii hardware ai nodului (PVE-mods cu lm-sensors pe gazda Proxmox).", "CPU (cei mai încărcați primii)", "RAM (cei mai încărcați primii)", "Prognoza de umplere a stocărilor", "Calculată pe ultimele 7 zile de istoric; afișată când stocarea s-ar umple în mai puțin de un an.", "Căutare și filtrul „Probleme” (de la 6 oaspeți)", "Mod compact", "Numele și pictogramele oaspeților", "nume", "pictogramă", "Stocare plină (zile rămase)", "Oaspete", "Detalii desfășurate (istoric, alerte)"],
  hu: ["Cím", "Szűrés csomópont / név szerint (opcionális)", "Csomópontok", "Virtuális gépek", "Tárolók (konténerek)", "Leállított vendégek", "Riasztások (frissítések, mentés, sikertelen feladatok…)", "Tárolók", "Fizikai lemezek", "Bekapcsoló gombok", "IP-cím", "Vendégek üzemideje", "Vendég jelvények (zárolt, ügynök, hiba)", "Csomópontok swap", "Terhelés és IO delay", "Proxmox verzió", "Rendezőgombok a kártyán", "Vendégek rendezése", "Irány", "Csoportosítás típus szerint (VM / LXC)", "Típusok sorrendje (csoportosításkor)", "Nyelv", "Szakaszok", "Részletek", "Vendégek rendezése", "Név", "Állapot (futók elöl)", "Növekvő ↓", "Csökkenő ↑", "VM-ek, majd konténerek", "Konténerek, majd VM-ek", "Szűrők", "Csak ezek a vendégek jelenjenek meg (ID vagy név)", "Ezek a vendégek legyenek elrejtve (ID vagy név)", "{m} vendégből {n}-nek van bekapcsoló gombja.", "Nem található gomb: engedélyezze a Proxmox VE integráció Indítás / Leállítás / Újraindítás entitásait (Beállítások → Eszközök és szolgáltatások → a vendég → letiltott entitások).", "{n} található", "Írjon be egy azonosítót vagy nevet, majd nyomjon Entert. Vendégek átnevezéséhez vagy ikonjuk módosításához használja a guests: beállítást YAML-ban.", "Fürt összegzése (2 vagy több csomópont)", "Előzménygörbék", "Utolsó mentés", "Vendégek oszlopai", "Kiemelőszín", "Előzmények időszaka (óra)", "Összecsukott szakaszok", "Elrendezés", "Automatikus (2 oszlop széles kártyán)", "1 oszlop", "2 oszlop", "A csomópont „Last backup” entitására van szükség (alapértelmezés szerint letiltott: Beállítások → Eszközök és szolgáltatások → a csomópont → letiltott entitások).", "2 csomóponttól jelenik meg.", "Bejövő / kimenő hálózat vendégenként", "Hálózat megjelenítése", "Sebesség mértékegysége", "Sebesség (másodpercenként)", "Összesen az indítás óta", "Bájt (kB/s, MB/s…)", "Bit (kbit/s, Mbit/s…)", "Minden vendég „Network in” és „Network out” entitására szükség van (alapértelmezés szerint letiltottak: Beállítások → Eszközök és szolgáltatások → a vendég → letiltott entitások). Halmozódó számlálók, ezért a kártya számolja ki a sebességet.", "Méretek (használt / szabad / összes)", "Nyomásjelvények (CPU, memória, I/O)", "Pillanatképek (szám és gomb)", "A tárolók „Disk total” és „Disk free” entitásaira van szükség (alapértelmezés szerint letiltottak: Beállítások → Eszközök és szolgáltatások → a tároló → letiltott entitások). A memória összesen értéke a „Memory used” és „Memory free” értékből származik.", "A vendégek nyomás-entitásaira (CPU / I/O / memória) van szükség (alapértelmezés szerint letiltottak, Proxmox 9 vagy újabb).", "A vendégek részesedése a gazdagépből (CPU / RAM)", "A vendégek „CPU used of host” és „Memory used of host” entitásaira van szükség (alapértelmezés szerint letiltottak: Beállítások → Eszközök és szolgáltatások → a vendég → letiltott entitások).", "A csomópontok CPU-hőmérséklete", "Csoportosítás csomópont szerint (fürtök)", "Szakaszok sorrendje", "Művelet csempére kattintáskor", "Küszöbértékek", "narancs ettől", "piros ettől", "Tanúsítvány (hátralévő napok)", "Lemezhőmérséklet", "Üres = az entitás részleteinek megnyitása. A riasztás-, verzió- és HA-jelvények mindig a saját entitásukat nyitják meg.", "A csomópont hardveres érzékelői szükségesek (PVE-mods lm-sensors-szal a Proxmox gazdagépen).", "CPU (legterheltebbek elöl)", "RAM (legterheltebbek elöl)", "Tárolók telítődési előrejelzése", "Az elmúlt 7 nap előzményeiből számolva; akkor jelenik meg, ha a tároló egy éven belül megtelne.", "Keresés és „Problémák” szűrő (6 vendégtől)", "Kompakt mód", "Vendégek nevei és ikonjai", "név", "ikon", "Tároló megtelik (hátralévő napok)", "Vendég", "Kibontott részletek (előzmények, riasztások)"],
  ja: ["タイトル", "ノード／名前で絞り込み（任意）", "ノード", "仮想マシン", "コンテナ", "停止中のゲスト", "アラート（更新、バックアップ、失敗したタスクなど）", "ストレージ", "物理ディスク", "電源ボタン", "IP アドレス", "ゲストの稼働時間", "ゲストのバッジ（ロック、エージェント、問題）", "ノードのスワップ", "負荷と IO delay", "Proxmox のバージョン", "カード上の並べ替えボタン", "ゲストの並べ替え基準", "方向", "種類でグループ化（VM / LXC）", "種類の順序（グループ化時）", "言語", "セクション", "詳細", "ゲストの並べ替え", "名前", "状態（稼働中を先頭）", "昇順 ↓", "降順 ↑", "VM、次にコンテナ", "コンテナ、次に VM", "フィルター", "これらのゲストのみ表示（ID または名前）", "これらのゲストを非表示（ID または名前）", "{m} 台中 {n} 台のゲストに電源ボタンがあります。", "ボタンが見つかりません：Proxmox VE インテグレーションの「起動 / シャットダウン / 再起動」エンティティを有効にしてください（設定 → デバイスとサービス → ゲスト → 無効なエンティティ）。", "{n} 件検出", "ID または名前を入力して Enter を押します。ゲスト名やアイコンの変更は YAML の guests: オプションで行います。", "クラスターの概要（2 ノード以上）", "履歴グラフ", "最後のバックアップ", "ゲストの列数", "アクセントカラー", "履歴の期間（時間）", "折りたたむセクション", "レイアウト", "自動（幅が広い場合は 2 列）", "1 列", "2 列", "ノードの「Last backup」エンティティが必要です（既定では無効：設定 → デバイスとサービス → ノード → 無効なエンティティ）。", "2 ノード以上で表示されます。", "ゲストごとのネットワーク受信／送信", "ネットワーク表示", "速度の単位", "速度（毎秒）", "起動からの合計", "バイト（kB/s、MB/s…）", "ビット（kbit/s、Mbit/s…）", "各ゲストの「Network in」と「Network out」エンティティが必要です（既定では無効：設定 → デバイスとサービス → ゲスト → 無効なエンティティ）。累積カウンターのため、カードが速度を計算します。", "サイズ（使用／空き／合計）", "プレッシャーバッジ（CPU、メモリ、I/O）", "スナップショット（数とボタン）", "ストレージの「Disk total」と「Disk free」エンティティが必要です（既定では無効：設定 → デバイスとサービス → ストレージ → 無効なエンティティ）。メモリの合計は「Memory used」と「Memory free」から求めます。", "ゲストの CPU／I/O／メモリのプレッシャーエンティティが必要です（既定では無効、Proxmox 9 以降）。", "ゲストのホスト使用率（CPU / RAM）", "ゲストの「CPU used of host」と「Memory used of host」エンティティが必要です（既定では無効：設定 → デバイスとサービス → ゲスト → 無効なエンティティ）。", "ノードの CPU 温度", "ノードでグループ化（クラスター）", "セクションの順序", "タイルをクリックしたときの動作", "しきい値", "オレンジ：以上", "赤：以上", "証明書（残り日数）", "ディスク温度", "空欄 = エンティティの詳細を開く。アラート・バージョン・HA のピルは常にそのエンティティを開きます。", "ノードのハードウェアセンサーが必要です（Proxmox ホストに lm-sensors と PVE-mods）。", "CPU（負荷の高い順）", "RAM（負荷の高い順）", "ストレージの満杯予測", "直近 7 日間の履歴から計算し、1 年以内に満杯になる場合に表示します。", "検索と「問題」フィルター（ゲスト 6 台以上）", "コンパクトモード", "ゲストの名前とアイコン", "名前", "アイコン", "ストレージ満杯（残り日数）", "ゲスト", "詳細を展開（履歴、アラート）"],
  zh: ["标题", "按节点／名称筛选（可选）", "节点", "虚拟机", "容器", "已停止的客户机", "警报（更新、备份、失败任务等）", "存储", "物理磁盘", "电源按钮", "IP 地址", "客户机运行时间", "客户机徽章（锁定、代理、问题）", "节点交换分区", "负载和 IO delay", "Proxmox 版本", "卡片上的排序按钮", "客户机排序依据", "方向", "按类型分组（VM / LXC）", "类型顺序（分组时）", "语言", "分区", "详细信息", "客户机排序", "名称", "状态（运行中优先）", "升序 ↓", "降序 ↑", "先虚拟机，后容器", "先容器，后虚拟机", "筛选", "仅显示这些客户机（ID 或名称）", "隐藏这些客户机（ID 或名称）", "{m} 台客户机中有 {n} 台带电源按钮。", "未找到按钮：请启用 Proxmox VE 集成的“启动 / 关机 / 重启”实体（设置 → 设备与服务 → 客户机 → 已禁用的实体）。", "检测到 {n} 个", "输入 ID 或名称后按 Enter。要重命名客户机或更改图标，请在 YAML 中使用 guests: 选项。", "集群概览（2 个及以上节点）", "历史曲线", "上次备份", "客户机列数", "强调色", "历史时间范围（小时）", "已折叠的分区", "布局", "自动（宽度较大时为 2 列）", "1 列", "2 列", "需要节点的“Last backup”实体（默认禁用：设置 → 设备与服务 → 节点 → 已禁用的实体）。", "2 个及以上节点时显示。", "每个客户机的网络入站／出站", "网络显示", "速率单位", "速率（每秒）", "自启动以来的总量", "字节（kB/s、MB/s…）", "比特（kbit/s、Mbit/s…）", "需要每个客户机的“Network in”和“Network out”实体（默认禁用：设置 → 设备与服务 → 客户机 → 已禁用的实体）。它们是累计计数器，因此卡片会计算速率。", "大小（已用／可用／总计）", "压力徽章（CPU、内存、IO）", "快照（数量和按钮）", "需要存储的“Disk total”和“Disk free”实体（默认禁用：设置 → 设备与服务 → 存储 → 已禁用的实体）。内存总量由“Memory used”和“Memory free”推算。", "需要客户机的压力实体（CPU／IO／内存）（默认禁用，Proxmox 9 或更高版本）。", "客户机占主机比例（CPU / 内存）", "需要客户机的“CPU used of host”和“Memory used of host”实体（默认禁用：设置 → 设备与服务 → 客户机 → 已禁用的实体）。", "节点 CPU 温度", "按节点分组（集群）", "分区顺序", "点击磁贴时的操作", "阈值", "橙色起始值", "红色起始值", "证书（剩余天数）", "磁盘温度", "留空 = 打开实体详情。警报、版本和 HA 标签始终打开各自的实体。", "需要节点的硬件传感器（Proxmox 主机上的 PVE-mods 与 lm-sensors）。", "CPU（负载最高优先）", "内存（负载最高优先）", "存储填满预测", "根据最近 7 天的历史计算；当存储将在一年内填满时显示。", "搜索和“问题”筛选（6 个客户机起）", "紧凑模式", "客户机名称和图标", "名称", "图标", "存储已满（剩余天数）", "客户机", "展开详情（历史、警报）"],
});

/** Visual editor: shows the effective value of every option (missing keys = default), so the toggles never lie. */
export class ProxmoxCardEditor extends HTMLElement {
  setConfig(config) { this._config = config || {}; this._render(); }
  set hass(hass) { this._hass = hass; if (this._form) this._form.hass = hass; if (!this._hadHass) { this._hadHass = true; this._render(); } } // never re-render on every state change (it resets the form on mobile)
  _render() {
    if (!this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        const config = { ...this._config };
        for (let [k, v] of Object.entries(e.detail.value || {})) {
          const gm = k.match(/^g([ni])_(\d+)$/);
          if (gm) { // guest name / icon field
            const [, t, id] = gm, field = t === "n" ? "name" : "icon", val = (v || "").trim();
            if (val === (config.guests?.[id]?.[field] || "")) continue;
            const gs = { ...(config.guests || {}) }, o = { ...(gs[id] || {}) };
            if (val) o[field] = val; else delete o[field];
            if (Object.keys(o).length) gs[id] = o; else delete gs[id];
            if (Object.keys(gs).length) config.guests = gs; else delete config.guests;
            continue;
          }
          const tm = k.match(/^t_(.+)_(warning|critical)$/);
          if (tm) { // threshold field: only what differs from the default is written to the YAML
            const [, m, lv] = tm, cur = config.thresholds?.[m]?.[lv];
            if (v === undefined || v === null || v === "" || (cur === undefined && Number(v) === DEFAULT_THRESHOLDS[m][lv])) continue;
            config.thresholds = { ...(config.thresholds || {}), [m]: { ...(config.thresholds?.[m] || {}), [lv]: Number(v) } };
            continue;
          }
          if (k === "tap_action" && (!v || !Object.keys(v).length)) { delete config.tap_action; continue; }
          if (k === "history_hours") v = Number(v) || 24;
          if (k === "accent" && (v === undefined || v === null)) continue;
          if (k in EDITOR_DEFAULTS && JSON.stringify(v) === JSON.stringify(EDITOR_DEFAULTS[k]) && !(k in this._config)) continue; // keep YAML tidy
          config[k] = v;
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const lang = ((this._config.language && this._config.language !== "auto" ? this._config.language : this._hass?.locale?.language || this._hass?.language) || "en").slice(0, 2);
    const cardStr = { ...STRINGS.en, ...(STRINGS[lang] || {}) };
    const labels = { ...EDITOR_LABELS.en, ...(EDITOR_LABELS[lang] || {}), s_nodes: cardStr.nodes, s_guests: cardStr.guests, s_storage: cardStr.storage, s_disks: cardStr.disks };
    this._form.hass = this._hass;
    // what the integration currently exposes, to explain missing buttons / sections right in the editor
    this._stats = this._hass?.entities ? ProxmoxCard.prototype._collect.call({ _hass: this._hass, _cfg: { node: this._config.node || "" } }) : null;
    const guests = this._stats ? [...this._stats.qemu, ...this._stats.lxc].filter((g) => g.vmid).sort((a, b) => Number(a.vmid) - Number(b.vmid)) : [];
    const schemaKey = lang + "|" + guests.map((g) => g.vmid).join();
    if (this._schemaKey !== schemaKey) { // schema only changes with the language or the list of guests
      this._schemaKey = schemaKey;
      this._form.schema = editorSchema(labels, guests);
      const gName = Object.fromEntries(guests.map((g) => [g.vmid, g.name]));
      // threshold fields: "<gauge> · orange from" / "· red from"
      const metric = { cpu: cardStr.cpu, memory: cardStr.ram, disk: cardStr.disk, io: cardStr.io, pressure: cardStr.pressure[0].toUpperCase() + cardStr.pressure.slice(1), cpu_temperature: cardStr.cpuTemp, temperature: labels.th_disk_temp, wear: cardStr.wear, certificate: labels.th_cert, forecast: labels.th_forecast };
      this._form.computeLabel = (s) => {
        const gm = s.name?.match(/^g([ni])_(\d+)$/);
        if (gm) return `#${gm[2]} ${gName[gm[2]] || ""} · ${gm[1] === "n" ? labels.g_name : labels.g_icon}`;
        const tm = s.name?.match(/^t_(.+)_(warning|critical)$/);
        if (tm) return `${metric[tm[1]] || tm[1]} · ${tm[2] === "warning" ? labels.th_warn : labels.th_crit}`;
        return labels[s.name] || labels[s.title] || s.name || s.title;
      };
      const fill = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => v[k]);
      this._form.computeHelper = (s) => {
        const d = this._stats;
        if (!d) return undefined;
        if (s.name === "show_actions") {
          const g = [...d.qemu, ...d.lxc];
          const n = g.filter((x) => x.roles.btn_start || x.roles.btn_shutdown || x.roles.btn_reboot || x.roles.btn_stop).length;
          return g.length ? (n ? fill(labels.h_buttons, { n, m: g.length }) : labels.h_nobuttons) : undefined;
        }
        if (s.name === "show_storage") return fill(labels.h_found, { n: d.storage.length + d.zfs.length + (d.cluster?.roles.ceph_health || d.cluster?.roles.ceph_pct ? 1 : 0) });
        if (s.name === "show_disks") return fill(labels.h_found, { n: d.disks.length });
        if (s.name === "include") return labels.h_filters;
        if (s.name === "tap_action") return labels.h_tap;
        if (s.name === "show_forecast") return labels.h_forecast;
        if (s.name === "show_temperature") return d.nodes.some((n) => n.hw?.length) ? undefined : labels.h_temp;
        if (s.name === "show_cluster") return labels.h_cluster;
        if (s.name === "show_sizes") return d.storage.length && !d.storage.some((x) => x.roles.disk_total || x.roles.disk_free) ? labels.h_sizes : undefined;
        if (s.name === "show_host_share") {
          const g = [...d.qemu, ...d.lxc];
          return g.length && !g.some((x) => x.roles.cpu_host || x.roles.mem_host) ? labels.h_host : undefined;
        }
        if (s.name === "show_pressure") {
          const g = [...d.qemu, ...d.lxc];
          return g.length && !g.some((x) => x.roles.p_cpu || x.roles.p_io || x.roles.p_mem) ? labels.h_pressure : undefined;
        }
        if (s.name === "show_network") {
          const g = [...d.qemu, ...d.lxc];
          return g.length && !g.some((x) => x.roles.net_in || x.roles.net_out) ? labels.h_network : undefined;
        }
        if (s.name === "show_backup") return d.nodes.some((n) => n.roles.backup_last) ? undefined : labels.h_backup;
        return undefined;
      };
    }
    const data = { ...EDITOR_DEFAULTS, ...this._config };
    for (const [m] of THRESHOLD_FIELDS) for (const lv of ["warning", "critical"]) data[`t_${m}_${lv}`] = this._config.thresholds?.[m]?.[lv] ?? DEFAULT_THRESHOLDS[m][lv];
    delete data.thresholds;
    for (const g of guests) { data[`gn_${g.vmid}`] = this._config.guests?.[g.vmid]?.name || ""; data[`gi_${g.vmid}`] = this._config.guests?.[g.vmid]?.icon || ""; }
    data.history_hours = String(data.history_hours); // select values are strings
    data.guest_columns = String(data.guest_columns);
    const key = JSON.stringify(data);
    if (key !== this._dataKey) { this._dataKey = key; this._form.data = data; } // keep the same object when nothing changed
    this._rendered = true;
  }
}
if (!customElements.get("proxmox-card-editor")) customElements.define("proxmox-card-editor", ProxmoxCardEditor);

export class ProxmoxCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._cfg = null;
    this._last = "";
    this._armed = null;
    const style = document.createElement("style");
    style.textContent = css;
    this._root = document.createElement("ha-card");
    this.shadowRoot.append(style, this._root);
    this._root.addEventListener("click", (e) => this._onClick(e));
    this._history = {};
    this._net = {}; // last counter sample per network entity, to turn the cumulative counters into a rate
    this._root.addEventListener("input", (e) => {
      if (!e.target.classList?.contains("gsearch")) return;
      this._search = e.target.value; this._last = ""; this._render();
    });
    this._root.addEventListener("keydown", (e) => {
      if (e.target.classList?.contains("gsearch")) {
        if (e.key === "Escape" && e.target.value) { e.target.value = ""; this._search = ""; this._last = ""; this._render(); e.stopPropagation(); }
        return;
      }
      // Enter / Space on a focused tile or pill = click (buttons already do it natively)
      if ((e.key === "Enter" || e.key === " ") && e.target.matches?.("[data-more]")) { e.preventDefault(); e.target.click(); return; }
      const tg = e.target.closest?.("[data-toggle]");
      if (tg && (e.key === "Enter" || e.key === " ") && !e.target.closest("[data-sort]")) { e.preventDefault(); this._toggle(tg.dataset.toggle); }
    });
    // an open "⋯" menu closes with Escape or with a click anywhere outside it (listeners on the page, only while a menu is open)
    this._onDocKey = (e) => { if (e.key === "Escape" && this._menu) { this._closeMenu(); e.preventDefault(); } };
    this._onDocClick = (e) => {
      if (this._menu && !e.composedPath().some((n) => n.classList?.contains("menu") || n.dataset?.menu !== undefined)) this._closeMenu();
    };
  }
  _closeMenu() { this._menu = null; this._armed = null; this._last = ""; this._render(); }
  /** Page listeners follow the open menu, so a card without an open menu costs nothing. */
  _syncMenuListeners() {
    const want = !!this._menu && this.isConnected;
    if (want === !!this._menuListening) return;
    this._menuListening = want;
    const f = want ? "addEventListener" : "removeEventListener";
    window[f]("keydown", this._onDocKey); window[f]("click", this._onDocClick, true);
  }

  connectedCallback() {
    clearInterval(this._histTimer);
    this._histTimer = setInterval(() => { this._loadHistory(true); if (Date.now() - (this._fcAt || 0) > 3600e3) this._loadForecast(true); }, 300000);
    if (this._cfg && this._hass) this._loadHistory();
  }
  disconnectedCallback() { clearInterval(this._histTimer); this._syncMenuListeners(); }

  static getStubConfig() { return { type: "custom:proxmox-card", title: "Proxmox" }; }
  static getConfigElement() { return document.createElement("proxmox-card-editor"); }

  setConfig(config) {
    this._cfg = {
      title: "Proxmox", node: "", show_nodes: true, show_qemu: true, show_lxc: true, show_stopped: true,
      show_actions: true, show_ip: true, show_uptime: true, show_badges: true, show_swap: true, show_load: true,
      show_version: true, show_alerts: true, show_storage: true, show_disks: true, show_cluster: true, show_history: true, show_backup: true, history_hours: 24, guest_columns: "auto", collapsed: [], show_network: true, network_mode: "rate", network_unit: "bytes", show_sizes: true, show_pressure: true, show_snapshots: true, show_host_share: true, show_temperature: true, group_by_node: false, section_order: [], show_forecast: true, show_filter_bar: true, compact: false, show_sort: true, sort: "id", sort_dir: "asc", group_by_type: false, type_order: "vm_first", include: [], exclude: [], guests: {}, language: "auto", ...config,
      thresholds: Object.fromEntries(Object.entries(DEFAULT_THRESHOLDS).map(([k, v]) => [k, { ...v, ...((config.thresholds || {})[k] || {}) }])),
    };
    this._sort = null;
    this._coll = null;
    this._histKey = "";
    this._net = {}; this._netSeed = {};
    this._last = "";
    if (this._hass) this._render();
  }

  // HA sets `hass` on every state change in the house. Only re-render when something this card shows has changed.
  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    if (prev && this._ids && hass.entities === prev.entities && hass.devices === prev.devices && hass.locale === prev.locale && hass.language === prev.language
      && !this._dirty && ![...this._ids].some((id) => hass.states[id] !== prev.states[id])) return;
    this._dirty = false;
    this._render();
  }
  // Masonry view: height in units of 50 px. Use the real height once rendered so columns are balanced correctly.
  getCardSize() { const h = this._root?.offsetHeight; return h ? Math.ceil(h / 50) : 6; }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  _lang() { return this._cfg.language === "auto" ? (this._hass.locale?.language || this._hass.language || "en") : this._cfg.language; }
  _t(key) {
    const l = this._lang();
    return (STRINGS[l] || STRINGS[l?.split("-")[0]] || STRINGS.en)[key] ?? STRINGS.en[key] ?? key;
  }
  /** "<n> <text>" with the plural form of the language ("1 failed task", "2 failed tasks", "5 nieudanych zadań"). */
  _tn(key, n) {
    const l = String(this._lang() || "en"), base = PLURALS[l] ? l : l.split("-")[0];
    const forms = (PLURALS[base] || PLURALS.en)[key];
    if (!forms) return `${n} ${this._t(key)}`;
    let cat = "other";
    try { cat = new Intl.PluralRules(base).select(n); } catch (e) { /* unknown locale */ }
    const cats = PLURAL_CATS[base] || ["one", "other"], i = cats.indexOf(cat);
    return `${n} ${forms[Math.min(i < 0 ? forms.length - 1 : i, forms.length - 1)]}`;
  }

  /** Group proxmoxve entities by device and classify devices. */
  _collect() {
    const h = this._hass;
    if (!h.entities || !h.devices) return null;
    const byDev = {}, hwByDev = {}, ents = Object.values(h.entities);
    // the legacy domain only counts when the renamed integration is absent: once both exist, `proxmoxve` is the core integration
    if (this._platFor !== h.entities) { this._platFor = h.entities; this._platform = ents.some((e) => e.platform === PLATFORM) ? PLATFORM : LEGACY_PLATFORM; }
    for (const e of ents) {
      if (e.platform !== this._platform || !e.device_id || e.disabled_by || e.hidden) continue;
      // hardware sensors of a node (lm-sensors through PVE-mods): diagnostic, no translation key, named from a table
      // ("CPU package temperature"…). Kept apart: their entity_id ("…_cpu_…") would otherwise pass for the CPU usage.
      if (!e.translation_key && e.entity_category === "diagnostic" && e.entity_id.startsWith("sensor.")) { (hwByDev[e.device_id] ||= []).push(e); continue; }
      const role = roleOf(e);
      if (!role) continue;
      const d = (byDev[e.device_id] ||= {});
      // keep the first entity per role (prefer enabled sensor over duplicates)
      d[role] ||= e;
    }
    this._ids = new Set(Object.values(byDev).flatMap((r) => Object.values(r).map((e) => e.entity_id)));
    const nodes = [], qemu = [], lxc = [], storage = [], disks = [], clusters = [], zfs = [];
    for (const [devId, roles] of Object.entries(byDev)) {
      const dev = h.devices[devId];
      if (!dev) continue;
      const raw = dev.name_by_user || dev.name || "";
      const model = `${dev.model || ""}`.toLowerCase();
      const m = raw.match(/^\s*(qemu|vm|lxc|ct|node|storage|disk|zfs)\b[\s_:-]*(.*)$/i);
      const p = (m?.[1] || "").toLowerCase();
      const kind = !m && /cluster/i.test(raw) ? "cluster" : p === "storage" ? "storage" : p === "disk" ? "disk" : p === "zfs" ? "zfs"
        : /qemu|virtual/.test(model) || p === "qemu" || p === "vm" ? "qemu"
        : /lxc|container/.test(model) || p === "lxc" || p === "ct" ? "lxc"
        : /node/.test(model) || p === "node" ? "node" : null;
      if (!kind) continue;
      if (kind === "cluster" ? !roles.cpu && !roles.mem_pct && !roles.ceph_health && !roles.ceph_pct && !roles.no_backup && !roles.ha_armed && !roles.ha_errors && !roles.crm_stale :
          kind === "storage" ? !roles.disk_pct && !roles.active : kind === "zfs" ? !roles.disk_pct && !roles.zfs_health
          : kind === "disk" ? !roles.temp && !roles.health && !roles.wearout : !roles.status && !roles.cpu) continue;
      let name = (m ? m[2] : raw).trim();
      let vmid = "", host = "";
      if (kind === "storage") { const s = name.split("/"); if (s.length > 1) { host = s.shift(); name = s.join("/"); } }
      else if (kind === "disk" || kind === "zfs") { const s = name.match(/^([^:]+):\s*(.*)$/); if (s) { host = s[1]; name = s[2]; } }
      else {
        const v = name.match(/^(.*?)\s*\((\d+)\)\s*$/) || name.match(/^(.*?)\s+(\d{3,})$/);
        if (v) { name = v[1].trim() || name; vmid = v[2]; }
      }
      if (this._cfg.node && !raw.toLowerCase().includes(this._cfg.node.toLowerCase()) &&
          !(dev.via_device_id && (h.devices[dev.via_device_id]?.name || "").toLowerCase().includes(this._cfg.node.toLowerCase()))) continue;
      // a guest's enum status (running / stopped / paused / suspended…) is finer than the on / off binary sensor
      if ((kind === "qemu" || kind === "lxc") && roles.status_raw) roles.status = roles.status_raw;
      const item = { devId, name: name || raw, vmid, host, kind, roles, parent: dev.via_device_id || "" };
      if (kind === "node" && hwByDev[devId]) { item.hw = hwByDev[devId]; item.hw.forEach((e) => this._ids.add(e.entity_id)); }
      ({ node: nodes, qemu, lxc, storage, disk: disks, cluster: clusters, zfs })[kind].push(item);
    }
    // node of each guest (its parent device), shown on the guest and used to group guests by node
    const nodeName = Object.fromEntries(nodes.map((n) => [n.devId, n.name]));
    for (const g of [...qemu, ...lxc]) {
      const cur = g.roles.node_name && h.states[g.roles.node_name.entity_id]?.state; // "Node" sensor: follows migrations
      g.node = cur && !/^(unknown|unavailable)$/.test(cur) ? cur : nodeName[g.parent] || "";
    }
    const sort = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true });
    nodes.sort(sort);
    qemu.sort((a, b) => (Number(a.vmid) || 0) - (Number(b.vmid) || 0) || sort(a, b));
    lxc.sort((a, b) => (Number(a.vmid) || 0) - (Number(b.vmid) || 0) || sort(a, b));
    storage.sort(sort); disks.sort(sort); zfs.sort((a, b) => sort(a, b) || a.host.localeCompare(b.host));
    // `include` / `exclude` (lists of IDs or names) filter the guests everywhere on the card, counters included
    const keep = guestFilter(this._cfg);
    return { nodes, qemu: qemu.filter(keep), lxc: lxc.filter(keep), storage, disks, zfs, cluster: clusters[0] || null };
  }

  _state(ent) { return ent ? this._hass.states[ent.entity_id]?.state : undefined; }

  _pct(item, kind) {
    const r = item.roles;
    const direct = num(this._state(r[`${kind}_pct`]));
    if (direct !== null) return clamp(direct);
    if (kind === "cpu") {
      const v = num(this._state(r.cpu));
      return v === null ? null : clamp(v);
    }
    const used = num(this._state(r[`${kind}_used`])), total = num(this._state(r[`${kind}_total`]));
    if (used !== null && total) return clamp((used / total) * 100);
    if (used !== null && this._hass.states[r[`${kind}_used`]?.entity_id]?.attributes.unit_of_measurement === "%") return clamp(used);
    return null;
  }

  _metric(label, v, thr) {
    const l = level(v, thr);
    return `<div class="metric"><span>${label}</span><div class="bar"><i class="${l}" style="width:${v ?? 0}%"></i></div><b>${v === null ? "–" : Math.round(v) + "%"}</b></div>`;
  }
  _xtra(n) {
    const c = this._cfg, r = n.roles, parts = [];
    const cell = (icon, label, value, cl = "", tip = "") => parts.push(`<div class="si ${cl}"${tip ? ` title="${esc(tip)}"` : ""}><span class="ic"><ha-icon icon="${icon}"></ha-icon></span><div><b>${esc(value)}</b><small>${esc(label)}</small></div></div>`);
    if (c.show_load) {
      const l = num(this._state(r.load)), io = num(this._state(r.io));
      // 1 min load in large, 5 and 15 min next to the label when those (disabled by default) sensors exist
      const l5 = num(this._state(r.load5)), l15 = num(this._state(r.load15));
      const avg = [l5, l15].filter((x) => x !== null).map((x) => x.toFixed(2));
      if (l !== null) cell("mdi:speedometer", avg.length ? `${this._t("load")} · ${avg.join(" · ")}` : this._t("load"), l.toFixed(2));
      if (io !== null) cell("mdi:timer-sand", this._t("io"), `${io.toFixed(1)} %`, level(io, c.thresholds.io));
    }
    const t = c.show_temperature ? this._cpuTemp(n) : null;
    if (t) cell("mdi:thermometer", this._t("cpuTemp"), `${Math.round(t.value)} °C`, level(t.value, c.thresholds.cpu_temperature), t.tip);
    const narrow = parts.length;
    if (c.show_backup && r.backup_last) {
      const when = fmtDate(this._state(r.backup_last), this._lang());
      if (when) cell("mdi:backup-restore", this._t("lastBackup"), when, this._state(r.backup_status) === "on" ? "crit wide" : "wide");
    }
    return parts.length ? `<div class="strip" style="--n:${Math.max(1, narrow)}">${parts.join("")}</div>` : "";
  }
  /** CPU temperature of a node from its hardware sensors: the CPU package / control / die sensor, else the hottest CPU one. */
  _cpuTemp(n) {
    const temps = (n.hw || []).map((e) => {
      const st = this._hass.states[e.entity_id], v = num(st?.state);
      if (v === null || st.attributes?.device_class !== "temperature") return null;
      const dev = this._hass.devices[n.devId], full = String(st.attributes.friendly_name || e.entity_id);
      const label = dev?.name && full.startsWith(dev.name) ? full.slice(dev.name.length).trim() : full;
      return { label, value: st.attributes.unit_of_measurement === "°F" ? ((v - 32) * 5) / 9 : v };
    }).filter(Boolean);
    if (!temps.length) return null;
    const rank = (l) => (/cpu package|package id/i.test(l) ? 0 : /cpu control|tctl/i.test(l) ? 1 : /cpu die|tdie/i.test(l) ? 2 : /cpu|core|soc/i.test(l) ? 3 : 9);
    const best = [...temps].sort((a, b) => rank(a.label) - rank(b.label) || b.value - a.value)[0];
    if (rank(best.label) === 9) return null; // no CPU sensor: the others (disks, NIC…) are not the CPU
    return { value: best.value, tip: temps.map((x) => `${x.label} : ${Math.round(x.value)} °C`).join("\n") };
  }
  /** New Proxmox VE release of a node, from its update entity (null when none is pending). */
  _release(n) {
    const u = n.roles.pve_update && this._hass.states[n.roles.pve_update.entity_id];
    const lv = u?.state === "on" ? u.attributes?.latest_version : null;
    return lv && lv !== u.attributes?.installed_version ? String(lv) : null;
  }
  _ver(n) {
    if (!this._cfg.show_version) return "";
    const u = n.roles.pve_update && this._hass.states[n.roles.pve_update.entity_id];
    let v = this._state(n.roles.version);
    if (!v || /^unk|^unav/.test(v)) v = u?.attributes?.installed_version || "";
    const nv = this._release(n);
    if (nv) return `<span class="ver new" data-more="${esc(n.roles.pve_update.entity_id)}" title="${esc(this._t("newRelease").replace("{v}", nv))}">PVE ${v ? `${esc(v)} → ` : ""}${esc(nv)}</span>`;
    return v ? `<span class="ver" title="${esc(this._t("version"))}">PVE ${esc(v)}</span>` : "";
  }
  _sortState() {
    const c = this._cfg;
    // legacy `sort: type` (v0.4.0) = by ID, grouped by type
    return (this._sort ||= {
      by: SORTS.includes(c.sort) ? c.sort : "id",
      dir: c.sort_dir === "desc" ? "desc" : "asc",
      group: c.sort === "type" || !!c.group_by_type,
      node: !!c.group_by_node,
      first: c.type_order === "lxc_first" ? "lxc" : "vm",
    });
  }
  _ring(label, v, thr, sz) {
    const { tip, title, text } = this._sizeInfo(sz);
    const r = 43, circ = 2 * Math.PI * r, off = circ * (1 - (v ?? 0) / 100), id = `g${this._rid = (this._rid || 0) + 1}`;
    return `<div class="ring ${v === null ? "none" : level(v, thr)}"${title}><div class="rg"><svg viewBox="0 0 100 100"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb,var(--c) 55%,#fff)"/><stop offset="1" style="stop-color:var(--c)"/></linearGradient></defs><circle class="rf" cx="50" cy="50" r="${r - 4}"/><circle class="rt" cx="50" cy="50" r="${r}"/><circle class="rv" cx="50" cy="50" r="${r}" style="stroke:url(#${id})" stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 50 50)"/></svg><b>${v === null ? "–" : Math.round(v)}${v === null ? "" : "<small>%</small>"}</b></div><span>${label}${text ? `<em>${esc(text)}</em>` : ""}</span></div>`;
  }
  /** Guest gauge; `host` = share of the node used by the guest (%), shown after the size. */
  _mini(label, v, thr, sz, host = null) {
    const { tip, text } = this._sizeInfo(sz);
    const hs = host === null ? "" : `${host < 10 ? host.toFixed(1) : Math.round(host)} % ${this._t("ofHost")}`;
    const tt = [tip, hs].filter(Boolean).join(" · ");
    // size and host share each on their own line: together they did not fit in a gauge column
    const lines = [text, hs].filter(Boolean).map((x) => `<small class="gs">${esc(x)}</small>`).join("");
    return `<div class="gm"${tt ? ` title="${esc(tt)}"` : ""}><div class="gl"><span>${label}</span><b>${v === null ? "–" : Math.round(v) + "%"}</b></div><div class="bar"><i class="${level(v, thr)}" style="width:${v ?? 0}%"></i></div>${lines}</div>`;
  }

  _sec(key, title, extra = "") {
    const closed = this._collapsedSet().has(key);
    return `<div class="sec ${closed ? "closed" : ""}" data-toggle="${key}" role="button" tabindex="0" aria-expanded="${!closed}"><span class="stt">${esc(title)}</span>${extra}<ha-icon class="chev" icon="mdi:chevron-down"></ha-icon></div>`;
  }
  /** Collapsed sections: `collapsed` option as default, then what the user toggled (remembered per browser). */
  _collapsedSet() {
    if (!this._coll) {
      const set = new Set(Array.isArray(this._cfg.collapsed) ? this._cfg.collapsed : []);
      try { for (const [k, v] of Object.entries(JSON.parse(localStorage.getItem("proxmox-card:" + this._cfg.title) || "{}"))) (v ? set.add(k) : set.delete(k)); } catch (e) { /* storage unavailable */ }
      this._coll = set;
    }
    return this._coll;
  }
  _toggle(key) {
    const set = this._collapsedSet(), closed = !set.has(key);
    if (closed) set.add(key); else set.delete(key);
    try { const k = "proxmox-card:" + this._cfg.title, st = JSON.parse(localStorage.getItem(k) || "{}"); st[key] = closed; localStorage.setItem(k, JSON.stringify(st)); } catch (e) { /* ignore */ }
    this._last = ""; this._render();
  }
  /** Tooltip attribute and optional visible text for a { used, total } size. */
  _sizeInfo(sz) {
    const tip = sz ? fmtUsedTotal(sz.used, sz.total) : "";
    return { tip, title: tip ? ` title="${esc(tip)}"` : "", text: tip && this._cfg.show_sizes ? tip : "" };
  }
  _bytes(ent) {
    const st = ent && this._hass.states[ent.entity_id], v = num(st?.state), f = unitFactor(st);
    return v === null || f === null ? null : v * f;
  }
  /** Used / free / total in bytes for kind "mem" or "disk"; whatever is missing is deduced from the other values. */
  _sizes(item, kind) {
    const r = item.roles, get = (k) => this._bytes(r[`${kind}_${k}`]);
    let used = get("used"), free = get("free"), total = get("total");
    const pct = num(this._state(r[`${kind}_pct`]));
    if (total === null && used !== null && free !== null) total = used + free;
    if (used === null && total !== null && free !== null) used = total - free;
    if (used === null && total !== null && pct !== null) used = (total * pct) / 100;
    if (free === null && total !== null && used !== null) free = total - used;
    return total && used !== null ? { used, free, total } : null;
  }
  /** Proxmox exposes network in / out as cumulative byte counters: read one as bytes with its timestamp. */
  _netBytes(ent) {
    const b = this._bytes(ent), t = b === null ? NaN : Date.parse(this._hass.states[ent.entity_id].last_updated);
    return Number.isFinite(t) ? { b, t } : null;
  }
  _netRate(ent) {
    const cur = this._netBytes(ent);
    if (!cur) return null;
    const id = ent.entity_id;
    return (this._net[id] = nextNet(this._net[id], cur, Date.now())).rate;
  }
  _netHtml(g) {
    const c = this._cfg;
    if (!c.show_network || (!g.roles.net_in && !g.roles.net_out)) return "";
    const item = (icon, title, ent) => {
      if (!ent) return "";
      this._netWant.push(ent.entity_id);
      let text = "–";
      if (c.network_mode === "total") { const cur = this._netBytes(ent); if (cur) text = fmtScaled(cur.b, SIZES); }
      else { const r = this._netRate(ent); if (r !== null) text = c.network_unit === "bits" ? fmtScaled(r * 8, RATE_BITS) : fmtScaled(r, RATE_BYTES); }
      return `<span title="${esc(title)}"><ha-icon icon="${icon}"></ha-icon>${esc(text)}</span>`;
    };
    return `<div class="gnet">${item("mdi:download-network-outline", this._t("netIn"), g.roles.net_in)}${item("mdi:upload-network-outline", this._t("netOut"), g.roles.net_out)}</div>`;
  }
  /** On load, read the last samples from the recorder so the rate shows immediately instead of after the next poll. */
  async _seedNet() {
    const c = this._cfg, h = this._hass;
    this._netSeed ||= {};
    const ids = [...new Set(this._netWant || [])].filter((id) => !this._netSeed[id]);
    if (!c?.show_network || c.network_mode !== "rate" || !ids.length || !h?.callWS || this._netBusy) return;
    this._netBusy = true;
    ids.forEach((id) => { this._netSeed[id] = true; });
    let ok = false;
    try {
      const end = new Date(), start = new Date(end - 20 * 60e3);
      const res = await h.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: true, no_attributes: true });
      for (const id of ids) {
        const f = unitFactor(h.states[id]);
        if (f === null) continue;
        const pts = (res?.[id] || []).map((e) => ({ t: (e.lu ?? Date.parse(e.last_updated) / 1000) * 1000, b: Number(e.s ?? e.state) * f })).filter((e) => Number.isFinite(e.t) && Number.isFinite(e.b));
        const rec = this._net[id];
        if (rec && !pts.some((p) => Math.abs(p.t - rec.t) < 1000)) pts.push({ t: rec.t, b: rec.b });
        pts.sort((a, b) => a.t - b.t);
        if (pts.length >= 2) {
          const a = pts[pts.length - 2], b = pts[pts.length - 1], r = (b.b - a.b) / ((b.t - a.t) / 1000);
          this._net[id] = { b: b.b, t: b.t, dt: (b.t - a.t) / 1000, rate: Number.isFinite(r) && r >= 0 ? r : null };
        }
      }
      ok = true;
    } catch (e) { ids.forEach((id) => { delete this._netSeed[id]; }); } // retried on a later render; without a recorder the rate appears after two polls
    this._netBusy = false;
    if (ok) { this._last = ""; this._render(); }
  }
  /** Guests no backup job covers ("Guests without backup" sensor of the cluster), with `include` / `exclude` applied. */
  _noBackup(data) {
    const ent = data.cluster?.roles.no_backup, st = ent && this._hass.states[ent.entity_id];
    const list = Array.isArray(st?.attributes?.guests) ? st.attributes.guests.filter((g) => g && g.vmid !== undefined) : null;
    if (!list) return { count: num(st?.state) || 0, names: [], ids: new Set() };
    const keep = guestFilter(this._cfg), shown = list.filter(keep);
    return { count: shown.length, names: shown.map((g) => `#${g.vmid}${g.name ? ` ${g.name}` : ""}`), ids: new Set(shown.map((g) => String(g.vmid))) };
  }
  /** Failing replication jobs of a node ("Replication failing" attribute). */
  _replJobs(n) {
    const st = n.roles.repl_failing && this._hass.states[n.roles.repl_failing.entity_id];
    const jobs = st?.state === "on" ? st.attributes?.failing_jobs : null;
    return Array.isArray(jobs) ? jobs.filter((j) => j && typeof j === "object") : [];
  }
  /** "⋯" menu of a guest or a node: a row of labeled buttons, shown below the tile while open. */
  _menuBtn(key) {
    const open = this._menu === key;
    return `<button class="act ${open ? "on" : ""}" data-menu="${esc(key)}" title="${esc(this._t("more"))}" aria-label="${esc(this._t("more"))}" aria-expanded="${open}"><ha-icon icon="mdi:dots-horizontal"></ha-icon></button>`;
  }
  _menuRow(items) {
    return `<div class="menu">${items.map(([ent, ic, label, danger]) => {
      const armed = this._armed === ent.entity_id;
      return `<button class="mbtn ${armed ? "armed" : ""}" data-press="${esc(ent.entity_id)}" data-danger="${danger ? 1 : 0}"><ha-icon icon="${ic}"></ha-icon>${esc(armed ? this._t("confirm") + label : label)}</button>`;
    }).join("")}</div>`;
  }
  /** Days before a storage is full at the pace of the last 7 days (linear fit on the recorder history); null = not filling up. */
  _forecast(ent, v) {
    if (!this._cfg.show_forecast || !ent || v === null) return null;
    this._fcWant.push(ent.entity_id);
    const slope = this._fc[ent.entity_id]; // % per day
    if (!(slope > 0.01)) return null;
    const d = (100 - v) / slope;
    return d <= 365 ? Math.max(0, Math.round(d)) : null;
  }
  _fcLine(d, T) {
    if (d === null) return "";
    const cl = d <= T.forecast.critical ? "crit" : d <= T.forecast.warning ? "warn" : "";
    return `<div class="ssz fc ${cl}"><ha-icon icon="mdi:chart-timeline-variant-shimmer"></ha-icon>${esc(this._t("fullIn").replace("{d}", d))}</div>`;
  }
  async _loadForecast(force = false) {
    const h = this._hass, ids = [...new Set(this._fcWant || [])];
    if (!this._cfg?.show_forecast || !h?.callWS || !ids.length || this._fcBusy) return;
    const key = ids.join();
    if (!force && key === this._fcKey && Date.now() - (this._fcAt || 0) < 3600e3) return;
    this._fcBusy = true;
    try {
      const end = Date.now(), start = end - 7 * 864e5;
      const res = await h.callWS({ type: "history/history_during_period", start_time: new Date(start).toISOString(), end_time: new Date(end).toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: true, no_attributes: true });
      const out = {};
      for (const id of ids) {
        // hourly means, then a least-squares line: its slope is the fill rate in % per day
        const bins = new Map();
        for (const e of res?.[id] || []) {
          const t = (e.lu ?? Date.parse(e.last_updated) / 1000) * 1000, v = Number(e.s ?? e.state);
          if (!Number.isFinite(t) || !Number.isFinite(v)) continue;
          const k = Math.floor(Math.max(t, start) / 3600e3), b = bins.get(k) || [0, 0];
          bins.set(k, [b[0] + v, b[1] + 1]);
        }
        const pts = [...bins].map(([k, [sum, n]]) => [k / 24, sum / n]);
        if (pts.length < 6 || pts[pts.length - 1][0] - pts[0][0] < 1) continue; // at least a day of data
        const n = pts.length, mx = pts.reduce((a, q) => a + q[0], 0) / n, my = pts.reduce((a, q) => a + q[1], 0) / n;
        const sxx = pts.reduce((a, q) => a + (q[0] - mx) ** 2, 0), sxy = pts.reduce((a, q) => a + (q[0] - mx) * (q[1] - my), 0);
        if (sxx > 0) out[id] = sxy / sxx;
      }
      this._fc = out;
    } catch (e) { this._fc = {}; }
    this._fcKey = key; this._fcAt = Date.now(); this._fcBusy = false;
    this._last = ""; this._render();
  }
  /** ZFS pool tile (Storage section): health and usage. */
  _zfsTile(p, multi, T) {
    const r = p.roles, hs = this._state(r.zfs_health) || "", bad = hs && !ZFS_OK.test(hs);
    const v = this._pct(p, "disk"), sz = this._sizes(p, "disk"), fc = bad ? null : this._forecast(r.disk_pct, v);
    return `<div class="stor ${bad ? "off" : ""}" title="${esc(sz ? fmtUsedTotal(sz.used, sz.total) : "")}" data-more="${esc((r.zfs_health || r.disk_pct).entity_id)}">
      <div class="sh"><span class="dot ${/^online$/i.test(hs) ? "on" : bad ? "off" : ""}"></span><span title="${esc(p.name)}">${esc(p.name)}</span><b>${v === null ? "–" : Math.round(v) + "%"}</b></div>
      <div class="bar"><i class="${level(v, T.disk)}" style="width:${v ?? 0}%"></i></div>
      <div class="ssz kind"><span class="tag">ZFS</span>${multi ? esc(p.host) : ""}</div>
      ${bad ? `<div class="ssz crit">${esc(hs)}</div>` : this._cfg.show_sizes && sz && sz.free !== null ? `<div class="ssz">${esc(fmtScaled(sz.free, SIZES))} ${esc(this._t("free"))} / ${esc(fmtScaled(sz.total, SIZES))}</div>` : ""}${this._fcLine(fc, T)}</div>`;
  }
  /** Ceph tile (Storage section), from the cluster device. */
  _cephTile(cl, T) {
    const r = cl.roles, hs = this._state(r.ceph_health), v = this._pct(cl, "ceph"), sz = this._sizes(cl, "ceph"), fc = this._forecast(r.ceph_pct, v);
    const dot = hs === "ok" ? "on" : hs === "error" ? "off" : hs === "warning" ? "warn" : "";
    return `<div class="stor ${hs === "error" ? "off" : ""}" title="${esc(sz ? fmtUsedTotal(sz.used, sz.total) : "")}" data-more="${esc((r.ceph_health || r.ceph_pct).entity_id)}">
      <div class="sh"><span class="dot ${dot}"></span><span>Ceph</span><b>${v === null ? "–" : Math.round(v) + "%"}</b></div>
      <div class="bar"><i class="${level(v, T.disk)}" style="width:${v ?? 0}%"></i></div>
      <div class="ssz kind"><span class="tag">${esc(this._t("cluster"))}</span></div>
      ${hs === "warning" || hs === "error" ? `<div class="ssz ${hs === "error" ? "crit" : "warn"}">${esc(this._t(hs === "error" ? "cephErr" : "cephWarn"))}</div>` : this._cfg.show_sizes && sz && sz.free !== null ? `<div class="ssz">${esc(fmtScaled(sz.free, SIZES))} ${esc(this._t("free"))} / ${esc(fmtScaled(sz.total, SIZES))}</div>` : ""}${this._fcLine(fc, T)}</div>`;
  }
  _clusterTile(data, nOn, T) {
    const cl = data.cluster, r = cl.roles;
    const quorum = this._state(r.quorate) === "off" ? `<span class="chip crit">${esc(this._t("quorumLost"))}</span>` : "";
    // HA fencing state, and Arm / Disarm in the "⋯" menu (buttons disabled by default in the integration)
    const armed = this._state(r.ha_armed);
    const ha = !armed || /^unk|^unav/.test(armed) ? "" : armed === "armed" ? `<span class="chip" data-more="${esc(r.ha_armed.entity_id)}">HA</span>`
      : `<span class="chip info" data-more="${esc(r.ha_armed.entity_id)}">${esc(this._t(armed === "disarmed" ? "haDisarmed" : armed === "disarming" ? "haDisarming" : "haStandby"))}</span>`;
    const menu = this._cfg.show_actions ? [
      r.btn_disarm_ha && armed !== "disarmed" && armed !== "disarming" && [r.btn_disarm_ha, "mdi:shield-off-outline", this._t("disarmHa"), 1],
      r.btn_arm_ha && armed !== "armed" && [r.btn_arm_ha, "mdi:shield-check-outline", this._t("armHa"), 1],
    ].filter(Boolean) : [];
    return `<div class="node cluster"><div class="nhead"><ha-icon icon="mdi:server-network"></ha-icon><span class="nname">${esc(this._t("cluster"))}</span>${quorum}${ha}<span class="chip ${nOn < data.nodes.length ? "warn" : ""}">${nOn}/${data.nodes.length} ${esc(this._t("online"))}</span>${menu.length ? this._menuBtn("cluster") : ""}</div>
      ${menu.length && this._menu === "cluster" ? this._menuRow(menu) : ""}
      ${this._metric(this._t("cpu"), this._pct(cl, "cpu"), T.cpu)}${this._metric(this._t("ram"), this._pct(cl, "mem"), T.memory)}</div>`;
  }
  /** CPU / RAM history curves of a node (data comes from the recorder, see _loadHistory). */
  _hist(n, T) {
    if (this._histFailed) return "";
    const r = n.roles;
    const items = [["cpu", r.cpu, T.cpu, this._t("cpu")], ["mem", r.mem_pct, T.memory, this._t("ram")]].filter((x) => x[1]);
    if (!items.length) return "";
    const hrs = Number(this._cfg.history_hours) || 24;
    return `<div class="hist">` + items.map(([k, ent, thr, label]) => {
      this._histWant.push(ent.entity_id);
      const pts = this._history[ent.entity_id];
      const { line, area } = pts ? sparkPaths(pts) : { line: "", area: "" };
      return `<div class="sp ${pts ? level(this._pct(n, k), thr) : "none skel"}"><div class="sl"><span>${esc(label)} · ${hrs} h</span></div><svg viewBox="0 0 120 36" preserveAspectRatio="none"><path class="sa" d="${area}"/><path class="sk" d="${line}"/></svg></div>`;
    }).join("") + `</div>`;
  }
  async _loadHistory(force = false) {
    const c = this._cfg, h = this._hass, ids = [...new Set(this._histWant || [])];
    if (!c?.show_history || !h?.callWS || !ids.length || this._histBusy) return;
    const key = ids.join() + "|" + c.history_hours;
    if (!force && key === this._histKey && Date.now() - (this._histAt || 0) < 300000) return;
    this._histBusy = true;
    try {
      const hours = Number(c.history_hours) || 24, end = new Date(), start = new Date(end - hours * 3600e3);
      const res = await h.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: true, no_attributes: true });
      const N = 48, t0 = start.getTime(), step = (end.getTime() - t0) / N, out = {};
      for (const id of ids) {
        const ev = (res?.[id] || []).map((e) => ({ t: (e.lu ?? Date.parse(e.last_updated) / 1000) * 1000, v: Number(e.s ?? e.state) })).filter((e) => Number.isFinite(e.v) && Number.isFinite(e.t)).sort((a, b) => a.t - b.t);
        if (!ev.length) continue;
        const pts = []; let j = 0, last = null;
        for (let i = 0; i < N; i++) { // mean of the samples of each time bucket, previous value when the bucket is empty
          const te = t0 + (i + 1) * step; let sum = 0, cnt = 0;
          while (j < ev.length && ev[j].t <= te) { sum += ev[j].v; cnt++; last = ev[j].v; j++; }
          pts.push(cnt ? sum / cnt : last);
        }
        out[id] = pts;
      }
      this._history = out; this._histFailed = !Object.keys(out).length;
    } catch (e) { this._histFailed = true; }
    this._histKey = key; this._histAt = Date.now(); this._histBusy = false;
    this._last = ""; this._render();
  }

  _render() {
    if (!this._cfg || !this._hass) return;
    this._rid = 0;
    this._histWant = [];
    this._fcWant = []; this._fc ||= {};
    this._netWant = []; // deterministic SVG ids: identical data must give identical HTML, or the DOM is rebuilt on every HA state change
    const c = this._cfg, T = c.thresholds;
    const data = this._collect();
    let html;
    if (!data) html = `<div class="empty">${esc(this._t("noRegistry"))}</div>`;
    else if (!data.nodes.length && !data.qemu.length && !data.lxc.length) html = `<div class="empty">${esc(this._t("noData"))}</div>`;
    else {
      const nOn = data.nodes.filter((n) => statusOf(n.roles.status, this._hass) === "on").length;
      const guests = [...(c.show_qemu ? data.qemu : []), ...(c.show_lxc ? data.lxc : [])];
      const vmOn = data.qemu.filter((g) => statusOf(g.roles.status, this._hass) === "on").length;
      const ctOn = data.lxc.filter((g) => statusOf(g.roles.status, this._hass) === "on").length;
      const nodeCls = data.nodes.length && nOn < data.nodes.length ? (nOn ? "warn" : "crit") : "";
      html = c._single ? "" : `<div class="hdr"><div class="badge"><ha-icon icon="${ICON.proxmox}"></ha-icon></div>
        <div class="title">${esc(c.title)}</div>
        <div class="chips">
          ${data.nodes.length ? `<span class="chip ${nodeCls}">${nOn}/${data.nodes.length} ${esc(this._t("online"))}</span>` : ""}
          ${data.qemu.length ? `<span class="chip">${vmOn}/${data.qemu.length} ${esc(this._t("vms"))}</span>` : ""}
          ${data.lxc.length ? `<span class="chip">${ctOn}/${data.lxc.length} ${esc(this._t("cts"))}</span>` : ""}
        </div></div>`;

      const isOn = (e) => this._state(e) === "on";
      const noBackup = this._noBackup(data);
      const replFail = new Map(data.nodes.flatMap((n) => this._replJobs(n)).filter((j) => j.guest !== undefined).map((j) => [String(j.guest), j]));
      if (c.show_alerts && !c._single) {
        const al = [];
        // "Update available" binary sensor, or the node's update entity when that sensor is disabled
        const upd = data.nodes.reduce((a, n) => a + ((n.roles.update_avail ? isOn(n.roles.update_avail) : isOn(n.roles.pve_update)) ? num(this._state(n.roles.updates_total)) || 1 : 0), 0);
        if (upd) al.push(["warn", `${this._tn("updates", upd)}`]);
        if (data.nodes.some((n) => isOn(n.roles.backup_running))) al.push(["info", this._t("backup")]);
        if (c.show_backup && data.nodes.some((n) => isOn(n.roles.backup_status))) al.push(["crit", this._t("backupFailed")]);
        if (data.cluster && this._state(data.cluster.roles.quorate) === "off") al.push(["crit", this._t("quorumLost")]);
        const failed = data.nodes.reduce((a, n) => a + (num(this._state(n.roles.failed)) || 0), 0);
        if (failed) al.push(["crit", `${this._tn("failed", failed)}`]);
        const inactive = data.storage.filter((s) => this._state(s.roles.active) === "off").length;
        if (inactive) al.push(["crit", `${this._tn("inactive", inactive)}`]);
        const dprob = data.disks.filter((d) => isOn(d.roles.health)).length;
        if (dprob) al.push(["crit", `${this._tn("diskProblem", dprob)}`]);
        const full = data.storage.filter((x) => this._state(x.roles.active) !== "off" && this._state(x.roles.enabled) !== "off" && (this._pct(x, "disk") ?? 0) >= T.disk.critical).length;
        if (full) al.push(["crit", `${this._tn("storageFull", full)}`]);
        // storages that will be full soon at their current pace (forecast)
        if (c.show_forecast) {
          const fcs = [
            ...data.storage.filter((x) => this._state(x.roles.active) !== "off" && this._state(x.roles.enabled) !== "off").map((x) => [x.name, x.roles.disk_pct, this._pct(x, "disk")]),
            ...data.zfs.map((x) => [x.name, x.roles.disk_pct, this._pct(x, "disk")]),
            ...(data.cluster?.roles.ceph_pct ? [["Ceph", data.cluster.roles.ceph_pct, this._pct(data.cluster, "ceph")]] : []),
          ].map(([name, ent, v]) => [name, ent, this._forecast(ent, v)]).filter(([, , d]) => d !== null && d <= T.forecast.warning);
          for (const [name, ent, d] of fcs) al.push([d <= T.forecast.critical ? "crit" : "warn", `${name} · ${this._t("fullIn").replace("{d}", d)}`, "", ent]);
        }
        // [class, text, tooltip, entity opened on click]
        const zbad = data.zfs.filter((p) => { const s = this._state(p.roles.zfs_health); return s && !ZFS_OK.test(s); });
        if (zbad.length) al.push(["crit", `${this._tn("zfsProblem", zbad.length)}`, zbad.map((p) => `${p.name} (${p.host}) : ${this._state(p.roles.zfs_health)}`).join("\n"), zbad[0].roles.zfs_health]);
        const cr = data.cluster?.roles || {}, ceph = this._state(cr.ceph_health);
        if (ceph === "warning" || ceph === "error") al.push([ceph === "error" ? "crit" : "warn", this._t(ceph === "error" ? "cephErr" : "cephWarn"), "", cr.ceph_health]);
        if (c.show_backup && noBackup.count) al.push(["warn", `${this._tn("noBackup", noBackup.count)}`, noBackup.names.join("\n"), cr.no_backup]);
        for (const n of data.nodes) {
          const pre = data.nodes.length > 1 ? `${n.name} · ` : "";
          const exp = Date.parse(this._state(n.roles.cert_expires) || "");
          if (Number.isFinite(exp)) {
            const d = Math.floor((exp - Date.now()) / 864e5), tip = fmtDate(this._state(n.roles.cert_expires), this._lang());
            if (d < 0) al.push(["crit", pre + this._t("certExpired"), tip, n.roles.cert_expires]);
            else if (d <= T.certificate.warning) al.push([d <= T.certificate.critical ? "crit" : "warn", pre + this._t("certSoon").replace("{d}", d), tip, n.roles.cert_expires]);
          }
          const sub = this._state(n.roles.subscription);
          if (SUB_BAD.includes(sub)) al.push(["crit", pre + this._t("subProblem"), sub, n.roles.subscription]);
          if (isOn(n.roles.repl_failing)) {
            const jobs = this._replJobs(n);
            al.push(["crit", pre + this._t("replFailing"), jobs.map((j) => `${j.id}${j.target ? ` → ${j.target}` : ""}${j.error ? ` : ${j.error}` : ""}`).join("\n"), n.roles.repl_failing]);
          }
        }
        // HA stack of the cluster (optional cluster credentials of the integration)
        const haErr = num(this._state(cr.ha_errors));
        if (haErr) {
          const list = this._hass.states[cr.ha_errors.entity_id]?.attributes?.ha_resources_error_list;
          al.push(["crit", `${this._tn("haErrors", haErr)}`, Array.isArray(list) ? list.map((x) => (typeof x === "object" ? x.sid || x.id || JSON.stringify(x) : x)).join("\n") : "", cr.ha_errors]);
        }
        if (isOn(cr.crm_stale)) al.push(["crit", this._t("crmStale"), "", cr.crm_stale]);
        const armed = this._state(cr.ha_armed);
        if (armed === "disarmed" || armed === "disarming") al.push(["info", this._t(armed === "disarmed" ? "haDisarmed" : "haDisarming"), "", cr.ha_armed]);
        if (al.length) html += `<div class="alerts">${al.map(([cl, tx, tip, ent]) => `<span class="chip ${cl}"${tip ? ` title="${esc(tip)}"` : ""}${ent ? ` data-more="${esc(ent.entity_id)}"` : ""}>${esc(tx)}</span>`).join("")}</div>`;
      }

      const secs = {}; // built separately, then laid out in the `section_order` order
      if (c.show_nodes && data.nodes.length) {
        const showCluster = c.show_cluster && data.cluster && data.nodes.length > 1;
        secs.nodes = this._sec("nodes", this._t("nodes")) + (this._collapsedSet().has("nodes") ? "" : (showCluster ? this._clusterTile(data, nOn, T) : "") + `<div class="nodes">` + data.nodes.map((n) => {
          const s = statusOf(n.roles.status, this._hass);
          const up = fmtUptime(this._state(n.roles.uptime));
          // node actions ("⋯" menu): Wake-on-LAN while it is off, the others while it runs
          const nMenu = c.show_actions ? NODE_MENU.filter(([r]) => n.roles[r] && (r === "btn_wol" ? s !== "on" : s === "on")).map(([r, ic, k, d]) => [n.roles[r], ic, this._t(k), d]) : [];
          const nKey = "n:" + n.devId;
          return `<div class="node ${s === "off" ? "off" : ""}" data-more="${esc((n.roles.status || n.roles.cpu).entity_id)}">
            <div class="nhead"><span class="dot ${s === "on" ? "on" : s === "off" ? "off" : ""}"></span><span class="nname">${esc(n.name)}</span>${this._ver(n)}${up ?`<span class="up">${esc(up)}</span>` : ""}${nMenu.length ? this._menuBtn(nKey) : ""}</div>
            ${nMenu.length && this._menu === nKey ? this._menuRow(nMenu) : ""}
            ${c.compact ? this._metric(this._t("cpu"), this._pct(n, "cpu"), T.cpu) + this._metric(this._t("ram"), this._pct(n, "mem"), T.memory) + this._metric(this._t("disk"), this._pct(n, "disk"), T.disk)
              : `<div class="rings">${this._ring(this._t("cpu"), this._pct(n, "cpu"), T.cpu)}${this._ring(this._t("ram"), this._pct(n, "mem"), T.memory, this._sizes(n, "mem"))}${this._ring(this._t("disk"), this._pct(n, "disk"), T.disk, this._sizes(n, "disk"))}</div>`}
            ${c.show_history && !c.compact ? this._hist(n, T) : ""}
            ${c.show_swap && n.roles.swap_pct ? this._metric(this._t("swap"), this._pct(n, "swap"), T.memory) : ""}
            ${this._xtra(n)}</div>`;
        }).join("") + `</div>`);
      }

      let shown = guests.filter((g) => c.show_stopped || statusOf(g.roles.status, this._hass) === "on");
      // a guest "has a problem" when something about it is orange or red on the card (stopped on purpose is not one)
      const problem = (g) => {
        const s = statusOf(g.roles.status, this._hass), on = s === "on";
        if (s === "other" || isOn(g.roles.locked) || isOn(g.roles.health) || replFail.has(g.vmid) || (c.show_backup && noBackup.ids.has(g.vmid))) return true;
        if (!on) return false;
        if (g.roles.agent && this._state(g.roles.agent) === "off") return true;
        if (["p_cpu", "p_io", "p_mem"].some((k) => (num(this._state(g.roles[k])) ?? 0) >= T.pressure.warning)) return true;
        return level(this._pct(g, "cpu"), T.cpu) === "crit" || level(this._pct(g, "mem"), T.memory) === "crit" || level(this._pct(g, "disk"), T.disk) === "crit";
      };
      const nProb = shown.filter(problem).length, total = shown.length;
      const q = (this._search || "").trim().toLowerCase();
      if (q) shown = shown.filter((g) => g.vmid === q || g.name.toLowerCase().includes(q) || String(c.guests?.[g.vmid]?.name || "").toLowerCase().includes(q));
      if (this._probOnly) shown = shown.filter(problem);
      // per-guest overrides (`guests:` option, keyed by ID or name): custom label and icon
      const overrides = c.guests && typeof c.guests === "object" ? c.guests : {};
      for (const g of shown) {
        const o = overrides[g.vmid] || overrides[g.name] || Object.entries(overrides).find(([k]) => k.toLowerCase() === g.name.toLowerCase())?.[1] || {};
        g.label = o.name || g.name;
        g.icon = o.icon || (g.kind === "lxc" ? ICON.ct : ICON.vm);
      }
      const st = this._sortState(), dir = st.dir === "desc" ? -1 : 1;
      const idn = (g) => Number(g.vmid) || 0, byName = (a, b) => a.label.localeCompare(b.label, undefined, { numeric: true });
      const rank = (g) => (statusOf(g.roles.status, this._hass) === "on" ? 0 : 1);
      // usage of a running guest (null when stopped): CPU / RAM sorts put the heaviest first, stopped guests always last
      const use = (g, k) => (rank(g) ? null : this._pct(g, k));
      const byUse = (k) => (a, b) => (use(b, k) ?? 0) - (use(a, k) ?? 0) || idn(a) - idn(b);
      const cmp = {
        id: (a, b) => idn(a) - idn(b) || byName(a, b),
        name: (a, b) => byName(a, b) || idn(a) - idn(b),
        status: (a, b) => rank(a) - rank(b) || idn(a) - idn(b),
        cpu: byUse("cpu"), mem: byUse("mem"),
      }[st.by];
      const usage = st.by === "cpu" || st.by === "mem";
      const last = (a, b) => (usage ? (use(a, st.by) === null) - (use(b, st.by) === null) : 0);
      // optional grouping by node (clusters), then VM / LXC (order set by `type_order`), then the chosen criterion inside each group
      const multiNode = data.nodes.length > 1, byNode = st.node && multiNode;
      const grpNode = (a, b) => (!byNode || a.node === b.node ? 0 : !a.node ? 1 : !b.node ? -1 : a.node.localeCompare(b.node, undefined, { numeric: true }));
      const grp = (a, b) => (!st.group || a.kind === b.kind ? 0 : (a.kind === "qemu") === (st.first === "vm") ? -1 : 1);
      shown.sort((a, b) => grpNode(a, b) || grp(a, b) || last(a, b) || dir * cmp(a, b));
      const bar = !c._single && c.show_filter_bar && (total >= 6 || q || this._probOnly);
      if (shown.length || bar) {
        const btn = (k, on, label, arrow) => `<button class="sortbtn ${on ? "on" : ""}" data-sort="${k}">${esc(label)}${arrow}</button>`;
        const sortLabel = { id: this._t("sortId"), name: this._t("sortName"), status: this._t("sortStatus"), cpu: this._t("cpu"), mem: this._t("ram") };
        const sortbar = c.show_sort && shown.length > 1 ? `<span class="sortbar">${btn("type", st.group, this._t("sortType"), "")}${multiNode ? btn("node", st.node, this._t("node"), "") : ""}${SORTS.map((k) => btn(k, st.by === k, sortLabel[k], st.by === k ? (st.dir === "desc" ? " ↑" : " ↓") : "")).join("")}</span>` : "";
        let prevNode = null;
        const tools = bar ? `<div class="gtools"><input type="search" class="gsearch" placeholder="${esc(this._t("search"))}" aria-label="${esc(this._t("search"))}" value="${esc(this._search || "")}"><button class="sortbtn ${this._probOnly ? "on" : ""}" data-prob aria-pressed="${!!this._probOnly}"><ha-icon icon="mdi:alert-outline"></ha-icon>${esc(this._t("problems"))} (${nProb})</button></div>` : "";
        const list = shown.length ? "" : `<div class="empty">${esc(this._t("noMatch"))}</div>`;
        secs.guests = (c._single ? "" : this._sec("guests", this._t("guests"), sortbar)) + (!c._single && this._collapsedSet().has("guests") ? "" : tools + list + `<div class="guests cols-${esc(c.guest_columns)}">` + shown.map((g) => {
          const head = byNode && g.node !== prevNode ? `<div class="ghead"><ha-icon icon="mdi:server"></ha-icon>${esc(g.node || "–")}</div>` : "";
          prevNode = g.node;
          const s = statusOf(g.roles.status, this._hass);
          const on = s === "on";
          const ip = c.show_ip ? this._state(g.roles.ip) : "";
          const up = c.show_uptime && on ? fmtUptime(this._state(g.roles.uptime)) : "";
          const sub = [g.vmid && `#${g.vmid}`, g.kind === "lxc" ? "LXC" : "VM", multiNode && !byNode && g.node, ip && !/^unk|^unav/.test(ip) ? ip : "", up && `↑ ${up}`].filter(Boolean).join(" · ");
          const bd = [];
          if (c.show_badges) {
            if (isOn(g.roles.locked)) bd.push(["mdi:lock", this._t("locked"), ""]);
            if (on && g.roles.agent && this._state(g.roles.agent) === "off") bd.push(["mdi:lan-disconnect", this._t("agentDown"), ""]);
            if (isOn(g.roles.health)) bd.push(["mdi:alert-circle", this._t("problem"), "crit"]);
            if (isOn(g.roles.ha_managed)) bd.push(["mdi:shield-check-outline", this._t("haManaged"), "info"]);
            if (c.show_backup && noBackup.ids.has(g.vmid)) bd.push(["mdi:backup-restore", this._t("noBackupGuest"), ""]);
            const rj = replFail.get(g.vmid);
            if (rj) bd.push(["mdi:folder-sync-outline", `${this._t("replFailing")}${rj.error ? ` : ${rj.error}` : ""}`, "crit"]);
          }
          if (c.show_pressure && on) { // PSI "some": share of time tasks were stalled waiting for CPU / IO / memory
            const worst = [["p_cpu", this._t("cpu")], ["p_io", "I/O"], ["p_mem", this._t("ram")]].map(([r, l]) => [num(this._state(g.roles[r])), l]).filter(([v]) => v !== null).sort((a, b) => b[0] - a[0])[0];
            if (worst && worst[0] >= T.pressure.warning) bd.push(["mdi:gauge-full", `${worst[1]} ${this._t("pressure")} ${Math.round(worst[0])}%`, worst[0] >= T.pressure.critical ? "crit" : ""]);
          }
          const nSnap = c.show_snapshots ? num(this._state(g.roles.snapshots)) : null;
          const snap = nSnap ? `<span class="snap" title="${esc(this._tn("snapshots", nSnap))}"><ha-icon icon="mdi:camera-outline"></ha-icon>${nSnap}</span>` : "";
          const badges = bd.map(([ic, tt, cl]) => `<span class="bd ${cl}" title="${esc(tt)}"><ha-icon icon="${ic}"></ha-icon></span>`).join("");
          const acts = c.show_actions ? [
            !on && g.roles.btn_start && ["btn_start", ICON.power, this._t("start")],
            on && g.roles.btn_shutdown && ["btn_shutdown", ICON.power, this._t("shutdown")],
            on && g.roles.btn_reboot && ["btn_reboot", ICON.restart, this._t("reboot")],
            on && g.roles.btn_stop && !g.roles.btn_shutdown && ["btn_stop", ICON.stop, this._t("stop")],
            c.show_snapshots && g.roles.btn_snapshot && ["btn_snapshot", "mdi:camera-plus-outline", this._t("snapshot")],
          ].filter(Boolean).map(([r, ic, label]) => {
            const id = g.roles[r].entity_id;
            const armed = this._armed === id;
            return `<button class="act ${armed ? "armed" : ""}" data-press="${esc(id)}" data-danger="${r === "btn_start" ? 0 : 1}" title="${esc(armed ? this._t("confirm") + label : label)}" aria-label="${esc(armed ? this._t("confirm") + label : label)}"><ha-icon icon="${ic}"></ha-icon></button>`;
          }).join("") : "";
          // secondary actions, in the "⋯" menu: only those that make sense in the current state
          const can = { btn_resume: s === "other", btn_suspend: on, btn_hibernate: on && g.kind === "qemu", btn_reset: on, btn_backup: true, btn_unlock: isOn(g.roles.locked) };
          const menu = c.show_actions ? GUEST_MENU.filter(([r]) => g.roles[r] && can[r]).map(([r, ic, k, d]) => [g.roles[r], ic, this._t(k), d]) : [];
          const mKey = "g:" + g.devId, mOpen = menu.length && this._menu === mKey;
          const host = (r) => (c.show_host_share && on ? num(this._state(g.roles[r])) : null);
          // detail of the guest, unfolded with the chevron next to its name (always unfolded in the single-guest card unless show_details: false)
          const open = c._single ? c.show_details !== false : this._exp?.has(g.devId);
          const expBtn = c._single ? "" : `<button class="exp" data-expand="${esc(g.devId)}" aria-expanded="${!!open}" aria-label="${esc(this._t("details"))}" title="${esc(this._t("details"))}"><ha-icon icon="${open ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon></button>`;
          const detail = open ? `<div class="gx">${c.show_history ? this._hist(g, T) : ""}${bd.length ? `<div class="gxl">${bd.map(([ic, tt, cl]) => `<span class="chip ${cl === "crit" ? "crit" : cl === "info" ? "info" : "warn"}"><ha-icon icon="${ic}"></ha-icon>${esc(tt)}</span>`).join("")}</div>` : ""}</div>` : "";
          return head + `<div class="g ${on ? "" : s === "off" ? "off" : "other"}" data-more="${esc((g.roles.status || g.roles.cpu).entity_id)}">
            <div class="gi"><ha-icon icon="${esc(g.icon)}"></ha-icon><span class="dot ${on ? "on" : s === "off" ? "off" : ""}"></span></div>
            <div class="gn"><div class="gname">${esc(g.label)}${badges}${snap}${expBtn}</div><div class="gsub">${esc(sub)}</div>${on ? this._netHtml(g) : ""}</div>
            <div class="gms">
              ${this._mini(this._t("cpu"), on ? this._pct(g, "cpu") : null, T.cpu, null, host("cpu_host"))}
              ${this._mini(this._t("ram"), on ? this._pct(g, "mem") : null, T.memory, on ? this._sizes(g, "mem") : null, host("mem_host"))}
              ${this._mini(this._t("disk"), on ? this._pct(g, "disk") : null, T.disk, on ? this._sizes(g, "disk") : null)}
            </div>
            <div class="acts">${acts}${menu.length ? this._menuBtn(mKey) : ""}</div>${mOpen ? this._menuRow(menu) : ""}${detail}</div>`;
        }).join("") + `</div>`);
      }

      const cephCl = data.cluster && (data.cluster.roles.ceph_health || data.cluster.roles.ceph_pct) ? data.cluster : null;
      if (c.show_storage && (data.storage.length || data.zfs.length || cephCl)) {
        const zMulti = new Set(data.zfs.map((p) => p.host)).size > 1;
        secs.storage = this._sec("storage", this._t("storage")) + (this._collapsedSet().has("storage") ? "" : `<div class="stors">` + (cephCl ? this._cephTile(cephCl, T) : "") + data.zfs.map((p) => this._zfsTile(p, zMulti, T)).join("") + data.storage.map((s) => {
          const act = this._state(s.roles.active);
          const v = this._pct(s, "disk");
          const multi = new Set(data.storage.map((x) => x.host)).size > 1 && s.host;
          const dis = this._state(s.roles.enabled) === "off", sz = this._sizes(s, "disk"), fc = act === "off" || dis ? null : this._forecast(s.roles.disk_pct, v);
          return `<div class="stor ${act === "off" ? "off" : ""} ${dis ? "dis" : ""}" title="${esc(dis ? this._t("disabled") : sz ? fmtUsedTotal(sz.used, sz.total) : "")}" data-more="${esc((s.roles.disk_pct || s.roles.active).entity_id)}">
            <div class="sh"><span class="dot ${act === "on" ? "on" : act === "off" ? "off" : ""}"></span><span title="${esc(s.host)}">${esc(s.name)}${multi ? ` · ${esc(s.host)}` : ""}</span>${isOn(s.roles.shared) ? `<ha-icon class="shr" icon="mdi:share-variant-outline" title="${esc(this._t("shared"))}"></ha-icon>` : ""}<b>${v === null ? "–" : Math.round(v) + "%"}</b></div>
            <div class="bar"><i class="${level(v, T.disk)}" style="width:${v ?? 0}%"></i></div>
            ${c.show_sizes && sz && sz.free !== null ? `<div class="ssz">${esc(fmtScaled(sz.free, SIZES))} ${esc(this._t("free"))} / ${esc(fmtScaled(sz.total, SIZES))}</div>` : ""}${this._fcLine(fc, T)}</div>`;
        }).join("") + `</div>`);
      }

      if (c.show_disks && data.disks.length) {
        secs.disks = this._sec("disks", this._t("disks")) + (this._collapsedSet().has("disks") ? "" : `<div class="dks cols-${esc(c.guest_columns)}">` + data.disks.map((d) => {
          const r = d.roles;
          const temp = num(this._state(r.temp));
          const life = num(this._state(r.life_left));
          const wear = num(this._state(r.wearout)) ?? (life === null ? null : 100 - life);
          const hours = num(this._state(r.power_hours));
          const cycles = num(this._state(r.power_cycles)), loss = num(this._state(r.power_loss));
          const tip = [d.name, hours !== null && `${Math.round(hours).toLocaleString()} h`, cycles !== null && `${Math.round(cycles).toLocaleString()} ${this._t("cycles")}`, loss !== null && `${Math.round(loss).toLocaleString()} ${this._t("powerLoss")}`].filter(Boolean).join(" · ");
          const prob = isOn(r.health);
          const dot = r.health ? (prob ? "off" : "on") : "";
          const counters = [cycles !== null && `↻ ${Math.round(cycles).toLocaleString()}`, loss !== null && `⚡ ${Math.round(loss).toLocaleString()}`].filter(Boolean).join(" · ");
          return `<div class="dk" data-more="${esc((r.temp || r.health || r.wearout).entity_id)}" title="${esc(tip)}">
            <span class="dot ${dot}"></span><span class="dn">${esc(d.name)}</span>
            <span class="tp ${level(temp, T.temperature)}">${temp === null ? "–" : Math.round(temp) + "°C"}</span>
            <div class="wr"><span>${esc(this._t("wear"))} ${wear === null ? "–" : Math.round(wear) + "%"}</span><div class="bar"><i class="${level(wear, T.wear)}" style="width:${wear ?? 0}%"></i></div></div>
            <span class="hr">${hours === null ? "" : Math.round(hours).toLocaleString() + " h"}${counters ? `<small>${esc(counters)}</small>` : ""}</span></div>`;
        }).join("") + `</div>`);
      }
      // sections listed in `section_order` first, the others after them in the default order
      const order = (Array.isArray(c.section_order) ? c.section_order : []).filter((k) => SECTIONS.includes(k));
      html += c._single ? secs.guests || `<div class="empty">${esc(this._t(c.guest ? "noMatch" : "chooseGuest"))}</div>` : [...new Set([...order, ...SECTIONS])].map((k) => secs[k] || "").join("");
    }
    // keyboard: every clickable tile / pill can be reached with Tab and opened with Enter or Space (see the keydown handler)
    html = html.replace(/ data-more="/g, ' tabindex="0" role="button" data-more="');
    this._root.classList.toggle("compact", !!c.compact);
    this._root.classList.toggle("single", !!c._single);
    const accent = Array.isArray(c.accent) ? `rgb(${c.accent.join(",")})` : typeof c.accent === "string" ? c.accent.trim() : "";
    if (accent) this._root.style.setProperty("--px-accent", accent); else this._root.style.removeProperty("--px-accent");
    if (html !== this._last) { this._last = html; morph(this._root, html); }
    this._syncMenuListeners();
    if (c.show_history) this._loadHistory();
    if (c.show_forecast) this._loadForecast();
    for (const id in this._net) if (!this._hass.states[id]) delete this._net[id];
    this._seedNet();
  }

  _onClick(e) {
    const press = e.target.closest("[data-press]");
    if (press) {
      e.stopPropagation();
      const id = press.dataset.press;
      if (press.dataset.danger === "1" && this._armed !== id) {
        this._armed = id;
        clearTimeout(this._armTimer);
        this._armTimer = setTimeout(() => { this._armed = null; this._last = ""; this._render(); }, 4000);
        this._last = ""; this._render();
        return;
      }
      this._armed = null; clearTimeout(this._armTimer);
      this._hass.callService("button", "press", { entity_id: id });
      if (press.closest(".menu")) this._menu = null; // an action of the "⋯" menu closes it
      this._last = ""; this._render();
      return;
    }
    const mn = e.target.closest("[data-menu]");
    if (mn) {
      e.stopPropagation();
      this._menu = this._menu === mn.dataset.menu ? null : mn.dataset.menu;
      this._armed = null;
      this._last = ""; this._render();
      return;
    }
    const ex = e.target.closest("[data-expand]");
    if (ex) {
      e.stopPropagation();
      const set = (this._exp ||= new Set()), id = ex.dataset.expand;
      if (set.has(id)) set.delete(id); else set.add(id);
      this._last = ""; this._render();
      return;
    }
    if (e.target.closest("[data-prob]")) { e.stopPropagation(); this._probOnly = !this._probOnly; this._last = ""; this._render(); return; }
    if (e.target.closest(".gsearch, .gtools")) { e.stopPropagation(); return; }
    const so = e.target.closest("[data-sort]");
    if (so) {
      e.stopPropagation();
      const by = so.dataset.sort, cur = this._sortState();
      if (by === "type") this._sort = { ...cur, group: !cur.group }; // toggle VM / LXC grouping
      else if (by === "node") this._sort = { ...cur, node: !cur.node }; // toggle grouping by node
      else this._sort = { ...cur, by, dir: cur.by === by ? (cur.dir === "asc" ? "desc" : "asc") : "asc" };
      this._last = ""; this._render();
      return;
    }
    const tg = e.target.closest("[data-toggle]");
    if (tg) { e.stopPropagation(); this._toggle(tg.dataset.toggle); return; }
    const more = e.target.closest("[data-more]");
    if (!more) return;
    // `tap_action` (standard Home Assistant action: navigate, url, perform-action…) on the tiles; pills (alerts, version, HA) always open their entity
    const act = this._cfg.tap_action;
    if (act && act.action && act.action !== "more-info" && !more.closest(".alerts, .chips, .chip, .ver")) {
      this.dispatchEvent(new CustomEvent("hass-action", { bubbles: true, composed: true, detail: { config: { entity: more.dataset.more, tap_action: act }, action: "tap" } }));
      return;
    }
    this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: more.dataset.more } }));
  }
}

if (!customElements.get("proxmox-card")) customElements.define("proxmox-card", ProxmoxCard);

/** One guest on its own: `type: custom:proxmox-guest-card`, `guest: 104` (ID or name). Same tile as in the main card, detail unfolded. */
export class ProxmoxGuestCard extends ProxmoxCard {
  static getStubConfig(hass) {
    const d = hass?.entities ? ProxmoxCard.prototype._collect.call({ _hass: hass, _cfg: { node: "" } }) : null;
    const g = d && [...d.qemu, ...d.lxc][0];
    return { type: "custom:proxmox-guest-card", guest: g ? g.vmid || g.name : "" };
  }
  static getConfigElement() { return document.createElement("proxmox-guest-card-editor"); }
  setConfig(config) {
    const guest = config.guest === undefined || config.guest === null ? "" : String(config.guest);
    super.setConfig({
      ...config, guest, _single: true, include: guest ? [guest] : ["\u0000"], exclude: [],
      show_nodes: false, show_storage: false, show_disks: false, show_alerts: false, show_sort: false, show_filter_bar: false, show_stopped: true,
      guest_columns: "1", group_by_node: false, section_order: [],
    });
  }
  getCardSize() { const h = this._root?.offsetHeight; return h ? Math.ceil(h / 50) : 3; }
  getGridOptions() { return { columns: 6, rows: "auto", min_columns: 3 }; }
}
if (!customElements.get("proxmox-guest-card")) customElements.define("proxmox-guest-card", ProxmoxGuestCard);

export class ProxmoxGuestCardEditor extends HTMLElement {
  setConfig(config) { this._config = config || {}; this._render(); }
  set hass(hass) { this._hass = hass; if (this._form) this._form.hass = hass; if (!this._hadHass) { this._hadHass = true; this._render(); } }
  _render() {
    if (!this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        const config = { ...this._config };
        for (const [k, v] of Object.entries(e.detail.value || {})) {
          if (k in GUEST_EDITOR_DEFAULTS && v === GUEST_EDITOR_DEFAULTS[k] && !(k in this._config)) continue;
          config[k] = v;
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const lang = ((this._config.language && this._config.language !== "auto" ? this._config.language : this._hass?.locale?.language || this._hass?.language) || "en").slice(0, 2);
    const labels = { ...EDITOR_LABELS.en, ...(EDITOR_LABELS[lang] || {}) };
    const d = this._hass?.entities ? ProxmoxCard.prototype._collect.call({ _hass: this._hass, _cfg: { node: "" } }) : null;
    const guests = d ? [...d.qemu, ...d.lxc].sort((a, b) => (Number(a.vmid) || 0) - (Number(b.vmid) || 0)) : [];
    const key = lang + "|" + guests.map((g) => g.vmid + g.name).join();
    if (key !== this._key) {
      this._key = key;
      this._form.schema = [
        { name: "guest", selector: { select: { options: guests.map((g) => ({ value: g.vmid || g.name, label: `${g.vmid ? "#" + g.vmid + " " : ""}${g.name} (${g.kind === "lxc" ? "LXC" : "VM"})` })), mode: "dropdown", custom_value: true } } },
        { type: "grid", name: "", schema: ["show_details", "show_actions", "show_history", "show_network", "show_ip", "show_badges", "show_snapshots", "show_host_share"].map(bool) },
        { name: "tap_action", selector: { ui_action: {} } },
        { name: "language", selector: { select: { options: LANGUAGES.map(([value, label]) => ({ value, label })), mode: "dropdown" } } },
      ];
      this._form.computeLabel = (s) => labels[s.name] || s.name;
      this._form.computeHelper = (s) => (s.name === "tap_action" ? labels.h_tap : undefined);
    }
    this._form.hass = this._hass;
    const data = { ...GUEST_EDITOR_DEFAULTS, ...this._config, guest: this._config.guest === undefined ? "" : String(this._config.guest) };
    const k = JSON.stringify(data);
    if (k !== this._dataKey) { this._dataKey = k; this._form.data = data; }
  }
}
const GUEST_EDITOR_DEFAULTS = { show_details: true, show_actions: true, show_history: true, show_network: true, show_ip: true, show_badges: true, show_snapshots: true, show_host_share: true, language: "auto" };
if (!customElements.get("proxmox-guest-card-editor")) customElements.define("proxmox-guest-card-editor", ProxmoxGuestCardEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "proxmox-card"))
  window.customCards.push({ type: "proxmox-card", name: "Proxmox Card", description: `Nodes, VMs and containers from the Proxmox VE integration (v${VERSION})`, preview: false });
if (!window.customCards.some((c) => c.type === "proxmox-guest-card"))
  window.customCards.push({ type: "proxmox-guest-card", name: "Proxmox Guest Card", description: `One VM or container of the Proxmox VE integration: gauges, actions and history (v${VERSION})`, preview: true });
