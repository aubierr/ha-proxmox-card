/*
 * ha-proxmox-card — Lovelace card for the Proxmox VE integration
 * https://github.com/dougiteixeira/proxmoxve
 * Vanilla JS, Shadow DOM, no dependencies.
 */
const VERSION = "0.7.0";

const DEFAULT_THRESHOLDS = {
  cpu: { warning: 70, critical: 90 },
  memory: { warning: 80, critical: 95 },
  disk: { warning: 80, critical: 90 },
  temperature: { warning: 55, critical: 70 },
  wear: { warning: 70, critical: 90 },
  io: { warning: 5, critical: 15 },
};

// Positional strings per language (see STRING_KEYS). Missing keys fall back to English.
const STRING_KEYS = ["nodes", "online", "vms", "cts", "disk", "start", "shutdown", "reboot", "stop", "noData", "noRegistry", "guests", "confirm", "storage", "disks", "swap", "load", "version", "updates", "backup", "failed", "inactive", "diskProblem", "wear", "locked", "agentDown", "problem", "sortType", "sortName", "sortStatus", "lastBackup", "backupFailed", "quorumLost", "cluster"];
const pack = (keys, langs) => Object.fromEntries(Object.entries(langs).map(([l, a]) => [l, Object.fromEntries(keys.map((k, i) => [k, a[i]]))]));
const STRINGS = pack(STRING_KEYS, {
  en: ["Nodes", "online", "VMs", "CTs", "Disk", "Start", "Shutdown", "Reboot", "Force stop", "No Proxmox entities found. Is the proxmoxve integration set up?", "This card needs a recent Home Assistant (entity and device registry in the frontend).", "Guests", "Confirm: ", "Storage", "Physical disks", "Swap", "Load", "Version", "updates available", "backup running", "failed tasks", "storage inactive", "disk problem", "Wear", "Locked", "Guest agent not responding", "Problem reported", "Type", "Name", "Status", "Last backup", "backup failed", "quorum lost", "Cluster"],
  fr: ["Nœuds", "en ligne", "VM", "CT", "Disque", "Démarrer", "Arrêter", "Redémarrer", "Forcer l'arrêt", "Aucune entité Proxmox trouvée. L'intégration proxmoxve est-elle installée ?", "Cette carte nécessite une version récente de Home Assistant.", "Invités", "Confirmer : ", "Stockages", "Disques physiques", "Swap", "Charge", "Version", "mises à jour", "sauvegarde en cours", "tâches en échec", "stockage inactif", "disque en défaut", "Usure", "Verrouillé", "Agent invité injoignable", "Problème signalé", "Type", "Nom", "État", "Dernière sauvegarde", "sauvegarde en échec", "quorum perdu", "Cluster"],
  de: ["Knoten", "online", "VMs", "CTs", "Festplatte", "Starten", "Herunterfahren", "Neustarten", "Erzwungen stoppen", "Keine Proxmox-Entitäten gefunden. Ist die Integration proxmoxve eingerichtet?", "Diese Karte benötigt ein aktuelles Home Assistant (Entitäts- und Geräteregister im Frontend).", "Gäste", "Bestätigen: ", "Speicher", "Physische Datenträger", "Swap", "Last", "Version", "Updates verfügbar", "Sicherung läuft", "fehlgeschlagene Aufgaben", "Speicher inaktiv", "Datenträgerproblem", "Verschleiß", "Gesperrt", "Gast-Agent antwortet nicht", "Problem gemeldet", "Typ", "Name", "Status", "Letzte Sicherung", "Sicherung fehlgeschlagen", "Quorum verloren", "Cluster"],
  es: ["Nodos", "en línea", "VM", "CT", "Disco", "Iniciar", "Apagar", "Reiniciar", "Forzar parada", "No se encontraron entidades de Proxmox. ¿Está configurada la integración proxmoxve?", "Esta tarjeta necesita una versión reciente de Home Assistant (registro de entidades y dispositivos en el frontend).", "Invitados", "Confirmar: ", "Almacenamiento", "Discos físicos", "Swap", "Carga", "Versión", "actualizaciones disponibles", "copia de seguridad en curso", "tareas fallidas", "almacenamiento inactivo", "problema de disco", "Desgaste", "Bloqueado", "El agente invitado no responde", "Problema detectado", "Tipo", "Nombre", "Estado", "Última copia de seguridad", "copia de seguridad fallida", "quórum perdido", "Clúster"],
  it: ["Nodi", "online", "VM", "CT", "Disco", "Avvia", "Arresta", "Riavvia", "Arresto forzato", "Nessuna entità Proxmox trovata. L'integrazione proxmoxve è configurata?", "Questa scheda richiede una versione recente di Home Assistant (registro di entità e dispositivi nel frontend).", "Guest", "Conferma: ", "Archiviazione", "Dischi fisici", "Swap", "Carico", "Versione", "aggiornamenti disponibili", "backup in corso", "attività non riuscite", "archiviazione inattiva", "problema al disco", "Usura", "Bloccato", "Guest agent non risponde", "Problema segnalato", "Tipo", "Nome", "Stato", "Ultimo backup", "backup non riuscito", "quorum perso", "Cluster"],
  pt: ["Nós", "online", "VMs", "CTs", "Disco", "Iniciar", "Desligar", "Reiniciar", "Forçar paragem", "Nenhuma entidade Proxmox encontrada. A integração proxmoxve está configurada?", "Este cartão requer um Home Assistant recente (registo de entidades e dispositivos no frontend).", "Convidados", "Confirmar: ", "Armazenamento", "Discos físicos", "Swap", "Carga", "Versão", "atualizações disponíveis", "cópia de segurança em curso", "tarefas com falha", "armazenamento inativo", "problema no disco", "Desgaste", "Bloqueado", "O agente convidado não responde", "Problema reportado", "Tipo", "Nome", "Estado", "Última cópia de segurança", "cópia de segurança falhou", "quórum perdido", "Cluster"],
  nl: ["Nodes", "online", "VM's", "CT's", "Schijf", "Starten", "Afsluiten", "Herstarten", "Geforceerd stoppen", "Geen Proxmox-entiteiten gevonden. Is de proxmoxve-integratie ingesteld?", "Deze kaart heeft een recente Home Assistant nodig (entiteiten- en apparatenregister in de frontend).", "Gasten", "Bevestig: ", "Opslag", "Fysieke schijven", "Swap", "Belasting", "Versie", "updates beschikbaar", "back-up bezig", "mislukte taken", "opslag inactief", "schijfprobleem", "Slijtage", "Vergrendeld", "Gastagent reageert niet", "Probleem gemeld", "Type", "Naam", "Status", "Laatste back-up", "back-up mislukt", "quorum verloren", "Cluster"],
  pl: ["Węzły", "online", "VM", "CT", "Dysk", "Uruchom", "Wyłącz", "Uruchom ponownie", "Wymuś zatrzymanie", "Nie znaleziono encji Proxmox. Czy integracja proxmoxve jest skonfigurowana?", "Ta karta wymaga nowszej wersji Home Assistant (rejestr encji i urządzeń we frontendzie).", "Goście", "Potwierdź: ", "Magazyny", "Dyski fizyczne", "Swap", "Obciążenie", "Wersja", "dostępne aktualizacje", "trwa kopia zapasowa", "nieudane zadania", "magazyn nieaktywny", "problem z dyskiem", "Zużycie", "Zablokowany", "Agent gościa nie odpowiada", "Zgłoszono problem", "Typ", "Nazwa", "Stan", "Ostatnia kopia zapasowa", "kopia zapasowa nieudana", "utracono kworum", "Klaster"],
  cs: ["Uzly", "online", "VM", "CT", "Disk", "Spustit", "Vypnout", "Restartovat", "Vynutit zastavení", "Nebyly nalezeny žádné entity Proxmox. Je integrace proxmoxve nastavena?", "Tato karta vyžaduje novější Home Assistant (registr entit a zařízení ve frontendu).", "Hosté", "Potvrdit: ", "Úložiště", "Fyzické disky", "Swap", "Zátěž", "Verze", "dostupné aktualizace", "probíhá záloha", "neúspěšné úlohy", "úložiště neaktivní", "problém s diskem", "Opotřebení", "Uzamčeno", "Agent hosta neodpovídá", "Nahlášen problém", "Typ", "Název", "Stav", "Poslední záloha", "záloha selhala", "kvórum ztraceno", "Cluster"],
  sv: ["Noder", "online", "VM", "CT", "Disk", "Starta", "Stäng av", "Starta om", "Tvinga stopp", "Inga Proxmox-entiteter hittades. Är integrationen proxmoxve konfigurerad?", "Det här kortet kräver en nyare Home Assistant (entitets- och enhetsregister i frontend).", "Gäster", "Bekräfta: ", "Lagring", "Fysiska diskar", "Swap", "Belastning", "Version", "uppdateringar tillgängliga", "säkerhetskopiering pågår", "misslyckade uppgifter", "lagring inaktiv", "diskproblem", "Slitage", "Låst", "Gästagenten svarar inte", "Problem rapporterat", "Typ", "Namn", "Status", "Senaste säkerhetskopia", "säkerhetskopiering misslyckades", "kvorum förlorat", "Kluster"],
  da: ["Noder", "online", "VM", "CT", "Disk", "Start", "Luk ned", "Genstart", "Gennemtving stop", "Ingen Proxmox-entiteter fundet. Er integrationen proxmoxve sat op?", "Dette kort kræver en nyere Home Assistant (entitets- og enhedsregister i frontend).", "Gæster", "Bekræft: ", "Lager", "Fysiske diske", "Swap", "Belastning", "Version", "opdateringer tilgængelige", "sikkerhedskopiering i gang", "mislykkede opgaver", "lager inaktivt", "diskproblem", "Slid", "Låst", "Gæsteagenten svarer ikke", "Problem rapporteret", "Type", "Navn", "Status", "Seneste sikkerhedskopi", "sikkerhedskopi mislykkedes", "kvorum tabt", "Klynge"],
  nb: ["Noder", "online", "VM", "CT", "Disk", "Start", "Slå av", "Start på nytt", "Tvungen stopp", "Fant ingen Proxmox-entiteter. Er integrasjonen proxmoxve satt opp?", "Dette kortet krever en nyere Home Assistant (entitets- og enhetsregister i frontend).", "Gjester", "Bekreft: ", "Lagring", "Fysiske disker", "Swap", "Belastning", "Versjon", "oppdateringer tilgjengelig", "sikkerhetskopiering pågår", "mislykkede oppgaver", "lagring inaktiv", "diskproblem", "Slitasje", "Låst", "Gjesteagenten svarer ikke", "Problem rapportert", "Type", "Navn", "Status", "Siste sikkerhetskopi", "sikkerhetskopi mislyktes", "kvorum tapt", "Klynge"],
  fi: ["Solmut", "verkossa", "VM", "CT", "Levy", "Käynnistä", "Sammuta", "Käynnistä uudelleen", "Pakota pysäytys", "Proxmox-entiteettejä ei löytynyt. Onko proxmoxve-integraatio asennettu?", "Tämä kortti vaatii uudemman Home Assistantin (entiteetti- ja laiterekisteri käyttöliittymässä).", "Vieraat", "Vahvista: ", "Tallennustila", "Fyysiset levyt", "Swap", "Kuorma", "Versio", "päivityksiä saatavilla", "varmuuskopiointi käynnissä", "epäonnistuneet tehtävät", "tallennustila ei käytössä", "levyongelma", "Kuluminen", "Lukittu", "Vieras-agentti ei vastaa", "Ongelma ilmoitettu", "Tyyppi", "Nimi", "Tila", "Viimeisin varmuuskopio", "varmuuskopiointi epäonnistui", "kvoorumi menetetty", "Klusteri"],
  ru: ["Узлы", "в сети", "ВМ", "КТ", "Диск", "Запустить", "Выключить", "Перезагрузить", "Принудительно остановить", "Сущности Proxmox не найдены. Настроена ли интеграция proxmoxve?", "Для этой карточки нужна свежая версия Home Assistant (реестр сущностей и устройств во фронтенде).", "Гости", "Подтвердить: ", "Хранилища", "Физические диски", "Swap", "Нагрузка", "Версия", "обновлений доступно", "идёт резервное копирование", "неудачные задачи", "хранилище неактивно", "проблема с диском", "Износ", "Заблокировано", "Гостевой агент не отвечает", "Сообщено о проблеме", "Тип", "Имя", "Состояние", "Последняя резервная копия", "сбой резервного копирования", "кворум потерян", "Кластер"],
  uk: ["Вузли", "в мережі", "ВМ", "КТ", "Диск", "Запустити", "Вимкнути", "Перезавантажити", "Примусово зупинити", "Сутності Proxmox не знайдено. Чи налаштовано інтеграцію proxmoxve?", "Для цієї картки потрібна свіжа версія Home Assistant (реєстр сутностей і пристроїв у фронтенді).", "Гості", "Підтвердити: ", "Сховища", "Фізичні диски", "Swap", "Навантаження", "Версія", "оновлень доступно", "триває резервне копіювання", "невдалі завдання", "сховище неактивне", "проблема з диском", "Знос", "Заблоковано", "Гостьовий агент не відповідає", "Повідомлено про проблему", "Тип", "Назва", "Стан", "Остання резервна копія", "збій резервного копіювання", "кворум втрачено", "Кластер"],
  tr: ["Düğümler", "çevrimiçi", "VM", "CT", "Disk", "Başlat", "Kapat", "Yeniden başlat", "Zorla durdur", "Proxmox varlığı bulunamadı. proxmoxve entegrasyonu kurulu mu?", "Bu kart yeni bir Home Assistant sürümü gerektirir (arayüzde varlık ve cihaz kaydı).", "Konuklar", "Onayla: ", "Depolama", "Fiziksel diskler", "Swap", "Yük", "Sürüm", "güncelleme mevcut", "yedekleme sürüyor", "başarısız görevler", "depolama etkin değil", "disk sorunu", "Aşınma", "Kilitli", "Konuk aracısı yanıt vermiyor", "Sorun bildirildi", "Tür", "Ad", "Durum", "Son yedekleme", "yedekleme başarısız", "çoğunluk (quorum) kaybedildi", "Küme"],
  ro: ["Noduri", "online", "VM", "CT", "Disc", "Pornește", "Oprește", "Repornește", "Oprire forțată", "Nu s-au găsit entități Proxmox. Este configurată integrarea proxmoxve?", "Acest card necesită o versiune recentă de Home Assistant (registrul de entități și dispozitive în frontend).", "Oaspeți", "Confirmă: ", "Stocare", "Discuri fizice", "Swap", "Încărcare", "Versiune", "actualizări disponibile", "copie de rezervă în curs", "sarcini eșuate", "stocare inactivă", "problemă la disc", "Uzură", "Blocat", "Agentul oaspete nu răspunde", "Problemă raportată", "Tip", "Nume", "Stare", "Ultima copie de rezervă", "copie de rezervă eșuată", "cvorum pierdut", "Cluster"],
  hu: ["Csomópontok", "online", "VM", "CT", "Lemez", "Indítás", "Leállítás", "Újraindítás", "Kényszerített leállítás", "Nem található Proxmox entitás. Be van állítva a proxmoxve integráció?", "Ehhez a kártyához újabb Home Assistant szükséges (entitás- és eszközregiszter a frontendben).", "Vendégek", "Megerősítés: ", "Tárolók", "Fizikai lemezek", "Swap", "Terhelés", "Verzió", "frissítés érhető el", "mentés folyamatban", "sikertelen feladatok", "tároló inaktív", "lemezprobléma", "Kopás", "Zárolva", "A vendég ügynök nem válaszol", "Hiba jelezve", "Típus", "Név", "Állapot", "Utolsó mentés", "a mentés sikertelen", "kvórum elveszett", "Fürt"],
  ja: ["ノード", "オンライン", "VM", "CT", "ディスク", "起動", "シャットダウン", "再起動", "強制停止", "Proxmox エンティティが見つかりません。proxmoxve インテグレーションは設定されていますか？", "このカードには新しい Home Assistant が必要です（フロントエンドのエンティティ／デバイスレジストリ）。", "ゲスト", "確認: ", "ストレージ", "物理ディスク", "スワップ", "負荷", "バージョン", "件の更新あり", "バックアップ実行中", "失敗したタスク", "ストレージが無効", "ディスクの問題", "摩耗", "ロック中", "ゲストエージェントが応答しません", "問題が報告されました", "種類", "名前", "状態", "最後のバックアップ", "バックアップ失敗", "クォーラム喪失", "クラスター"],
  zh: ["节点", "在线", "虚拟机", "容器", "磁盘", "启动", "关机", "重启", "强制停止", "未找到 Proxmox 实体。是否已设置 proxmoxve 集成？", "此卡片需要较新版本的 Home Assistant（前端中的实体和设备注册表）。", "客户机", "确认：", "存储", "物理磁盘", "交换", "负载", "版本", "个可用更新", "正在备份", "失败的任务", "存储未激活", "磁盘故障", "磨损", "已锁定", "客户机代理无响应", "已报告问题", "类型", "名称", "状态", "上次备份", "备份失败", "仲裁丢失", "集群"],
});
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
.strip { display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); padding-top:14px; border-top:1px solid var(--px-line); }
.si { --c:var(--px-accent); display:flex; align-items:center; justify-content:center; gap:10px; min-width:0; }
.si + .si { border-left:1px solid var(--px-line); }
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
.gn { min-width:0; } .gn div:first-child { font-size:14px; font-weight:600; color:var(--primary-text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.gn div:last-child { font-size:11px; color:var(--secondary-text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.gms { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; min-width:0; }
.gm { display:flex; flex-direction:column; gap:4px; font-size:11px; color:var(--secondary-text-color); min-width:0; }
.gl { display:flex; justify-content:space-between; gap:4px; }
.gl b { font-weight:600; color:var(--primary-text-color); font-variant-numeric:tabular-nums; }
.acts { display:flex; gap:4px; }
.act { --mdc-icon-size:20px; width:32px; height:32px; border-radius:50%; display:grid; place-items:center; cursor:pointer; color:var(--secondary-text-color); border:1px solid var(--px-line); background:transparent; padding:0; transition:all .15s; }
.act:hover { background:color-mix(in srgb,var(--px-accent) 18%,transparent); color:var(--px-accent); border-color:var(--px-accent); }
.act.armed { background:var(--px-crit); color:#fff; border-color:var(--px-crit); }
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
.dk { display:grid; grid-template-columns:14px minmax(0,1.6fr) auto minmax(0,1fr) 68px; align-items:center; gap:12px; padding:8px 12px; border-radius:12px; background:var(--px-tile); border:1px solid var(--px-line); cursor:pointer; font-size:12px; color:var(--secondary-text-color); }
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
.strip .si.wide { grid-column:1 / -1; justify-content:flex-start; border-left:0; border-top:1px solid var(--px-line); margin-top:12px; padding-top:12px; }
.strip .si.wide b { font-size:15px; }
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
      patchChildren(na, nb);
    }
  }
}

function fmtDate(state, lang) {
  const d = Date.parse(state);
  if (Number.isNaN(d)) return "";
  try { return new Date(d).toLocaleString(lang || undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch (e) { return new Date(d).toLocaleString(); }
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
};

/** Classify an entity of the proxmoxve integration by translation key / entity_id. */
function roleOf(ent) {
  const id = ent.entity_id;
  const domain = id.split(".")[0];
  // The translation key is reliable; the entity_id also contains guest/storage names, so only fall back to it.
  const k = (ent.translation_key || id.split(".")[1]).toLowerCase();
  if (domain === "button") {
    if (/shutdown/.test(k)) return "btn_shutdown";
    if (/reboot/.test(k)) return "btn_reboot";
    if (/(^|_|\s)stop(_|\s|$)/.test(k) && !/stop_all/.test(k)) return "btn_stop";
    if (/(^|_|\s)start(_|\s|$)/.test(k) && !/start_all/.test(k)) return "btn_start";
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

const SORTS = ["id", "name", "status"];
const EDITOR_DEFAULTS = {
  sort: "id", sort_dir: "asc", group_by_type: false, type_order: "vm_first", show_sort: true, include: [], exclude: [], show_cluster: true, show_history: true, show_backup: true, guest_columns: "auto", history_hours: 24, collapsed: [],
  title: "Proxmox", node: "", show_nodes: true, show_qemu: true, show_lxc: true, show_stopped: true, show_actions: true, show_ip: true,
  show_uptime: true, show_badges: true, show_alerts: true, show_storage: true, show_disks: true, show_swap: true, show_load: true,
  show_version: true, language: "auto",
};
const bool = (name) => ({ name, selector: { boolean: {} } });
const editorSchema = (L) => [
  { name: "title", selector: { text: {} } },
  { name: "node", selector: { text: {} } },
  { type: "expandable", name: "", title: L.Sections, icon: "mdi:view-dashboard-outline", expanded: true, schema: [
    { type: "grid", name: "", schema: ["show_nodes", "show_qemu", "show_lxc", "show_stopped", "show_alerts", "show_cluster", "show_storage", "show_disks"].map(bool) },
  ] },
  { type: "expandable", name: "", title: L.Details, icon: "mdi:tune-variant", expanded: true, schema: [
    { type: "grid", name: "", schema: ["show_actions", "show_ip", "show_uptime", "show_badges", "show_swap", "show_load", "show_backup", "show_version", "show_history", "show_sort"].map(bool) },
  ] },
  { type: "expandable", name: "", title: L.Sort, icon: "mdi:sort", expanded: true, schema: [
    { name: "sort", selector: { select: { options: [{ value: "id", label: "ID" }, { value: "name", label: L.o_name }, { value: "status", label: L.o_status }], mode: "dropdown" } } },
    { name: "sort_dir", selector: { select: { options: [{ value: "asc", label: L.o_asc }, { value: "desc", label: L.o_desc }], mode: "dropdown" } } },
    bool("group_by_type"),
    { name: "type_order", selector: { select: { options: [{ value: "vm_first", label: L.o_vm }, { value: "lxc_first", label: L.o_lxc }], mode: "dropdown" } } },
  ] },
  { type: "expandable", name: "", title: L.Layout, icon: "mdi:view-column-outline", expanded: false, schema: [
    { name: "guest_columns", selector: { select: { options: [{ value: "auto", label: L.o_cols_auto }, { value: "1", label: L.o_cols_1 }, { value: "2", label: L.o_cols_2 }], mode: "dropdown" } } },
    { name: "history_hours", selector: { select: { options: ["6", "12", "24", "48", "72"].map((v) => ({ value: v, label: v + " h" })), mode: "dropdown" } } },
    { name: "accent", selector: { color_rgb: {} } },
    { name: "collapsed", selector: { select: { multiple: true, options: [["nodes", L.s_nodes], ["guests", L.s_guests], ["storage", L.s_storage], ["disks", L.s_disks]].map(([value, label]) => ({ value, label })), mode: "list" } } },
  ] },
  { type: "expandable", name: "", title: L.Filters, icon: "mdi:filter-variant", expanded: false, schema: [
    { name: "include", selector: { text: { multiple: true } } },
    { name: "exclude", selector: { text: { multiple: true } } },
  ] },
  { name: "language", selector: { select: { options: LANGUAGES.map(([value, label]) => ({ value, label })), mode: "dropdown" } } },
];
const EDITOR_KEYS = ["title", "node", "show_nodes", "show_qemu", "show_lxc", "show_stopped", "show_alerts", "show_storage", "show_disks", "show_actions", "show_ip", "show_uptime", "show_badges", "show_swap", "show_load", "show_version", "show_sort", "sort", "sort_dir", "group_by_type", "type_order", "language", "Sections", "Details", "Sort", "o_name", "o_status", "o_asc", "o_desc", "o_vm", "o_lxc", "Filters", "include", "exclude", "h_buttons", "h_nobuttons", "h_found", "h_filters", "show_cluster", "show_history", "show_backup", "guest_columns", "accent", "history_hours", "collapsed", "Layout", "o_cols_auto", "o_cols_1", "o_cols_2", "h_backup", "h_cluster"];
const EDITOR_LABELS = pack(EDITOR_KEYS, {
  en: ["Title", "Filter by node / name (optional)", "Nodes", "Virtual machines", "Containers", "Stopped guests", "Alerts (updates, backup, failed tasks…)", "Storages", "Physical disks", "Power buttons", "IP address", "Guest uptime", "Guest badges (locked, agent, problem)", "Node swap", "Load and IO delay", "Proxmox version", "Sort buttons on the card", "Sort guests by", "Direction", "Group by type (VM / LXC)", "Type order (when grouped)", "Language", "Sections", "Details", "Guest sort", "Name", "Status (running first)", "Ascending ↓", "Descending ↑", "VMs, then containers", "Containers, then VMs", "Filters", "Show only these guests (ID or name)", "Hide these guests (ID or name)", "{n} of {m} guests have power buttons.", "No power button found: enable the Start / Shutdown / Reboot entities of the Proxmox VE integration (Settings → Devices & services → the guest → disabled entities).", "{n} detected", "Type an ID or a name, then press Enter. To rename guests or change their icon, use the guests: option in YAML.", "Cluster summary (2 nodes or more)", "History curves", "Last backup", "Guest columns", "Accent color", "History period (hours)", "Collapsed sections", "Layout", "Automatic (2 columns when wide)", "1 column", "2 columns", "Needs the “Last backup” entity of the node (disabled by default: Settings → Devices & services → the node → disabled entities).", "Shown when the cluster has 2 nodes or more."],
  fr: ["Titre", "Filtrer par nœud / nom (facultatif)", "Nœuds", "Machines virtuelles", "Conteneurs", "Invités arrêtés", "Alertes (mises à jour, sauvegarde, tâches en échec…)", "Stockages", "Disques physiques", "Boutons marche / arrêt", "Adresse IP", "Uptime des invités", "Badges des invités (verrouillé, agent, problème)", "Swap des nœuds", "Charge et IO delay", "Version de Proxmox", "Boutons de tri sur la carte", "Trier les invités par", "Sens", "Regrouper par type (VM / LXC)", "Ordre des types (si regroupé)", "Langue", "Sections", "Détails", "Tri des invités", "Nom", "État (actifs d'abord)", "Croissant ↓", "Décroissant ↑", "VM, puis conteneurs", "Conteneurs, puis VM", "Filtres", "Afficher uniquement ces invités (ID ou nom)", "Masquer ces invités (ID ou nom)", "{n} invités sur {m} ont des boutons marche / arrêt.", "Aucun bouton trouvé : activez les entités Démarrer / Arrêter / Redémarrer de l'intégration Proxmox VE (Paramètres → Appareils et services → l'invité → entités désactivées).", "{n} détecté(s)", "Saisissez un ID ou un nom, puis Entrée. Pour renommer un invité ou changer son icône, utilisez l'option guests: en YAML.", "Résumé du cluster (2 nœuds ou plus)", "Courbes d'historique", "Dernière sauvegarde", "Colonnes des invités", "Couleur d'accent", "Période de l'historique (heures)", "Sections repliées", "Disposition", "Automatique (2 colonnes si large)", "1 colonne", "2 colonnes", "Nécessite l'entité « Last backup » du nœud (désactivée par défaut : Paramètres → Appareils et services → le nœud → entités désactivées).", "Affiché à partir de 2 nœuds."],
  de: ["Titel", "Nach Knoten / Name filtern (optional)", "Knoten", "Virtuelle Maschinen", "Container", "Gestoppte Gäste", "Warnungen (Updates, Sicherung, fehlgeschlagene Aufgaben …)", "Speicher", "Physische Datenträger", "Ein-/Aus-Schaltflächen", "IP-Adresse", "Gast-Laufzeit", "Gast-Badges (gesperrt, Agent, Problem)", "Knoten-Swap", "Last und IO-Delay", "Proxmox-Version", "Sortier-Schaltflächen auf der Karte", "Gäste sortieren nach", "Richtung", "Nach Typ gruppieren (VM / LXC)", "Reihenfolge der Typen (bei Gruppierung)", "Sprache", "Bereiche", "Details", "Gäste sortieren", "Name", "Status (laufende zuerst)", "Aufsteigend ↓", "Absteigend ↑", "VMs, dann Container", "Container, dann VMs", "Filter", "Nur diese Gäste anzeigen (ID oder Name)", "Diese Gäste ausblenden (ID oder Name)", "{n} von {m} Gästen haben Ein-/Aus-Schaltflächen.", "Keine Schaltfläche gefunden: Aktivieren Sie die Entitäten Starten / Herunterfahren / Neustarten der Proxmox-VE-Integration (Einstellungen → Geräte & Dienste → Gast → deaktivierte Entitäten).", "{n} erkannt", "ID oder Namen eingeben und Enter drücken. Zum Umbenennen von Gästen oder Ändern ihres Symbols die Option guests: in YAML verwenden.", "Cluster-Übersicht (ab 2 Knoten)", "Verlaufskurven", "Letzte Sicherung", "Spalten der Gäste", "Akzentfarbe", "Verlaufszeitraum (Stunden)", "Eingeklappte Bereiche", "Layout", "Automatisch (2 Spalten bei breiter Karte)", "1 Spalte", "2 Spalten", "Benötigt die Entität „Last backup“ des Knotens (standardmäßig deaktiviert: Einstellungen → Geräte & Dienste → der Knoten → deaktivierte Entitäten).", "Wird ab 2 Knoten angezeigt."],
  es: ["Título", "Filtrar por nodo / nombre (opcional)", "Nodos", "Máquinas virtuales", "Contenedores", "Invitados detenidos", "Alertas (actualizaciones, copia de seguridad, tareas fallidas…)", "Almacenamientos", "Discos físicos", "Botones de encendido", "Dirección IP", "Tiempo activo de invitados", "Insignias de invitados (bloqueado, agente, problema)", "Swap de los nodos", "Carga e IO delay", "Versión de Proxmox", "Botones de orden en la tarjeta", "Ordenar invitados por", "Sentido", "Agrupar por tipo (VM / LXC)", "Orden de los tipos (si se agrupa)", "Idioma", "Secciones", "Detalles", "Orden de invitados", "Nombre", "Estado (en ejecución primero)", "Ascendente ↓", "Descendente ↑", "VM, luego contenedores", "Contenedores, luego VM", "Filtros", "Mostrar solo estos invitados (ID o nombre)", "Ocultar estos invitados (ID o nombre)", "{n} de {m} invitados tienen botones de encendido.", "No se encontró ningún botón: active las entidades Iniciar / Apagar / Reiniciar de la integración Proxmox VE (Ajustes → Dispositivos y servicios → el invitado → entidades deshabilitadas).", "{n} detectados", "Escriba un ID o un nombre y pulse Intro. Para renombrar invitados o cambiar su icono, use la opción guests: en YAML.", "Resumen del clúster (2 nodos o más)", "Curvas de historial", "Última copia de seguridad", "Columnas de invitados", "Color de acento", "Periodo del historial (horas)", "Secciones plegadas", "Diseño", "Automático (2 columnas si es ancha)", "1 columna", "2 columnas", "Requiere la entidad «Last backup» del nodo (desactivada por defecto: Ajustes → Dispositivos y servicios → el nodo → entidades deshabilitadas).", "Se muestra a partir de 2 nodos."],
  it: ["Titolo", "Filtra per nodo / nome (facoltativo)", "Nodi", "Macchine virtuali", "Container", "Guest arrestati", "Avvisi (aggiornamenti, backup, attività non riuscite…)", "Archiviazioni", "Dischi fisici", "Pulsanti di alimentazione", "Indirizzo IP", "Uptime dei guest", "Badge dei guest (bloccato, agent, problema)", "Swap dei nodi", "Carico e IO delay", "Versione di Proxmox", "Pulsanti di ordinamento sulla scheda", "Ordina i guest per", "Direzione", "Raggruppa per tipo (VM / LXC)", "Ordine dei tipi (se raggruppati)", "Lingua", "Sezioni", "Dettagli", "Ordinamento guest", "Nome", "Stato (attivi per primi)", "Crescente ↓", "Decrescente ↑", "VM, poi container", "Container, poi VM", "Filtri", "Mostra solo questi guest (ID o nome)", "Nascondi questi guest (ID o nome)", "{n} guest su {m} hanno i pulsanti di alimentazione.", "Nessun pulsante trovato: abilita le entità Avvia / Arresta / Riavvia dell'integrazione Proxmox VE (Impostazioni → Dispositivi e servizi → il guest → entità disabilitate).", "{n} rilevati", "Digita un ID o un nome, poi premi Invio. Per rinominare i guest o cambiarne l'icona usa l'opzione guests: in YAML.", "Riepilogo del cluster (2 nodi o più)", "Curve di cronologia", "Ultimo backup", "Colonne dei guest", "Colore di accento", "Periodo della cronologia (ore)", "Sezioni compresse", "Layout", "Automatico (2 colonne se larga)", "1 colonna", "2 colonne", "Richiede l'entità «Last backup» del nodo (disabilitata per impostazione predefinita: Impostazioni → Dispositivi e servizi → il nodo → entità disabilitate).", "Mostrato da 2 nodi in su."],
  pt: ["Título", "Filtrar por nó / nome (opcional)", "Nós", "Máquinas virtuais", "Contentores", "Convidados parados", "Alertas (atualizações, cópia de segurança, tarefas com falha…)", "Armazenamentos", "Discos físicos", "Botões de energia", "Endereço IP", "Tempo de atividade dos convidados", "Distintivos dos convidados (bloqueado, agente, problema)", "Swap dos nós", "Carga e IO delay", "Versão do Proxmox", "Botões de ordenação no cartão", "Ordenar convidados por", "Sentido", "Agrupar por tipo (VM / LXC)", "Ordem dos tipos (se agrupado)", "Idioma", "Secções", "Detalhes", "Ordenação dos convidados", "Nome", "Estado (em execução primeiro)", "Ascendente ↓", "Descendente ↑", "VMs, depois contentores", "Contentores, depois VMs", "Filtros", "Mostrar apenas estes convidados (ID ou nome)", "Ocultar estes convidados (ID ou nome)", "{n} de {m} convidados têm botões de energia.", "Nenhum botão encontrado: ative as entidades Iniciar / Desligar / Reiniciar da integração Proxmox VE (Definições → Dispositivos e serviços → o convidado → entidades desativadas).", "{n} detetados", "Escreva um ID ou um nome e prima Enter. Para renomear convidados ou mudar o ícone, use a opção guests: em YAML.", "Resumo do cluster (2 nós ou mais)", "Curvas de histórico", "Última cópia de segurança", "Colunas dos convidados", "Cor de destaque", "Período do histórico (horas)", "Secções recolhidas", "Disposição", "Automático (2 colunas se larga)", "1 coluna", "2 colunas", "Requer a entidade «Last backup» do nó (desativada por predefinição: Definições → Dispositivos e serviços → o nó → entidades desativadas).", "Mostrado a partir de 2 nós."],
  nl: ["Titel", "Filteren op node / naam (optioneel)", "Nodes", "Virtuele machines", "Containers", "Gestopte gasten", "Meldingen (updates, back-up, mislukte taken…)", "Opslag", "Fysieke schijven", "Aan/uit-knoppen", "IP-adres", "Uptime van gasten", "Badges van gasten (vergrendeld, agent, probleem)", "Swap van nodes", "Belasting en IO-delay", "Proxmox-versie", "Sorteerknoppen op de kaart", "Gasten sorteren op", "Richting", "Groeperen op type (VM / LXC)", "Volgorde van typen (bij groeperen)", "Taal", "Secties", "Details", "Sortering van gasten", "Naam", "Status (actieve eerst)", "Oplopend ↓", "Aflopend ↑", "VM's, dan containers", "Containers, dan VM's", "Filters", "Alleen deze gasten tonen (ID of naam)", "Deze gasten verbergen (ID of naam)", "{n} van {m} gasten hebben aan/uit-knoppen.", "Geen knop gevonden: schakel de entiteiten Starten / Afsluiten / Herstarten van de Proxmox VE-integratie in (Instellingen → Apparaten & diensten → de gast → uitgeschakelde entiteiten).", "{n} gevonden", "Typ een ID of naam en druk op Enter. Gebruik de optie guests: in YAML om gasten te hernoemen of hun pictogram te wijzigen.", "Clusteroverzicht (vanaf 2 nodes)", "Geschiedeniscurves", "Laatste back-up", "Kolommen van gasten", "Accentkleur", "Geschiedenisperiode (uren)", "Ingeklapte secties", "Indeling", "Automatisch (2 kolommen als breed)", "1 kolom", "2 kolommen", "Vereist de entiteit ‘Last backup’ van de node (standaard uitgeschakeld: Instellingen → Apparaten & diensten → de node → uitgeschakelde entiteiten).", "Getoond vanaf 2 nodes."],
  pl: ["Tytuł", "Filtruj po węźle / nazwie (opcjonalnie)", "Węzły", "Maszyny wirtualne", "Kontenery", "Zatrzymani goście", "Alerty (aktualizacje, kopia zapasowa, nieudane zadania…)", "Magazyny", "Dyski fizyczne", "Przyciski zasilania", "Adres IP", "Czas działania gości", "Odznaki gości (zablokowany, agent, problem)", "Swap węzłów", "Obciążenie i IO delay", "Wersja Proxmox", "Przyciski sortowania na karcie", "Sortuj gości według", "Kierunek", "Grupuj według typu (VM / LXC)", "Kolejność typów (przy grupowaniu)", "Język", "Sekcje", "Szczegóły", "Sortowanie gości", "Nazwa", "Stan (działające najpierw)", "Rosnąco ↓", "Malejąco ↑", "VM, potem kontenery", "Kontenery, potem VM", "Filtry", "Pokaż tylko tych gości (ID lub nazwa)", "Ukryj tych gości (ID lub nazwa)", "{n} z {m} gości ma przyciski zasilania.", "Nie znaleziono przycisków: włącz encje Uruchom / Wyłącz / Uruchom ponownie integracji Proxmox VE (Ustawienia → Urządzenia i usługi → gość → wyłączone encje).", "Wykryto: {n}", "Wpisz ID lub nazwę i naciśnij Enter. Aby zmienić nazwę gościa lub jego ikonę, użyj opcji guests: w YAML.", "Podsumowanie klastra (od 2 węzłów)", "Wykresy historii", "Ostatnia kopia zapasowa", "Kolumny gości", "Kolor akcentu", "Okres historii (godziny)", "Zwinięte sekcje", "Układ", "Automatycznie (2 kolumny, gdy szeroka)", "1 kolumna", "2 kolumny", "Wymaga encji „Last backup” węzła (domyślnie wyłączona: Ustawienia → Urządzenia i usługi → węzeł → wyłączone encje).", "Pokazywane od 2 węzłów."],
  cs: ["Název", "Filtrovat podle uzlu / názvu (volitelné)", "Uzly", "Virtuální stroje", "Kontejnery", "Zastavení hosté", "Upozornění (aktualizace, záloha, neúspěšné úlohy…)", "Úložiště", "Fyzické disky", "Tlačítka napájení", "IP adresa", "Doba běhu hostů", "Odznaky hostů (uzamčeno, agent, problém)", "Swap uzlů", "Zátěž a IO delay", "Verze Proxmoxu", "Tlačítka řazení na kartě", "Řadit hosty podle", "Směr", "Seskupit podle typu (VM / LXC)", "Pořadí typů (při seskupení)", "Jazyk", "Sekce", "Podrobnosti", "Řazení hostů", "Název", "Stav (běžící první)", "Vzestupně ↓", "Sestupně ↑", "VM, potom kontejnery", "Kontejnery, potom VM", "Filtry", "Zobrazit pouze tyto hosty (ID nebo název)", "Skrýt tyto hosty (ID nebo název)", "{n} z {m} hostů má tlačítka napájení.", "Nenalezeno žádné tlačítko: povolte entity Spustit / Vypnout / Restartovat integrace Proxmox VE (Nastavení → Zařízení a služby → host → zakázané entity).", "Nalezeno: {n}", "Zadejte ID nebo název a stiskněte Enter. K přejmenování hostů nebo změně ikony použijte volbu guests: v YAML.", "Přehled clusteru (od 2 uzlů)", "Křivky historie", "Poslední záloha", "Sloupce hostů", "Barva zvýraznění", "Období historie (hodiny)", "Sbalené sekce", "Rozložení", "Automaticky (2 sloupce u široké karty)", "1 sloupec", "2 sloupce", "Vyžaduje entitu „Last backup“ uzlu (ve výchozím stavu zakázána: Nastavení → Zařízení a služby → uzel → zakázané entity).", "Zobrazí se od 2 uzlů."],
  sv: ["Titel", "Filtrera på nod / namn (valfritt)", "Noder", "Virtuella maskiner", "Containrar", "Stoppade gäster", "Aviseringar (uppdateringar, säkerhetskopiering, misslyckade uppgifter…)", "Lagring", "Fysiska diskar", "Strömknappar", "IP-adress", "Gästernas drifttid", "Gästmärken (låst, agent, problem)", "Nodernas swap", "Belastning och IO delay", "Proxmox-version", "Sorteringsknappar på kortet", "Sortera gäster efter", "Riktning", "Gruppera efter typ (VM / LXC)", "Typordning (vid gruppering)", "Språk", "Sektioner", "Detaljer", "Gästsortering", "Namn", "Status (igång först)", "Stigande ↓", "Fallande ↑", "VM, sedan containrar", "Containrar, sedan VM", "Filter", "Visa endast dessa gäster (ID eller namn)", "Dölj dessa gäster (ID eller namn)", "{n} av {m} gäster har strömknappar.", "Ingen knapp hittades: aktivera entiteterna Starta / Stäng av / Starta om i Proxmox VE-integrationen (Inställningar → Enheter och tjänster → gästen → inaktiverade entiteter).", "{n} hittade", "Skriv ett ID eller namn och tryck på Enter. Använd alternativet guests: i YAML för att byta namn på gäster eller ändra deras ikon.", "Klustersammanfattning (från 2 noder)", "Historikkurvor", "Senaste säkerhetskopia", "Kolumner för gäster", "Accentfärg", "Historikperiod (timmar)", "Hopfällda sektioner", "Layout", "Automatisk (2 kolumner när bred)", "1 kolumn", "2 kolumner", "Kräver entiteten ”Last backup” för noden (inaktiverad som standard: Inställningar → Enheter och tjänster → noden → inaktiverade entiteter).", "Visas från 2 noder."],
  da: ["Titel", "Filtrer efter node / navn (valgfrit)", "Noder", "Virtuelle maskiner", "Containere", "Stoppede gæster", "Advarsler (opdateringer, sikkerhedskopi, mislykkede opgaver…)", "Lager", "Fysiske diske", "Tænd/sluk-knapper", "IP-adresse", "Gæsternes oppetid", "Gæstemærker (låst, agent, problem)", "Nodernes swap", "Belastning og IO delay", "Proxmox-version", "Sorteringsknapper på kortet", "Sortér gæster efter", "Retning", "Gruppér efter type (VM / LXC)", "Typerækkefølge (ved gruppering)", "Sprog", "Sektioner", "Detaljer", "Sortering af gæster", "Navn", "Status (kørende først)", "Stigende ↓", "Faldende ↑", "VM, derefter containere", "Containere, derefter VM", "Filtre", "Vis kun disse gæster (ID eller navn)", "Skjul disse gæster (ID eller navn)", "{n} af {m} gæster har tænd/sluk-knapper.", "Ingen knap fundet: aktivér entiteterne Start / Luk ned / Genstart i Proxmox VE-integrationen (Indstillinger → Enheder og tjenester → gæsten → deaktiverede entiteter).", "{n} fundet", "Skriv et ID eller navn og tryk på Enter. Brug indstillingen guests: i YAML til at omdøbe gæster eller ændre deres ikon.", "Klyngeoversigt (fra 2 noder)", "Historikkurver", "Seneste sikkerhedskopi", "Kolonner for gæster", "Accentfarve", "Historikperiode (timer)", "Sammenfoldede sektioner", "Layout", "Automatisk (2 kolonner når bred)", "1 kolonne", "2 kolonner", "Kræver entiteten “Last backup” for noden (deaktiveret som standard: Indstillinger → Enheder og tjenester → noden → deaktiverede entiteter).", "Vises fra 2 noder."],
  nb: ["Tittel", "Filtrer på node / navn (valgfritt)", "Noder", "Virtuelle maskiner", "Containere", "Stoppede gjester", "Varsler (oppdateringer, sikkerhetskopi, mislykkede oppgaver…)", "Lagring", "Fysiske disker", "Strømknapper", "IP-adresse", "Gjestenes oppetid", "Gjestemerker (låst, agent, problem)", "Nodenes swap", "Belastning og IO delay", "Proxmox-versjon", "Sorteringsknapper på kortet", "Sorter gjester etter", "Retning", "Grupper etter type (VM / LXC)", "Typerekkefølge (ved gruppering)", "Språk", "Seksjoner", "Detaljer", "Sortering av gjester", "Navn", "Status (kjørende først)", "Stigende ↓", "Synkende ↑", "VM, deretter containere", "Containere, deretter VM", "Filtre", "Vis bare disse gjestene (ID eller navn)", "Skjul disse gjestene (ID eller navn)", "{n} av {m} gjester har strømknapper.", "Ingen knapp funnet: aktiver entitetene Start / Slå av / Start på nytt i Proxmox VE-integrasjonen (Innstillinger → Enheter og tjenester → gjesten → deaktiverte entiteter).", "{n} funnet", "Skriv en ID eller et navn og trykk Enter. Bruk alternativet guests: i YAML for å gi gjester nytt navn eller endre ikonet.", "Klyngeoversikt (fra 2 noder)", "Historikkurver", "Siste sikkerhetskopi", "Kolonner for gjester", "Aksentfarge", "Historikkperiode (timer)", "Sammenfoldede seksjoner", "Oppsett", "Automatisk (2 kolonner når bred)", "1 kolonne", "2 kolonner", "Krever entiteten «Last backup» for noden (deaktivert som standard: Innstillinger → Enheter og tjenester → noden → deaktiverte entiteter).", "Vises fra 2 noder."],
  fi: ["Otsikko", "Suodata solmun / nimen mukaan (valinnainen)", "Solmut", "Virtuaalikoneet", "Kontit", "Pysäytetyt vieraat", "Hälytykset (päivitykset, varmuuskopiointi, epäonnistuneet tehtävät…)", "Tallennustilat", "Fyysiset levyt", "Virtapainikkeet", "IP-osoite", "Vieraiden käyttöaika", "Vieraiden merkit (lukittu, agentti, ongelma)", "Solmujen swap", "Kuorma ja IO delay", "Proxmox-versio", "Lajittelupainikkeet kortilla", "Lajittele vieraat", "Suunta", "Ryhmittele tyypin mukaan (VM / LXC)", "Tyyppien järjestys (ryhmitettäessä)", "Kieli", "Osiot", "Tiedot", "Vieraiden lajittelu", "Nimi", "Tila (käynnissä olevat ensin)", "Nouseva ↓", "Laskeva ↑", "VM:t, sitten kontit", "Kontit, sitten VM:t", "Suodattimet", "Näytä vain nämä vieraat (ID tai nimi)", "Piilota nämä vieraat (ID tai nimi)", "{n}/{m} vieraalla on virtapainikkeet.", "Painikkeita ei löytynyt: ota käyttöön Proxmox VE -integraation Käynnistä / Sammuta / Käynnistä uudelleen -entiteetit (Asetukset → Laitteet ja palvelut → vieras → käytöstä poistetut entiteetit).", "{n} löytyi", "Kirjoita ID tai nimi ja paina Enter. Nimeä vieraita uudelleen tai vaihda kuvake YAML:n guests:-asetuksella.", "Klusterin yhteenveto (vähintään 2 solmua)", "Historiakäyrät", "Viimeisin varmuuskopio", "Vieraiden sarakkeet", "Korostusväri", "Historian jakso (tuntia)", "Tiivistetyt osiot", "Asettelu", "Automaattinen (2 saraketta leveänä)", "1 sarake", "2 saraketta", "Vaatii solmun “Last backup” -entiteetin (oletuksena pois käytöstä: Asetukset → Laitteet ja palvelut → solmu → käytöstä poistetut entiteetit).", "Näytetään vähintään 2 solmulla."],
  ru: ["Заголовок", "Фильтр по узлу / имени (необязательно)", "Узлы", "Виртуальные машины", "Контейнеры", "Остановленные гости", "Оповещения (обновления, резервное копирование, неудачные задачи…)", "Хранилища", "Физические диски", "Кнопки питания", "IP-адрес", "Время работы гостей", "Значки гостей (заблокирован, агент, проблема)", "Swap узлов", "Нагрузка и IO delay", "Версия Proxmox", "Кнопки сортировки на карточке", "Сортировать гостей по", "Направление", "Группировать по типу (ВМ / LXC)", "Порядок типов (при группировке)", "Язык", "Разделы", "Подробности", "Сортировка гостей", "Имени", "Состоянию (работающие первыми)", "По возрастанию ↓", "По убыванию ↑", "ВМ, затем контейнеры", "Контейнеры, затем ВМ", "Фильтры", "Показывать только этих гостей (ID или имя)", "Скрыть этих гостей (ID или имя)", "У {n} из {m} гостей есть кнопки питания.", "Кнопки не найдены: включите сущности «Запустить / Выключить / Перезагрузить» интеграции Proxmox VE (Настройки → Устройства и службы → гость → отключённые сущности).", "Найдено: {n}", "Введите ID или имя и нажмите Enter. Чтобы переименовать гостей или сменить значок, используйте параметр guests: в YAML.", "Сводка по кластеру (от 2 узлов)", "Графики истории", "Последняя резервная копия", "Столбцы гостей", "Акцентный цвет", "Период истории (часы)", "Свёрнутые разделы", "Раскладка", "Автоматически (2 столбца при большой ширине)", "1 столбец", "2 столбца", "Нужна сущность «Last backup» узла (по умолчанию отключена: Настройки → Устройства и службы → узел → отключённые сущности).", "Показывается от 2 узлов."],
  uk: ["Заголовок", "Фільтр за вузлом / назвою (необов'язково)", "Вузли", "Віртуальні машини", "Контейнери", "Зупинені гості", "Сповіщення (оновлення, резервне копіювання, невдалі завдання…)", "Сховища", "Фізичні диски", "Кнопки живлення", "IP-адреса", "Час роботи гостей", "Значки гостей (заблоковано, агент, проблема)", "Swap вузлів", "Навантаження та IO delay", "Версія Proxmox", "Кнопки сортування на картці", "Сортувати гостей за", "Напрямок", "Групувати за типом (ВМ / LXC)", "Порядок типів (при групуванні)", "Мова", "Розділи", "Подробиці", "Сортування гостей", "Назвою", "Станом (працюючі першими)", "За зростанням ↓", "За спаданням ↑", "ВМ, потім контейнери", "Контейнери, потім ВМ", "Фільтри", "Показувати лише цих гостей (ID або назва)", "Приховати цих гостей (ID або назва)", "У {n} з {m} гостей є кнопки живлення.", "Кнопок не знайдено: увімкніть сутності «Запустити / Вимкнути / Перезавантажити» інтеграції Proxmox VE (Налаштування → Пристрої та служби → гість → вимкнені сутності).", "Знайдено: {n}", "Введіть ID або назву й натисніть Enter. Щоб перейменувати гостей або змінити значок, використовуйте параметр guests: у YAML.", "Зведення кластера (від 2 вузлів)", "Графіки історії", "Остання резервна копія", "Стовпці гостей", "Акцентний колір", "Період історії (години)", "Згорнуті розділи", "Розкладка", "Автоматично (2 стовпці за великої ширини)", "1 стовпець", "2 стовпці", "Потрібна сутність «Last backup» вузла (типово вимкнена: Налаштування → Пристрої та служби → вузол → вимкнені сутності).", "Показується від 2 вузлів."],
  tr: ["Başlık", "Düğüm / ada göre filtrele (isteğe bağlı)", "Düğümler", "Sanal makineler", "Konteynerler", "Durdurulmuş konuklar", "Uyarılar (güncellemeler, yedekleme, başarısız görevler…)", "Depolamalar", "Fiziksel diskler", "Güç düğmeleri", "IP adresi", "Konuk çalışma süresi", "Konuk rozetleri (kilitli, aracı, sorun)", "Düğüm swap", "Yük ve IO delay", "Proxmox sürümü", "Karttaki sıralama düğmeleri", "Konukları sırala", "Yön", "Türe göre grupla (VM / LXC)", "Tür sırası (gruplanınca)", "Dil", "Bölümler", "Ayrıntılar", "Konuk sıralaması", "Ad", "Durum (çalışanlar önce)", "Artan ↓", "Azalan ↑", "VM'ler, sonra konteynerler", "Konteynerler, sonra VM'ler", "Filtreler", "Yalnızca bu konukları göster (ID veya ad)", "Bu konukları gizle (ID veya ad)", "{m} konuktan {n} tanesinde güç düğmeleri var.", "Düğme bulunamadı: Proxmox VE entegrasyonunun Başlat / Kapat / Yeniden başlat varlıklarını etkinleştirin (Ayarlar → Cihazlar ve hizmetler → konuk → devre dışı varlıklar).", "{n} bulundu", "Bir ID veya ad yazıp Enter'a basın. Konukları yeniden adlandırmak veya simgelerini değiştirmek için YAML'daki guests: seçeneğini kullanın.", "Küme özeti (2 veya daha fazla düğüm)", "Geçmiş eğrileri", "Son yedekleme", "Konuk sütunları", "Vurgu rengi", "Geçmiş süresi (saat)", "Daraltılmış bölümler", "Düzen", "Otomatik (geniş olduğunda 2 sütun)", "1 sütun", "2 sütun", "Düğümün “Last backup” varlığı gerekir (varsayılan olarak devre dışı: Ayarlar → Cihazlar ve hizmetler → düğüm → devre dışı varlıklar).", "2 düğümden itibaren gösterilir."],
  ro: ["Titlu", "Filtrare după nod / nume (opțional)", "Noduri", "Mașini virtuale", "Containere", "Oaspeți opriți", "Alerte (actualizări, copie de rezervă, sarcini eșuate…)", "Stocări", "Discuri fizice", "Butoane de alimentare", "Adresă IP", "Timp de funcționare oaspeți", "Insigne oaspeți (blocat, agent, problemă)", "Swap noduri", "Încărcare și IO delay", "Versiune Proxmox", "Butoane de sortare pe card", "Sortează oaspeții după", "Sens", "Grupare după tip (VM / LXC)", "Ordinea tipurilor (la grupare)", "Limbă", "Secțiuni", "Detalii", "Sortarea oaspeților", "Nume", "Stare (cei activi primii)", "Crescător ↓", "Descrescător ↑", "VM, apoi containere", "Containere, apoi VM", "Filtre", "Afișează doar acești oaspeți (ID sau nume)", "Ascunde acești oaspeți (ID sau nume)", "{n} din {m} oaspeți au butoane de alimentare.", "Niciun buton găsit: activați entitățile Pornește / Oprește / Repornește ale integrării Proxmox VE (Setări → Dispozitive și servicii → oaspetele → entități dezactivate).", "{n} detectate", "Introduceți un ID sau un nume și apăsați Enter. Pentru a redenumi oaspeții sau a schimba pictograma, folosiți opțiunea guests: în YAML.", "Rezumatul clusterului (2 noduri sau mai multe)", "Curbe de istoric", "Ultima copie de rezervă", "Coloane oaspeți", "Culoare de accent", "Perioada istoricului (ore)", "Secțiuni restrânse", "Aspect", "Automat (2 coloane când e lat)", "1 coloană", "2 coloane", "Necesită entitatea „Last backup” a nodului (dezactivată implicit: Setări → Dispozitive și servicii → nodul → entități dezactivate).", "Afișat de la 2 noduri."],
  hu: ["Cím", "Szűrés csomópont / név szerint (opcionális)", "Csomópontok", "Virtuális gépek", "Tárolók (konténerek)", "Leállított vendégek", "Riasztások (frissítések, mentés, sikertelen feladatok…)", "Tárolók", "Fizikai lemezek", "Bekapcsoló gombok", "IP-cím", "Vendégek üzemideje", "Vendég jelvények (zárolt, ügynök, hiba)", "Csomópontok swap", "Terhelés és IO delay", "Proxmox verzió", "Rendezőgombok a kártyán", "Vendégek rendezése", "Irány", "Csoportosítás típus szerint (VM / LXC)", "Típusok sorrendje (csoportosításkor)", "Nyelv", "Szakaszok", "Részletek", "Vendégek rendezése", "Név", "Állapot (futók elöl)", "Növekvő ↓", "Csökkenő ↑", "VM-ek, majd konténerek", "Konténerek, majd VM-ek", "Szűrők", "Csak ezek a vendégek jelenjenek meg (ID vagy név)", "Ezek a vendégek legyenek elrejtve (ID vagy név)", "{m} vendégből {n}-nek van bekapcsoló gombja.", "Nem található gomb: engedélyezze a Proxmox VE integráció Indítás / Leállítás / Újraindítás entitásait (Beállítások → Eszközök és szolgáltatások → a vendég → letiltott entitások).", "{n} található", "Írjon be egy azonosítót vagy nevet, majd nyomjon Entert. Vendégek átnevezéséhez vagy ikonjuk módosításához használja a guests: beállítást YAML-ban.", "Fürt összegzése (2 vagy több csomópont)", "Előzménygörbék", "Utolsó mentés", "Vendégek oszlopai", "Kiemelőszín", "Előzmények időszaka (óra)", "Összecsukott szakaszok", "Elrendezés", "Automatikus (2 oszlop széles kártyán)", "1 oszlop", "2 oszlop", "A csomópont „Last backup” entitására van szükség (alapértelmezés szerint letiltott: Beállítások → Eszközök és szolgáltatások → a csomópont → letiltott entitások).", "2 csomóponttól jelenik meg."],
  ja: ["タイトル", "ノード／名前で絞り込み（任意）", "ノード", "仮想マシン", "コンテナ", "停止中のゲスト", "アラート（更新、バックアップ、失敗したタスクなど）", "ストレージ", "物理ディスク", "電源ボタン", "IP アドレス", "ゲストの稼働時間", "ゲストのバッジ（ロック、エージェント、問題）", "ノードのスワップ", "負荷と IO delay", "Proxmox のバージョン", "カード上の並べ替えボタン", "ゲストの並べ替え基準", "方向", "種類でグループ化（VM / LXC）", "種類の順序（グループ化時）", "言語", "セクション", "詳細", "ゲストの並べ替え", "名前", "状態（稼働中を先頭）", "昇順 ↓", "降順 ↑", "VM、次にコンテナ", "コンテナ、次に VM", "フィルター", "これらのゲストのみ表示（ID または名前）", "これらのゲストを非表示（ID または名前）", "{m} 台中 {n} 台のゲストに電源ボタンがあります。", "ボタンが見つかりません：Proxmox VE インテグレーションの「起動 / シャットダウン / 再起動」エンティティを有効にしてください（設定 → デバイスとサービス → ゲスト → 無効なエンティティ）。", "{n} 件検出", "ID または名前を入力して Enter を押します。ゲスト名やアイコンの変更は YAML の guests: オプションで行います。", "クラスターの概要（2 ノード以上）", "履歴グラフ", "最後のバックアップ", "ゲストの列数", "アクセントカラー", "履歴の期間（時間）", "折りたたむセクション", "レイアウト", "自動（幅が広い場合は 2 列）", "1 列", "2 列", "ノードの「Last backup」エンティティが必要です（既定では無効：設定 → デバイスとサービス → ノード → 無効なエンティティ）。", "2 ノード以上で表示されます。"],
  zh: ["标题", "按节点／名称筛选（可选）", "节点", "虚拟机", "容器", "已停止的客户机", "警报（更新、备份、失败任务等）", "存储", "物理磁盘", "电源按钮", "IP 地址", "客户机运行时间", "客户机徽章（锁定、代理、问题）", "节点交换分区", "负载和 IO delay", "Proxmox 版本", "卡片上的排序按钮", "客户机排序依据", "方向", "按类型分组（VM / LXC）", "类型顺序（分组时）", "语言", "分区", "详细信息", "客户机排序", "名称", "状态（运行中优先）", "升序 ↓", "降序 ↑", "先虚拟机，后容器", "先容器，后虚拟机", "筛选", "仅显示这些客户机（ID 或名称）", "隐藏这些客户机（ID 或名称）", "{m} 台客户机中有 {n} 台带电源按钮。", "未找到按钮：请启用 Proxmox VE 集成的“启动 / 关机 / 重启”实体（设置 → 设备与服务 → 客户机 → 已禁用的实体）。", "检测到 {n} 个", "输入 ID 或名称后按 Enter。要重命名客户机或更改图标，请在 YAML 中使用 guests: 选项。", "集群概览（2 个及以上节点）", "历史曲线", "上次备份", "客户机列数", "强调色", "历史时间范围（小时）", "已折叠的分区", "布局", "自动（宽度较大时为 2 列）", "1 列", "2 列", "需要节点的“Last backup”实体（默认禁用：设置 → 设备与服务 → 节点 → 已禁用的实体）。", "2 个及以上节点时显示。"],
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
    if (this._lang !== lang) { // schema only changes with the language
      this._lang = lang;
      this._form.schema = editorSchema(labels);
      this._form.computeLabel = (s) => labels[s.name] || labels[s.title] || s.name || s.title;
      const fill = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => v[k]);
      this._form.computeHelper = (s) => {
        const d = this._stats;
        if (!d) return undefined;
        if (s.name === "show_actions") {
          const g = [...d.qemu, ...d.lxc];
          const n = g.filter((x) => x.roles.btn_start || x.roles.btn_shutdown || x.roles.btn_reboot || x.roles.btn_stop).length;
          return g.length ? (n ? fill(labels.h_buttons, { n, m: g.length }) : labels.h_nobuttons) : undefined;
        }
        if (s.name === "show_storage") return fill(labels.h_found, { n: d.storage.length });
        if (s.name === "show_disks") return fill(labels.h_found, { n: d.disks.length });
        if (s.name === "include") return labels.h_filters;
        if (s.name === "show_cluster") return labels.h_cluster;
        if (s.name === "show_backup") return d.nodes.some((n) => n.roles.backup_last) ? undefined : labels.h_backup;
        return undefined;
      };
    }
    const data = { ...EDITOR_DEFAULTS, ...this._config };
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
    this._root.addEventListener("keydown", (e) => {
      const tg = e.target.closest?.("[data-toggle]");
      if (tg && (e.key === "Enter" || e.key === " ") && !e.target.closest("[data-sort]")) { e.preventDefault(); this._toggle(tg.dataset.toggle); }
    });
  }

  connectedCallback() {
    clearInterval(this._histTimer);
    this._histTimer = setInterval(() => this._loadHistory(true), 300000);
    if (this._cfg && this._hass) this._loadHistory();
  }
  disconnectedCallback() { clearInterval(this._histTimer); }

  static getStubConfig() { return { type: "custom:proxmox-card", title: "Proxmox" }; }
  static getConfigElement() { return document.createElement("proxmox-card-editor"); }

  setConfig(config) {
    this._cfg = {
      title: "Proxmox", node: "", show_nodes: true, show_qemu: true, show_lxc: true, show_stopped: true,
      show_actions: true, show_ip: true, show_uptime: true, show_badges: true, show_swap: true, show_load: true,
      show_version: true, show_alerts: true, show_storage: true, show_disks: true, show_cluster: true, show_history: true, show_backup: true, history_hours: 24, guest_columns: "auto", collapsed: [], show_sort: true, sort: "id", sort_dir: "asc", group_by_type: false, type_order: "vm_first", include: [], exclude: [], guests: {}, language: "auto", ...config,
      thresholds: Object.fromEntries(Object.entries(DEFAULT_THRESHOLDS).map(([k, v]) => [k, { ...v, ...((config.thresholds || {})[k] || {}) }])),
    };
    this._sort = null;
    this._coll = null;
    this._histKey = "";
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

  /** Group proxmoxve entities by device and classify devices. */
  _collect() {
    const h = this._hass;
    if (!h.entities || !h.devices) return null;
    const byDev = {};
    for (const e of Object.values(h.entities)) {
      if (e.platform !== "proxmoxve" || !e.device_id || e.disabled_by || e.hidden) continue;
      const role = roleOf(e);
      if (!role) continue;
      const d = (byDev[e.device_id] ||= {});
      // keep the first entity per role (prefer enabled sensor over duplicates)
      d[role] ||= e;
    }
    this._ids = new Set(Object.values(byDev).flatMap((r) => Object.values(r).map((e) => e.entity_id)));
    const nodes = [], qemu = [], lxc = [], storage = [], disks = [], clusters = [];
    for (const [devId, roles] of Object.entries(byDev)) {
      const dev = h.devices[devId];
      if (!dev) continue;
      const raw = dev.name_by_user || dev.name || "";
      const model = `${dev.model || ""}`.toLowerCase();
      const m = raw.match(/^\s*(qemu|vm|lxc|ct|node|storage|disk)\b[\s_:-]*(.*)$/i);
      const p = (m?.[1] || "").toLowerCase();
      const kind = !m && /cluster/i.test(raw) ? "cluster" : p === "storage" ? "storage" : p === "disk" ? "disk"
        : /qemu|virtual/.test(model) || p === "qemu" || p === "vm" ? "qemu"
        : /lxc|container/.test(model) || p === "lxc" || p === "ct" ? "lxc"
        : /node/.test(model) || p === "node" ? "node" : null;
      if (!kind) continue;
      if (kind === "cluster" ? !roles.cpu && !roles.mem_pct :
          kind === "storage" ? !roles.disk_pct && !roles.active : kind === "disk" ? !roles.temp && !roles.health && !roles.wearout : !roles.status && !roles.cpu) continue;
      let name = (m ? m[2] : raw).trim();
      let vmid = "", host = "";
      if (kind === "storage") { const s = name.split("/"); if (s.length > 1) { host = s.shift(); name = s.join("/"); } }
      else if (kind === "disk") { const s = name.match(/^([^:]+):\s*(.*)$/); if (s) { host = s[1]; name = s[2]; } }
      else {
        const v = name.match(/^(.*?)\s*\((\d+)\)\s*$/) || name.match(/^(.*?)\s+(\d{3,})$/);
        if (v) { name = v[1].trim() || name; vmid = v[2]; }
      }
      if (this._cfg.node && !raw.toLowerCase().includes(this._cfg.node.toLowerCase()) &&
          !(dev.via_device_id && (h.devices[dev.via_device_id]?.name || "").toLowerCase().includes(this._cfg.node.toLowerCase()))) continue;
      const item = { devId, name: name || raw, vmid, host, kind, roles };
      ({ node: nodes, qemu, lxc, storage, disk: disks, cluster: clusters })[kind].push(item);
    }
    const sort = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true });
    nodes.sort(sort);
    qemu.sort((a, b) => (Number(a.vmid) || 0) - (Number(b.vmid) || 0) || sort(a, b));
    lxc.sort((a, b) => (Number(a.vmid) || 0) - (Number(b.vmid) || 0) || sort(a, b));
    storage.sort(sort); disks.sort(sort);
    // `include` / `exclude` (lists of IDs or names) filter the guests everywhere on the card, counters included
    const list = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x).trim().toLowerCase()).filter(Boolean);
    const inc = list(this._cfg?.include), exc = list(this._cfg?.exclude);
    const hit = (g, l) => l.some((q) => q === g.vmid || g.name.toLowerCase() === q || (!/^\d+$/.test(q) && g.name.toLowerCase().includes(q)));
    const keep = (g) => (!inc.length || hit(g, inc)) && !hit(g, exc);
    return { nodes, qemu: qemu.filter(keep), lxc: lxc.filter(keep), storage, disks, cluster: clusters[0] || null };
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
    const cell = (icon, label, value, cl = "") => parts.push(`<div class="si ${cl}"><span class="ic"><ha-icon icon="${icon}"></ha-icon></span><div><b>${esc(value)}</b><small>${esc(label)}</small></div></div>`);
    if (c.show_load) {
      const l = num(this._state(r.load)), io = num(this._state(r.io));
      if (l !== null) cell("mdi:speedometer", this._t("load"), l.toFixed(2));
      if (io !== null) cell("mdi:timer-sand", this._t("io"), `${io.toFixed(1)} %`, level(io, c.thresholds.io));
    }
    if (c.show_backup && r.backup_last) {
      const when = fmtDate(this._state(r.backup_last), this._lang());
      if (when) cell("mdi:backup-restore", this._t("lastBackup"), when, this._state(r.backup_status) === "on" ? "crit wide" : "wide");
    }
    return parts.length ? `<div class="strip">${parts.join("")}</div>` : "";
  }
  _ver(n) {
    const v = this._cfg.show_version ? this._state(n.roles.version) : "";
    return v && !/^unk|^unav/.test(v) ? `<span class="ver" title="${esc(this._t("version"))}">PVE ${esc(v)}</span>` : "";
  }
  _sortState() {
    const c = this._cfg;
    // legacy `sort: type` (v0.4.0) = by ID, grouped by type
    return (this._sort ||= {
      by: SORTS.includes(c.sort) ? c.sort : "id",
      dir: c.sort_dir === "desc" ? "desc" : "asc",
      group: c.sort === "type" || !!c.group_by_type,
      first: c.type_order === "lxc_first" ? "lxc" : "vm",
    });
  }
  _ring(label, v, thr) {
    const r = 43, circ = 2 * Math.PI * r, off = circ * (1 - (v ?? 0) / 100), id = `g${this._rid = (this._rid || 0) + 1}`;
    return `<div class="ring ${v === null ? "none" : level(v, thr)}"><div class="rg"><svg viewBox="0 0 100 100"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb,var(--c) 55%,#fff)"/><stop offset="1" style="stop-color:var(--c)"/></linearGradient></defs><circle class="rf" cx="50" cy="50" r="${r - 4}"/><circle class="rt" cx="50" cy="50" r="${r}"/><circle class="rv" cx="50" cy="50" r="${r}" style="stroke:url(#${id})" stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 50 50)"/></svg><b>${v === null ? "–" : Math.round(v)}${v === null ? "" : "<small>%</small>"}</b></div><span>${label}</span></div>`;
  }
  _mini(label, v, thr) {
    return `<div class="gm"><div class="gl"><span>${label}</span><b>${v === null ? "–" : Math.round(v) + "%"}</b></div><div class="bar"><i class="${level(v, thr)}" style="width:${v ?? 0}%"></i></div></div>`;
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
  _clusterTile(data, nOn, T) {
    const cl = data.cluster, r = cl.roles;
    const quorum = this._state(r.quorate) === "off" ? `<span class="chip crit">${esc(this._t("quorumLost"))}</span>` : "";
    return `<div class="node cluster"><div class="nhead"><ha-icon icon="mdi:server-network"></ha-icon><span class="nname">${esc(this._t("cluster"))}</span>${quorum}<span class="chip ${nOn < data.nodes.length ? "warn" : ""}">${nOn}/${data.nodes.length} ${esc(this._t("online"))}</span></div>
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
    this._histWant = []; // deterministic SVG ids: identical data must give identical HTML, or the DOM is rebuilt on every HA state change
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
      html = `<div class="hdr"><div class="badge"><ha-icon icon="${ICON.proxmox}"></ha-icon></div>
        <div class="title">${esc(c.title)}</div>
        <div class="chips">
          ${data.nodes.length ? `<span class="chip ${nodeCls}">${nOn}/${data.nodes.length} ${esc(this._t("online"))}</span>` : ""}
          ${data.qemu.length ? `<span class="chip">${vmOn}/${data.qemu.length} ${esc(this._t("vms"))}</span>` : ""}
          ${data.lxc.length ? `<span class="chip">${ctOn}/${data.lxc.length} ${esc(this._t("cts"))}</span>` : ""}
        </div></div>`;

      const isOn = (e) => this._state(e) === "on";
      if (c.show_alerts) {
        const al = [];
        const upd = data.nodes.reduce((a, n) => a + (isOn(n.roles.update_avail) ? num(this._state(n.roles.updates_total)) || 1 : 0), 0);
        if (upd) al.push(["warn", `${upd} ${this._t("updates")}`]);
        if (data.nodes.some((n) => isOn(n.roles.backup_running))) al.push(["info", this._t("backup")]);
        if (c.show_backup && data.nodes.some((n) => isOn(n.roles.backup_status))) al.push(["crit", this._t("backupFailed")]);
        if (data.cluster && this._state(data.cluster.roles.quorate) === "off") al.push(["crit", this._t("quorumLost")]);
        const failed = data.nodes.reduce((a, n) => a + (num(this._state(n.roles.failed)) || 0), 0);
        if (failed) al.push(["crit", `${failed} ${this._t("failed")}`]);
        const inactive = data.storage.filter((s) => this._state(s.roles.active) === "off").length;
        if (inactive) al.push(["crit", `${inactive} ${this._t("inactive")}`]);
        const dprob = data.disks.filter((d) => isOn(d.roles.health)).length;
        if (dprob) al.push(["crit", `${dprob} ${this._t("diskProblem")}`]);
        if (al.length) html += `<div class="alerts">${al.map(([cl, tx]) => `<span class="chip ${cl}">${esc(tx)}</span>`).join("")}</div>`;
      }

      if (c.show_nodes && data.nodes.length) {
        const showCluster = c.show_cluster && data.cluster && data.nodes.length > 1;
        html += this._sec("nodes", this._t("nodes")) + (this._collapsedSet().has("nodes") ? "" : (showCluster ? this._clusterTile(data, nOn, T) : "") + `<div class="nodes">` + data.nodes.map((n) => {
          const s = statusOf(n.roles.status, this._hass);
          const up = fmtUptime(this._state(n.roles.uptime));
          return `<div class="node ${s === "off" ? "off" : ""}" data-more="${esc((n.roles.status || n.roles.cpu).entity_id)}">
            <div class="nhead"><span class="dot ${s === "on" ? "on" : s === "off" ? "off" : ""}"></span><span class="nname">${esc(n.name)}</span>${this._ver(n)}${up ?`<span class="up">${esc(up)}</span>` : ""}</div>
            <div class="rings">${this._ring(this._t("cpu"), this._pct(n, "cpu"), T.cpu)}${this._ring(this._t("ram"), this._pct(n, "mem"), T.memory)}${this._ring(this._t("disk"), this._pct(n, "disk"), T.disk)}</div>
            ${c.show_history ? this._hist(n, T) : ""}
            ${c.show_swap && n.roles.swap_pct ? this._metric(this._t("swap"), this._pct(n, "swap"), T.memory) : ""}
            ${this._xtra(n)}</div>`;
        }).join("") + `</div>`);
      }

      const shown = guests.filter((g) => c.show_stopped || statusOf(g.roles.status, this._hass) === "on");
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
      const cmp = {
        id: (a, b) => idn(a) - idn(b) || byName(a, b),
        name: (a, b) => byName(a, b) || idn(a) - idn(b),
        status: (a, b) => rank(a) - rank(b) || idn(a) - idn(b),
      }[st.by];
      // optional grouping VM / LXC (order set by `type_order`), then the chosen criterion inside each group
      const grp = (a, b) => (!st.group || a.kind === b.kind ? 0 : (a.kind === "qemu") === (st.first === "vm") ? -1 : 1);
      shown.sort((a, b) => grp(a, b) || dir * cmp(a, b));
      if (shown.length) {
        const btn = (k, on, label, arrow) => `<button class="sortbtn ${on ? "on" : ""}" data-sort="${k}">${esc(label)}${arrow}</button>`;
        const sortbar = c.show_sort && shown.length > 1 ? `<span class="sortbar">${btn("type", st.group, this._t("sortType"), "")}${SORTS.map((k) => btn(k, st.by === k, this._t("sort" + k[0].toUpperCase() + k.slice(1)), st.by === k ? (st.dir === "desc" ? " ↑" : " ↓") : "")).join("")}</span>` : "";
        html += this._sec("guests", this._t("guests"), sortbar) + (this._collapsedSet().has("guests") ? "" : `<div class="guests cols-${esc(c.guest_columns)}">` + shown.map((g) => {
          const s = statusOf(g.roles.status, this._hass);
          const on = s === "on";
          const ip = c.show_ip ? this._state(g.roles.ip) : "";
          const up = c.show_uptime && on ? fmtUptime(this._state(g.roles.uptime)) : "";
          const sub = [g.vmid && `#${g.vmid}`, g.kind === "lxc" ? "LXC" : "VM", ip && !/^unk|^unav/.test(ip) ? ip : "", up && `↑ ${up}`].filter(Boolean).join(" · ");
          const bd = [];
          if (c.show_badges) {
            if (isOn(g.roles.locked)) bd.push(["mdi:lock", this._t("locked"), ""]);
            if (on && g.roles.agent && this._state(g.roles.agent) === "off") bd.push(["mdi:lan-disconnect", this._t("agentDown"), ""]);
            if (isOn(g.roles.health)) bd.push(["mdi:alert-circle", this._t("problem"), "crit"]);
          }
          const badges = bd.map(([ic, tt, cl]) => `<span class="bd ${cl}" title="${esc(tt)}"><ha-icon icon="${ic}"></ha-icon></span>`).join("");
          const acts = c.show_actions ? [
            !on && g.roles.btn_start && ["btn_start", ICON.power, this._t("start")],
            on && g.roles.btn_shutdown && ["btn_shutdown", ICON.power, this._t("shutdown")],
            on && g.roles.btn_reboot && ["btn_reboot", ICON.restart, this._t("reboot")],
            on && g.roles.btn_stop && !g.roles.btn_shutdown && ["btn_stop", ICON.stop, this._t("stop")],
          ].filter(Boolean).map(([r, ic, label]) => {
            const id = g.roles[r].entity_id;
            const armed = this._armed === id;
            return `<button class="act ${armed ? "armed" : ""}" data-press="${esc(id)}" data-danger="${r === "btn_start" ? 0 : 1}" title="${esc(armed ? this._t("confirm") + label : label)}"><ha-icon icon="${ic}"></ha-icon></button>`;
          }).join("") : "";
          return `<div class="g ${on ? "" : s === "off" ? "off" : "other"}" data-more="${esc((g.roles.status || g.roles.cpu).entity_id)}">
            <div class="gi"><ha-icon icon="${esc(g.icon)}"></ha-icon><span class="dot ${on ? "on" : s === "off" ? "off" : ""}"></span></div>
            <div class="gn"><div>${esc(g.label)}${badges}</div><div>${esc(sub)}</div></div>
            <div class="gms">
              ${this._mini(this._t("cpu"), on ? this._pct(g, "cpu") : null, T.cpu)}
              ${this._mini(this._t("ram"), on ? this._pct(g, "mem") : null, T.memory)}
              ${this._mini(this._t("disk"), on ? this._pct(g, "disk") : null, T.disk)}
            </div>
            <div class="acts">${acts}</div></div>`;
        }).join("") + `</div>`);
      }

      if (c.show_storage && data.storage.length) {
        html += this._sec("storage", this._t("storage")) + (this._collapsedSet().has("storage") ? "" : `<div class="stors">` + data.storage.map((s) => {
          const act = this._state(s.roles.active);
          const v = this._pct(s, "disk");
          const multi = new Set(data.storage.map((x) => x.host)).size > 1 && s.host;
          return `<div class="stor ${act === "off" ? "off" : ""}" data-more="${esc((s.roles.disk_pct || s.roles.active).entity_id)}">
            <div class="sh"><span class="dot ${act === "on" ? "on" : act === "off" ? "off" : ""}"></span><span title="${esc(s.host)}">${esc(s.name)}${multi ? ` · ${esc(s.host)}` : ""}</span><b>${v === null ? "–" : Math.round(v) + "%"}</b></div>
            <div class="bar"><i class="${level(v, T.disk)}" style="width:${v ?? 0}%"></i></div></div>`;
        }).join("") + `</div>`);
      }

      if (c.show_disks && data.disks.length) {
        html += this._sec("disks", this._t("disks")) + (this._collapsedSet().has("disks") ? "" : `<div class="dks cols-${esc(c.guest_columns)}">` + data.disks.map((d) => {
          const r = d.roles;
          const temp = num(this._state(r.temp));
          const life = num(this._state(r.life_left));
          const wear = num(this._state(r.wearout)) ?? (life === null ? null : 100 - life);
          const hours = num(this._state(r.power_hours));
          const prob = isOn(r.health);
          const dot = r.health ? (prob ? "off" : "on") : "";
          return `<div class="dk" data-more="${esc((r.temp || r.health || r.wearout).entity_id)}">
            <span class="dot ${dot}"></span><span class="dn" title="${esc(d.name)}">${esc(d.name)}</span>
            <span class="tp ${level(temp, T.temperature)}">${temp === null ? "–" : Math.round(temp) + "°C"}</span>
            <div class="wr"><span>${esc(this._t("wear"))} ${wear === null ? "–" : Math.round(wear) + "%"}</span><div class="bar"><i class="${level(wear, T.wear)}" style="width:${wear ?? 0}%"></i></div></div>
            <span class="hr">${hours === null ? "" : Math.round(hours).toLocaleString() + " h"}</span></div>`;
        }).join("") + `</div>`);
      }
    }
    const accent = Array.isArray(c.accent) ? `rgb(${c.accent.join(",")})` : typeof c.accent === "string" ? c.accent.trim() : "";
    if (accent) this._root.style.setProperty("--px-accent", accent); else this._root.style.removeProperty("--px-accent");
    if (html !== this._last) { this._last = html; morph(this._root, html); }
    if (c.show_history) this._loadHistory();
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
      this._last = ""; this._render();
      return;
    }
    const so = e.target.closest("[data-sort]");
    if (so) {
      e.stopPropagation();
      const by = so.dataset.sort, cur = this._sortState();
      if (by === "type") this._sort = { ...cur, group: !cur.group }; // toggle VM / LXC grouping
      else this._sort = { ...cur, by, dir: cur.by === by ? (cur.dir === "asc" ? "desc" : "asc") : "asc" };
      this._last = ""; this._render();
      return;
    }
    const tg = e.target.closest("[data-toggle]");
    if (tg) { e.stopPropagation(); this._toggle(tg.dataset.toggle); return; }
    const more = e.target.closest("[data-more]");
    if (more) this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: more.dataset.more } }));
  }
}

if (!customElements.get("proxmox-card")) customElements.define("proxmox-card", ProxmoxCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "proxmox-card"))
  window.customCards.push({ type: "proxmox-card", name: "Proxmox Card", description: `Nodes, VMs and containers from the Proxmox VE integration (v${VERSION})`, preview: false });
