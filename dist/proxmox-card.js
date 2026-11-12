/*
 * ha-proxmox-card — Lovelace card for the Proxmox VE integration
 * https://github.com/dougiteixeira/proxmoxve
 * Vanilla JS, Shadow DOM, no dependencies.
 */
const VERSION = "0.5.1";

const DEFAULT_THRESHOLDS = {
  cpu: { warning: 70, critical: 90 },
  memory: { warning: 80, critical: 95 },
  disk: { warning: 80, critical: 90 },
  temperature: { warning: 55, critical: 70 },
  wear: { warning: 70, critical: 90 },
  io: { warning: 5, critical: 15 },
};

// Positional strings per language (see STRING_KEYS). Missing keys fall back to English.
const STRING_KEYS = ["nodes", "online", "vms", "cts", "disk", "start", "shutdown", "reboot", "stop", "noData", "noRegistry", "guests", "confirm", "storage", "disks", "swap", "load", "version", "updates", "backup", "failed", "inactive", "diskProblem", "wear", "locked", "agentDown", "problem", "sortType", "sortName", "sortStatus"];
const pack = (keys, langs) => Object.fromEntries(Object.entries(langs).map(([l, a]) => [l, Object.fromEntries(keys.map((k, i) => [k, a[i]]))]));
const STRINGS = pack(STRING_KEYS, {
  en: ["Nodes", "online", "VMs", "CTs", "Disk", "Start", "Shutdown", "Reboot", "Force stop", "No Proxmox entities found. Is the proxmoxve integration set up?", "This card needs a recent Home Assistant (entity and device registry in the frontend).", "Guests", "Confirm: ", "Storage", "Physical disks", "Swap", "Load", "Version", "updates available", "backup running", "failed tasks", "storage inactive", "disk problem", "Wear", "Locked", "Guest agent not responding", "Problem reported", "Type", "Name", "Status"],
  fr: ["Nœuds", "en ligne", "VM", "CT", "Disque", "Démarrer", "Arrêter", "Redémarrer", "Forcer l'arrêt", "Aucune entité Proxmox trouvée. L'intégration proxmoxve est-elle installée ?", "Cette carte nécessite une version récente de Home Assistant.", "Invités", "Confirmer : ", "Stockages", "Disques physiques", "Swap", "Charge", "Version", "mises à jour", "sauvegarde en cours", "tâches en échec", "stockage inactif", "disque en défaut", "Usure", "Verrouillé", "Agent invité injoignable", "Problème signalé", "Type", "Nom", "État"],
  de: ["Knoten", "online", "VMs", "CTs", "Festplatte", "Starten", "Herunterfahren", "Neustarten", "Erzwungen stoppen", "Keine Proxmox-Entitäten gefunden. Ist die Integration proxmoxve eingerichtet?", "Diese Karte benötigt ein aktuelles Home Assistant (Entitäts- und Geräteregister im Frontend).", "Gäste", "Bestätigen: ", "Speicher", "Physische Datenträger", "Swap", "Last", "Version", "Updates verfügbar", "Sicherung läuft", "fehlgeschlagene Aufgaben", "Speicher inaktiv", "Datenträgerproblem", "Verschleiß", "Gesperrt", "Gast-Agent antwortet nicht", "Problem gemeldet", "Typ", "Name", "Status"],
  es: ["Nodos", "en línea", "VM", "CT", "Disco", "Iniciar", "Apagar", "Reiniciar", "Forzar parada", "No se encontraron entidades de Proxmox. ¿Está configurada la integración proxmoxve?", "Esta tarjeta necesita una versión reciente de Home Assistant (registro de entidades y dispositivos en el frontend).", "Invitados", "Confirmar: ", "Almacenamiento", "Discos físicos", "Swap", "Carga", "Versión", "actualizaciones disponibles", "copia de seguridad en curso", "tareas fallidas", "almacenamiento inactivo", "problema de disco", "Desgaste", "Bloqueado", "El agente invitado no responde", "Problema detectado", "Tipo", "Nombre", "Estado"],
  it: ["Nodi", "online", "VM", "CT", "Disco", "Avvia", "Arresta", "Riavvia", "Arresto forzato", "Nessuna entità Proxmox trovata. L'integrazione proxmoxve è configurata?", "Questa scheda richiede una versione recente di Home Assistant (registro di entità e dispositivi nel frontend).", "Guest", "Conferma: ", "Archiviazione", "Dischi fisici", "Swap", "Carico", "Versione", "aggiornamenti disponibili", "backup in corso", "attività non riuscite", "archiviazione inattiva", "problema al disco", "Usura", "Bloccato", "Guest agent non risponde", "Problema segnalato", "Tipo", "Nome", "Stato"],
  pt: ["Nós", "online", "VMs", "CTs", "Disco", "Iniciar", "Desligar", "Reiniciar", "Forçar paragem", "Nenhuma entidade Proxmox encontrada. A integração proxmoxve está configurada?", "Este cartão requer um Home Assistant recente (registo de entidades e dispositivos no frontend).", "Convidados", "Confirmar: ", "Armazenamento", "Discos físicos", "Swap", "Carga", "Versão", "atualizações disponíveis", "cópia de segurança em curso", "tarefas com falha", "armazenamento inativo", "problema no disco", "Desgaste", "Bloqueado", "O agente convidado não responde", "Problema reportado", "Tipo", "Nome", "Estado"],
  nl: ["Nodes", "online", "VM's", "CT's", "Schijf", "Starten", "Afsluiten", "Herstarten", "Geforceerd stoppen", "Geen Proxmox-entiteiten gevonden. Is de proxmoxve-integratie ingesteld?", "Deze kaart heeft een recente Home Assistant nodig (entiteiten- en apparatenregister in de frontend).", "Gasten", "Bevestig: ", "Opslag", "Fysieke schijven", "Swap", "Belasting", "Versie", "updates beschikbaar", "back-up bezig", "mislukte taken", "opslag inactief", "schijfprobleem", "Slijtage", "Vergrendeld", "Gastagent reageert niet", "Probleem gemeld", "Type", "Naam", "Status"],
  pl: ["Węzły", "online", "VM", "CT", "Dysk", "Uruchom", "Wyłącz", "Uruchom ponownie", "Wymuś zatrzymanie", "Nie znaleziono encji Proxmox. Czy integracja proxmoxve jest skonfigurowana?", "Ta karta wymaga nowszej wersji Home Assistant (rejestr encji i urządzeń we frontendzie).", "Goście", "Potwierdź: ", "Magazyny", "Dyski fizyczne", "Swap", "Obciążenie", "Wersja", "dostępne aktualizacje", "trwa kopia zapasowa", "nieudane zadania", "magazyn nieaktywny", "problem z dyskiem", "Zużycie", "Zablokowany", "Agent gościa nie odpowiada", "Zgłoszono problem", "Typ", "Nazwa", "Stan"],
  cs: ["Uzly", "online", "VM", "CT", "Disk", "Spustit", "Vypnout", "Restartovat", "Vynutit zastavení", "Nebyly nalezeny žádné entity Proxmox. Je integrace proxmoxve nastavena?", "Tato karta vyžaduje novější Home Assistant (registr entit a zařízení ve frontendu).", "Hosté", "Potvrdit: ", "Úložiště", "Fyzické disky", "Swap", "Zátěž", "Verze", "dostupné aktualizace", "probíhá záloha", "neúspěšné úlohy", "úložiště neaktivní", "problém s diskem", "Opotřebení", "Uzamčeno", "Agent hosta neodpovídá", "Nahlášen problém", "Typ", "Název", "Stav"],
  sv: ["Noder", "online", "VM", "CT", "Disk", "Starta", "Stäng av", "Starta om", "Tvinga stopp", "Inga Proxmox-entiteter hittades. Är integrationen proxmoxve konfigurerad?", "Det här kortet kräver en nyare Home Assistant (entitets- och enhetsregister i frontend).", "Gäster", "Bekräfta: ", "Lagring", "Fysiska diskar", "Swap", "Belastning", "Version", "uppdateringar tillgängliga", "säkerhetskopiering pågår", "misslyckade uppgifter", "lagring inaktiv", "diskproblem", "Slitage", "Låst", "Gästagenten svarar inte", "Problem rapporterat", "Typ", "Namn", "Status"],
  da: ["Noder", "online", "VM", "CT", "Disk", "Start", "Luk ned", "Genstart", "Gennemtving stop", "Ingen Proxmox-entiteter fundet. Er integrationen proxmoxve sat op?", "Dette kort kræver en nyere Home Assistant (entitets- og enhedsregister i frontend).", "Gæster", "Bekræft: ", "Lager", "Fysiske diske", "Swap", "Belastning", "Version", "opdateringer tilgængelige", "sikkerhedskopiering i gang", "mislykkede opgaver", "lager inaktivt", "diskproblem", "Slid", "Låst", "Gæsteagenten svarer ikke", "Problem rapporteret", "Type", "Navn", "Status"],
  nb: ["Noder", "online", "VM", "CT", "Disk", "Start", "Slå av", "Start på nytt", "Tvungen stopp", "Fant ingen Proxmox-entiteter. Er integrasjonen proxmoxve satt opp?", "Dette kortet krever en nyere Home Assistant (entitets- og enhetsregister i frontend).", "Gjester", "Bekreft: ", "Lagring", "Fysiske disker", "Swap", "Belastning", "Versjon", "oppdateringer tilgjengelig", "sikkerhetskopiering pågår", "mislykkede oppgaver", "lagring inaktiv", "diskproblem", "Slitasje", "Låst", "Gjesteagenten svarer ikke", "Problem rapportert", "Type", "Navn", "Status"],
  fi: ["Solmut", "verkossa", "VM", "CT", "Levy", "Käynnistä", "Sammuta", "Käynnistä uudelleen", "Pakota pysäytys", "Proxmox-entiteettejä ei löytynyt. Onko proxmoxve-integraatio asennettu?", "Tämä kortti vaatii uudemman Home Assistantin (entiteetti- ja laiterekisteri käyttöliittymässä).", "Vieraat", "Vahvista: ", "Tallennustila", "Fyysiset levyt", "Swap", "Kuorma", "Versio", "päivityksiä saatavilla", "varmuuskopiointi käynnissä", "epäonnistuneet tehtävät", "tallennustila ei käytössä", "levyongelma", "Kuluminen", "Lukittu", "Vieras-agentti ei vastaa", "Ongelma ilmoitettu", "Tyyppi", "Nimi", "Tila"],
  ru: ["Узлы", "в сети", "ВМ", "КТ", "Диск", "Запустить", "Выключить", "Перезагрузить", "Принудительно остановить", "Сущности Proxmox не найдены. Настроена ли интеграция proxmoxve?", "Для этой карточки нужна свежая версия Home Assistant (реестр сущностей и устройств во фронтенде).", "Гости", "Подтвердить: ", "Хранилища", "Физические диски", "Swap", "Нагрузка", "Версия", "обновлений доступно", "идёт резервное копирование", "неудачные задачи", "хранилище неактивно", "проблема с диском", "Износ", "Заблокировано", "Гостевой агент не отвечает", "Сообщено о проблеме", "Тип", "Имя", "Состояние"],
  uk: ["Вузли", "в мережі", "ВМ", "КТ", "Диск", "Запустити", "Вимкнути", "Перезавантажити", "Примусово зупинити", "Сутності Proxmox не знайдено. Чи налаштовано інтеграцію proxmoxve?", "Для цієї картки потрібна свіжа версія Home Assistant (реєстр сутностей і пристроїв у фронтенді).", "Гості", "Підтвердити: ", "Сховища", "Фізичні диски", "Swap", "Навантаження", "Версія", "оновлень доступно", "триває резервне копіювання", "невдалі завдання", "сховище неактивне", "проблема з диском", "Знос", "Заблоковано", "Гостьовий агент не відповідає", "Повідомлено про проблему", "Тип", "Назва", "Стан"],
  tr: ["Düğümler", "çevrimiçi", "VM", "CT", "Disk", "Başlat", "Kapat", "Yeniden başlat", "Zorla durdur", "Proxmox varlığı bulunamadı. proxmoxve entegrasyonu kurulu mu?", "Bu kart yeni bir Home Assistant sürümü gerektirir (arayüzde varlık ve cihaz kaydı).", "Konuklar", "Onayla: ", "Depolama", "Fiziksel diskler", "Swap", "Yük", "Sürüm", "güncelleme mevcut", "yedekleme sürüyor", "başarısız görevler", "depolama etkin değil", "disk sorunu", "Aşınma", "Kilitli", "Konuk aracısı yanıt vermiyor", "Sorun bildirildi", "Tür", "Ad", "Durum"],
  ro: ["Noduri", "online", "VM", "CT", "Disc", "Pornește", "Oprește", "Repornește", "Oprire forțată", "Nu s-au găsit entități Proxmox. Este configurată integrarea proxmoxve?", "Acest card necesită o versiune recentă de Home Assistant (registrul de entități și dispozitive în frontend).", "Oaspeți", "Confirmă: ", "Stocare", "Discuri fizice", "Swap", "Încărcare", "Versiune", "actualizări disponibile", "copie de rezervă în curs", "sarcini eșuate", "stocare inactivă", "problemă la disc", "Uzură", "Blocat", "Agentul oaspete nu răspunde", "Problemă raportată", "Tip", "Nume", "Stare"],
  hu: ["Csomópontok", "online", "VM", "CT", "Lemez", "Indítás", "Leállítás", "Újraindítás", "Kényszerített leállítás", "Nem található Proxmox entitás. Be van állítva a proxmoxve integráció?", "Ehhez a kártyához újabb Home Assistant szükséges (entitás- és eszközregiszter a frontendben).", "Vendégek", "Megerősítés: ", "Tárolók", "Fizikai lemezek", "Swap", "Terhelés", "Verzió", "frissítés érhető el", "mentés folyamatban", "sikertelen feladatok", "tároló inaktív", "lemezprobléma", "Kopás", "Zárolva", "A vendég ügynök nem válaszol", "Hiba jelezve", "Típus", "Név", "Állapot"],
  ja: ["ノード", "オンライン", "VM", "CT", "ディスク", "起動", "シャットダウン", "再起動", "強制停止", "Proxmox エンティティが見つかりません。proxmoxve インテグレーションは設定されていますか？", "このカードには新しい Home Assistant が必要です（フロントエンドのエンティティ／デバイスレジストリ）。", "ゲスト", "確認: ", "ストレージ", "物理ディスク", "スワップ", "負荷", "バージョン", "件の更新あり", "バックアップ実行中", "失敗したタスク", "ストレージが無効", "ディスクの問題", "摩耗", "ロック中", "ゲストエージェントが応答しません", "問題が報告されました", "種類", "名前", "状態"],
  zh: ["节点", "在线", "虚拟机", "容器", "磁盘", "启动", "关机", "重启", "强制停止", "未找到 Proxmox 实体。是否已设置 proxmoxve 集成？", "此卡片需要较新版本的 Home Assistant（前端中的实体和设备注册表）。", "客户机", "确认：", "存储", "物理磁盘", "交换", "负载", "版本", "个可用更新", "正在备份", "失败的任务", "存储未激活", "磁盘故障", "磨损", "已锁定", "客户机代理无响应", "已报告问题", "类型", "名称", "状态"],
});
// strings that are identical or not translated per language
Object.assign(STRINGS.en, { cpu: "CPU", ram: "RAM", io: "IO delay", uptime: "Uptime", running: "running", stopped: "stopped", unknown: "unknown", temp: "Temp", sortId: "ID" });
const LANGUAGES = [["auto", "Auto"], ["en", "English"], ["fr", "Français"], ["de", "Deutsch"], ["es", "Español"], ["it", "Italiano"], ["pt", "Português"], ["nl", "Nederlands"], ["pl", "Polski"], ["cs", "Čeština"], ["sv", "Svenska"], ["da", "Dansk"], ["nb", "Norsk"], ["fi", "Suomi"], ["ru", "Русский"], ["uk", "Українська"], ["tr", "Türkçe"], ["ro", "Română"], ["hu", "Magyar"], ["ja", "日本語"], ["zh", "中文"]];

const css = `
:host { display:block; height:100%;
  --px-accent:#e57000; --px-accent2:#ff9a3c; --px-ok:var(--success-color,#43a047); --px-warn:var(--warning-color,#ffa600);
  --px-crit:var(--error-color,#db4437); --px-off:var(--disabled-text-color,#9e9e9e);
  --px-tile:var(--secondary-background-color,rgba(127,127,127,.08)); --px-line:color-mix(in srgb,var(--primary-text-color) 9%,transparent); }
ha-card { position:relative; height:100%; overflow:hidden; container-type:inline-size; overflow-anchor:none; padding:18px 16px 16px; box-sizing:border-box; display:flex; flex-direction:column; gap:24px; }
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
.sec::before { content:""; width:6px; height:6px; border-radius:50%; background:var(--px-accent); }
.sec::after { content:""; flex:1; height:1px; background:var(--px-line); order:1; }
.sortbar { order:2; display:flex; gap:4px; flex-wrap:wrap; text-transform:none; letter-spacing:0; }
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
.g { display:grid; grid-template-columns:40px minmax(0,1.2fr) minmax(0,2.4fr) auto; align-items:center; gap:12px; padding:10px 12px; border-radius:14px; background:var(--px-tile); border:1px solid var(--px-line); border-left:4px solid var(--px-ok); cursor:pointer; transition:background .15s; }
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
@container (max-width:520px) {
  .dk { grid-template-columns:14px minmax(0,1fr) auto minmax(0,1fr); } .dk .hr { display:none; }
  .g { grid-template-columns:40px minmax(0,1fr) auto; row-gap:8px; } .g .gms { grid-column:1 / -1; grid-row:2; }
}
@container (max-width:340px) {
  .badge { width:38px; height:38px; } .chips { display:none; } .g .gms { gap:8px; }
}
@media (prefers-reduced-motion:reduce) { .bar > i, .rv, .node, .stor { transition:none; } }
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
      for (const at of [...na.attributes]) if (!nb.hasAttribute(at.name)) na.removeAttribute(at.name);
      for (const at of nb.attributes) if (na.getAttribute(at.name) !== at.value) na.setAttribute(at.name, at.value);
      patchChildren(na, nb);
    }
  }
}

/** Roles recognised from the exact translation key of the integration. */
const EXTRA_ROLES = {
  backup_running: "backup_running", failed_tasks_count: "failed", update_avail: "update_avail", updates_total: "updates_total",
  swap_used_perc: "swap_pct", load_1m: "load", io_wait: "io", version: "version", locked: "locked", guest_agent: "agent",
  health: "health", storage_active: "active", temperature: "temp", disk_wearout: "wearout", life_left: "life_left", power_hours: "power_hours",
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
  sort: "id", sort_dir: "asc", group_by_type: false, type_order: "vm_first", show_sort: true,
  title: "Proxmox", node: "", show_nodes: true, show_qemu: true, show_lxc: true, show_stopped: true, show_actions: true, show_ip: true,
  show_uptime: true, show_badges: true, show_alerts: true, show_storage: true, show_disks: true, show_swap: true, show_load: true,
  show_version: true, language: "auto",
};
const bool = (name) => ({ name, selector: { boolean: {} } });
const editorSchema = (L) => [
  { name: "title", selector: { text: {} } },
  { name: "node", selector: { text: {} } },
  { type: "expandable", name: "", title: L.Sections, icon: "mdi:view-dashboard-outline", expanded: true, schema: [
    { type: "grid", name: "", schema: ["show_nodes", "show_qemu", "show_lxc", "show_stopped", "show_alerts", "show_storage", "show_disks"].map(bool) },
  ] },
  { type: "expandable", name: "", title: L.Details, icon: "mdi:tune-variant", expanded: true, schema: [
    { type: "grid", name: "", schema: ["show_actions", "show_ip", "show_uptime", "show_badges", "show_swap", "show_load", "show_version", "show_sort"].map(bool) },
  ] },
  { type: "expandable", name: "", title: L.Sort, icon: "mdi:sort", expanded: true, schema: [
    { name: "sort", selector: { select: { options: [{ value: "id", label: "ID" }, { value: "name", label: L.o_name }, { value: "status", label: L.o_status }], mode: "dropdown" } } },
    { name: "sort_dir", selector: { select: { options: [{ value: "asc", label: L.o_asc }, { value: "desc", label: L.o_desc }], mode: "dropdown" } } },
    bool("group_by_type"),
    { name: "type_order", selector: { select: { options: [{ value: "vm_first", label: L.o_vm }, { value: "lxc_first", label: L.o_lxc }], mode: "dropdown" } } },
  ] },
  { name: "language", selector: { select: { options: LANGUAGES.map(([value, label]) => ({ value, label })), mode: "dropdown" } } },
];
const EDITOR_KEYS = ["title", "node", "show_nodes", "show_qemu", "show_lxc", "show_stopped", "show_alerts", "show_storage", "show_disks", "show_actions", "show_ip", "show_uptime", "show_badges", "show_swap", "show_load", "show_version", "show_sort", "sort", "sort_dir", "group_by_type", "type_order", "language", "Sections", "Details", "Sort", "o_name", "o_status", "o_asc", "o_desc", "o_vm", "o_lxc"];
const EDITOR_LABELS = pack(EDITOR_KEYS, {
  en: ["Title", "Filter by node / name (optional)", "Nodes", "Virtual machines", "Containers", "Stopped guests", "Alerts (updates, backup, failed tasks…)", "Storages", "Physical disks", "Power buttons", "IP address", "Guest uptime", "Guest badges (locked, agent, problem)", "Node swap", "Load and IO delay", "Proxmox version", "Sort buttons on the card", "Sort guests by", "Direction", "Group by type (VM / LXC)", "Type order (when grouped)", "Language", "Sections", "Details", "Guest sort", "Name", "Status (running first)", "Ascending ↓", "Descending ↑", "VMs, then containers", "Containers, then VMs"],
  fr: ["Titre", "Filtrer par nœud / nom (facultatif)", "Nœuds", "Machines virtuelles", "Conteneurs", "Invités arrêtés", "Alertes (mises à jour, sauvegarde, tâches en échec…)", "Stockages", "Disques physiques", "Boutons marche / arrêt", "Adresse IP", "Uptime des invités", "Badges des invités (verrouillé, agent, problème)", "Swap des nœuds", "Charge et IO delay", "Version de Proxmox", "Boutons de tri sur la carte", "Trier les invités par", "Sens", "Regrouper par type (VM / LXC)", "Ordre des types (si regroupé)", "Langue", "Sections", "Détails", "Tri des invités", "Nom", "État (actifs d'abord)", "Croissant ↓", "Décroissant ↑", "VM, puis conteneurs", "Conteneurs, puis VM"],
  de: ["Titel", "Nach Knoten / Name filtern (optional)", "Knoten", "Virtuelle Maschinen", "Container", "Gestoppte Gäste", "Warnungen (Updates, Sicherung, fehlgeschlagene Aufgaben …)", "Speicher", "Physische Datenträger", "Ein-/Aus-Schaltflächen", "IP-Adresse", "Gast-Laufzeit", "Gast-Badges (gesperrt, Agent, Problem)", "Knoten-Swap", "Last und IO-Delay", "Proxmox-Version", "Sortier-Schaltflächen auf der Karte", "Gäste sortieren nach", "Richtung", "Nach Typ gruppieren (VM / LXC)", "Reihenfolge der Typen (bei Gruppierung)", "Sprache", "Bereiche", "Details", "Gäste sortieren", "Name", "Status (laufende zuerst)", "Aufsteigend ↓", "Absteigend ↑", "VMs, dann Container", "Container, dann VMs"],
  es: ["Título", "Filtrar por nodo / nombre (opcional)", "Nodos", "Máquinas virtuales", "Contenedores", "Invitados detenidos", "Alertas (actualizaciones, copia de seguridad, tareas fallidas…)", "Almacenamientos", "Discos físicos", "Botones de encendido", "Dirección IP", "Tiempo activo de invitados", "Insignias de invitados (bloqueado, agente, problema)", "Swap de los nodos", "Carga e IO delay", "Versión de Proxmox", "Botones de orden en la tarjeta", "Ordenar invitados por", "Sentido", "Agrupar por tipo (VM / LXC)", "Orden de los tipos (si se agrupa)", "Idioma", "Secciones", "Detalles", "Orden de invitados", "Nombre", "Estado (en ejecución primero)", "Ascendente ↓", "Descendente ↑", "VM, luego contenedores", "Contenedores, luego VM"],
  it: ["Titolo", "Filtra per nodo / nome (facoltativo)", "Nodi", "Macchine virtuali", "Container", "Guest arrestati", "Avvisi (aggiornamenti, backup, attività non riuscite…)", "Archiviazioni", "Dischi fisici", "Pulsanti di alimentazione", "Indirizzo IP", "Uptime dei guest", "Badge dei guest (bloccato, agent, problema)", "Swap dei nodi", "Carico e IO delay", "Versione di Proxmox", "Pulsanti di ordinamento sulla scheda", "Ordina i guest per", "Direzione", "Raggruppa per tipo (VM / LXC)", "Ordine dei tipi (se raggruppati)", "Lingua", "Sezioni", "Dettagli", "Ordinamento guest", "Nome", "Stato (attivi per primi)", "Crescente ↓", "Decrescente ↑", "VM, poi container", "Container, poi VM"],
  pt: ["Título", "Filtrar por nó / nome (opcional)", "Nós", "Máquinas virtuais", "Contentores", "Convidados parados", "Alertas (atualizações, cópia de segurança, tarefas com falha…)", "Armazenamentos", "Discos físicos", "Botões de energia", "Endereço IP", "Tempo de atividade dos convidados", "Distintivos dos convidados (bloqueado, agente, problema)", "Swap dos nós", "Carga e IO delay", "Versão do Proxmox", "Botões de ordenação no cartão", "Ordenar convidados por", "Sentido", "Agrupar por tipo (VM / LXC)", "Ordem dos tipos (se agrupado)", "Idioma", "Secções", "Detalhes", "Ordenação dos convidados", "Nome", "Estado (em execução primeiro)", "Ascendente ↓", "Descendente ↑", "VMs, depois contentores", "Contentores, depois VMs"],
  nl: ["Titel", "Filteren op node / naam (optioneel)", "Nodes", "Virtuele machines", "Containers", "Gestopte gasten", "Meldingen (updates, back-up, mislukte taken…)", "Opslag", "Fysieke schijven", "Aan/uit-knoppen", "IP-adres", "Uptime van gasten", "Badges van gasten (vergrendeld, agent, probleem)", "Swap van nodes", "Belasting en IO-delay", "Proxmox-versie", "Sorteerknoppen op de kaart", "Gasten sorteren op", "Richting", "Groeperen op type (VM / LXC)", "Volgorde van typen (bij groeperen)", "Taal", "Secties", "Details", "Sortering van gasten", "Naam", "Status (actieve eerst)", "Oplopend ↓", "Aflopend ↑", "VM's, dan containers", "Containers, dan VM's"],
  pl: ["Tytuł", "Filtruj po węźle / nazwie (opcjonalnie)", "Węzły", "Maszyny wirtualne", "Kontenery", "Zatrzymani goście", "Alerty (aktualizacje, kopia zapasowa, nieudane zadania…)", "Magazyny", "Dyski fizyczne", "Przyciski zasilania", "Adres IP", "Czas działania gości", "Odznaki gości (zablokowany, agent, problem)", "Swap węzłów", "Obciążenie i IO delay", "Wersja Proxmox", "Przyciski sortowania na karcie", "Sortuj gości według", "Kierunek", "Grupuj według typu (VM / LXC)", "Kolejność typów (przy grupowaniu)", "Język", "Sekcje", "Szczegóły", "Sortowanie gości", "Nazwa", "Stan (działające najpierw)", "Rosnąco ↓", "Malejąco ↑", "VM, potem kontenery", "Kontenery, potem VM"],
  cs: ["Název", "Filtrovat podle uzlu / názvu (volitelné)", "Uzly", "Virtuální stroje", "Kontejnery", "Zastavení hosté", "Upozornění (aktualizace, záloha, neúspěšné úlohy…)", "Úložiště", "Fyzické disky", "Tlačítka napájení", "IP adresa", "Doba běhu hostů", "Odznaky hostů (uzamčeno, agent, problém)", "Swap uzlů", "Zátěž a IO delay", "Verze Proxmoxu", "Tlačítka řazení na kartě", "Řadit hosty podle", "Směr", "Seskupit podle typu (VM / LXC)", "Pořadí typů (při seskupení)", "Jazyk", "Sekce", "Podrobnosti", "Řazení hostů", "Název", "Stav (běžící první)", "Vzestupně ↓", "Sestupně ↑", "VM, potom kontejnery", "Kontejnery, potom VM"],
  sv: ["Titel", "Filtrera på nod / namn (valfritt)", "Noder", "Virtuella maskiner", "Containrar", "Stoppade gäster", "Aviseringar (uppdateringar, säkerhetskopiering, misslyckade uppgifter…)", "Lagring", "Fysiska diskar", "Strömknappar", "IP-adress", "Gästernas drifttid", "Gästmärken (låst, agent, problem)", "Nodernas swap", "Belastning och IO delay", "Proxmox-version", "Sorteringsknappar på kortet", "Sortera gäster efter", "Riktning", "Gruppera efter typ (VM / LXC)", "Typordning (vid gruppering)", "Språk", "Sektioner", "Detaljer", "Gästsortering", "Namn", "Status (igång först)", "Stigande ↓", "Fallande ↑", "VM, sedan containrar", "Containrar, sedan VM"],
  da: ["Titel", "Filtrer efter node / navn (valgfrit)", "Noder", "Virtuelle maskiner", "Containere", "Stoppede gæster", "Advarsler (opdateringer, sikkerhedskopi, mislykkede opgaver…)", "Lager", "Fysiske diske", "Tænd/sluk-knapper", "IP-adresse", "Gæsternes oppetid", "Gæstemærker (låst, agent, problem)", "Nodernes swap", "Belastning og IO delay", "Proxmox-version", "Sorteringsknapper på kortet", "Sortér gæster efter", "Retning", "Gruppér efter type (VM / LXC)", "Typerækkefølge (ved gruppering)", "Sprog", "Sektioner", "Detaljer", "Sortering af gæster", "Navn", "Status (kørende først)", "Stigende ↓", "Faldende ↑", "VM, derefter containere", "Containere, derefter VM"],
  nb: ["Tittel", "Filtrer på node / navn (valgfritt)", "Noder", "Virtuelle maskiner", "Containere", "Stoppede gjester", "Varsler (oppdateringer, sikkerhetskopi, mislykkede oppgaver…)", "Lagring", "Fysiske disker", "Strømknapper", "IP-adresse", "Gjestenes oppetid", "Gjestemerker (låst, agent, problem)", "Nodenes swap", "Belastning og IO delay", "Proxmox-versjon", "Sorteringsknapper på kortet", "Sorter gjester etter", "Retning", "Grupper etter type (VM / LXC)", "Typerekkefølge (ved gruppering)", "Språk", "Seksjoner", "Detaljer", "Sortering av gjester", "Navn", "Status (kjørende først)", "Stigende ↓", "Synkende ↑", "VM, deretter containere", "Containere, deretter VM"],
  fi: ["Otsikko", "Suodata solmun / nimen mukaan (valinnainen)", "Solmut", "Virtuaalikoneet", "Kontit", "Pysäytetyt vieraat", "Hälytykset (päivitykset, varmuuskopiointi, epäonnistuneet tehtävät…)", "Tallennustilat", "Fyysiset levyt", "Virtapainikkeet", "IP-osoite", "Vieraiden käyttöaika", "Vieraiden merkit (lukittu, agentti, ongelma)", "Solmujen swap", "Kuorma ja IO delay", "Proxmox-versio", "Lajittelupainikkeet kortilla", "Lajittele vieraat", "Suunta", "Ryhmittele tyypin mukaan (VM / LXC)", "Tyyppien järjestys (ryhmitettäessä)", "Kieli", "Osiot", "Tiedot", "Vieraiden lajittelu", "Nimi", "Tila (käynnissä olevat ensin)", "Nouseva ↓", "Laskeva ↑", "VM:t, sitten kontit", "Kontit, sitten VM:t"],
  ru: ["Заголовок", "Фильтр по узлу / имени (необязательно)", "Узлы", "Виртуальные машины", "Контейнеры", "Остановленные гости", "Оповещения (обновления, резервное копирование, неудачные задачи…)", "Хранилища", "Физические диски", "Кнопки питания", "IP-адрес", "Время работы гостей", "Значки гостей (заблокирован, агент, проблема)", "Swap узлов", "Нагрузка и IO delay", "Версия Proxmox", "Кнопки сортировки на карточке", "Сортировать гостей по", "Направление", "Группировать по типу (ВМ / LXC)", "Порядок типов (при группировке)", "Язык", "Разделы", "Подробности", "Сортировка гостей", "Имени", "Состоянию (работающие первыми)", "По возрастанию ↓", "По убыванию ↑", "ВМ, затем контейнеры", "Контейнеры, затем ВМ"],
  uk: ["Заголовок", "Фільтр за вузлом / назвою (необов'язково)", "Вузли", "Віртуальні машини", "Контейнери", "Зупинені гості", "Сповіщення (оновлення, резервне копіювання, невдалі завдання…)", "Сховища", "Фізичні диски", "Кнопки живлення", "IP-адреса", "Час роботи гостей", "Значки гостей (заблоковано, агент, проблема)", "Swap вузлів", "Навантаження та IO delay", "Версія Proxmox", "Кнопки сортування на картці", "Сортувати гостей за", "Напрямок", "Групувати за типом (ВМ / LXC)", "Порядок типів (при групуванні)", "Мова", "Розділи", "Подробиці", "Сортування гостей", "Назвою", "Станом (працюючі першими)", "За зростанням ↓", "За спаданням ↑", "ВМ, потім контейнери", "Контейнери, потім ВМ"],
  tr: ["Başlık", "Düğüm / ada göre filtrele (isteğe bağlı)", "Düğümler", "Sanal makineler", "Konteynerler", "Durdurulmuş konuklar", "Uyarılar (güncellemeler, yedekleme, başarısız görevler…)", "Depolamalar", "Fiziksel diskler", "Güç düğmeleri", "IP adresi", "Konuk çalışma süresi", "Konuk rozetleri (kilitli, aracı, sorun)", "Düğüm swap", "Yük ve IO delay", "Proxmox sürümü", "Karttaki sıralama düğmeleri", "Konukları sırala", "Yön", "Türe göre grupla (VM / LXC)", "Tür sırası (gruplanınca)", "Dil", "Bölümler", "Ayrıntılar", "Konuk sıralaması", "Ad", "Durum (çalışanlar önce)", "Artan ↓", "Azalan ↑", "VM'ler, sonra konteynerler", "Konteynerler, sonra VM'ler"],
  ro: ["Titlu", "Filtrare după nod / nume (opțional)", "Noduri", "Mașini virtuale", "Containere", "Oaspeți opriți", "Alerte (actualizări, copie de rezervă, sarcini eșuate…)", "Stocări", "Discuri fizice", "Butoane de alimentare", "Adresă IP", "Timp de funcționare oaspeți", "Insigne oaspeți (blocat, agent, problemă)", "Swap noduri", "Încărcare și IO delay", "Versiune Proxmox", "Butoane de sortare pe card", "Sortează oaspeții după", "Sens", "Grupare după tip (VM / LXC)", "Ordinea tipurilor (la grupare)", "Limbă", "Secțiuni", "Detalii", "Sortarea oaspeților", "Nume", "Stare (cei activi primii)", "Crescător ↓", "Descrescător ↑", "VM, apoi containere", "Containere, apoi VM"],
  hu: ["Cím", "Szűrés csomópont / név szerint (opcionális)", "Csomópontok", "Virtuális gépek", "Tárolók (konténerek)", "Leállított vendégek", "Riasztások (frissítések, mentés, sikertelen feladatok…)", "Tárolók", "Fizikai lemezek", "Bekapcsoló gombok", "IP-cím", "Vendégek üzemideje", "Vendég jelvények (zárolt, ügynök, hiba)", "Csomópontok swap", "Terhelés és IO delay", "Proxmox verzió", "Rendezőgombok a kártyán", "Vendégek rendezése", "Irány", "Csoportosítás típus szerint (VM / LXC)", "Típusok sorrendje (csoportosításkor)", "Nyelv", "Szakaszok", "Részletek", "Vendégek rendezése", "Név", "Állapot (futók elöl)", "Növekvő ↓", "Csökkenő ↑", "VM-ek, majd konténerek", "Konténerek, majd VM-ek"],
  ja: ["タイトル", "ノード／名前で絞り込み（任意）", "ノード", "仮想マシン", "コンテナ", "停止中のゲスト", "アラート（更新、バックアップ、失敗したタスクなど）", "ストレージ", "物理ディスク", "電源ボタン", "IP アドレス", "ゲストの稼働時間", "ゲストのバッジ（ロック、エージェント、問題）", "ノードのスワップ", "負荷と IO delay", "Proxmox のバージョン", "カード上の並べ替えボタン", "ゲストの並べ替え基準", "方向", "種類でグループ化（VM / LXC）", "種類の順序（グループ化時）", "言語", "セクション", "詳細", "ゲストの並べ替え", "名前", "状態（稼働中を先頭）", "昇順 ↓", "降順 ↑", "VM、次にコンテナ", "コンテナ、次に VM"],
  zh: ["标题", "按节点／名称筛选（可选）", "节点", "虚拟机", "容器", "已停止的客户机", "警报（更新、备份、失败任务等）", "存储", "物理磁盘", "电源按钮", "IP 地址", "客户机运行时间", "客户机徽章（锁定、代理、问题）", "节点交换分区", "负载和 IO delay", "Proxmox 版本", "卡片上的排序按钮", "客户机排序依据", "方向", "按类型分组（VM / LXC）", "类型顺序（分组时）", "语言", "分区", "详细信息", "客户机排序", "名称", "状态（运行中优先）", "升序 ↓", "降序 ↑", "先虚拟机，后容器", "先容器，后虚拟机"],
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
        for (const [k, v] of Object.entries(e.detail.value || {})) {
          if (k in EDITOR_DEFAULTS && v === EDITOR_DEFAULTS[k] && !(k in this._config)) continue; // keep YAML tidy
          config[k] = v;
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const lang = ((this._config.language && this._config.language !== "auto" ? this._config.language : this._hass?.locale?.language || this._hass?.language) || "en").slice(0, 2);
    const labels = { ...EDITOR_LABELS.en, ...(EDITOR_LABELS[lang] || {}) };
    this._form.hass = this._hass;
    if (this._lang !== lang) { // schema only changes with the language
      this._lang = lang;
      this._form.schema = editorSchema(labels);
      this._form.computeLabel = (s) => labels[s.name] || labels[s.title] || s.name || s.title;
    }
    const data = { ...EDITOR_DEFAULTS, ...this._config };
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
  }

  static getStubConfig() { return { type: "custom:proxmox-card", title: "Proxmox" }; }
  static getConfigElement() { return document.createElement("proxmox-card-editor"); }

  setConfig(config) {
    this._cfg = {
      title: "Proxmox", node: "", show_nodes: true, show_qemu: true, show_lxc: true, show_stopped: true,
      show_actions: true, show_ip: true, show_uptime: true, show_badges: true, show_swap: true, show_load: true,
      show_version: true, show_alerts: true, show_storage: true, show_disks: true, show_sort: true, sort: "id", sort_dir: "asc", group_by_type: false, type_order: "vm_first", language: "auto", ...config,
      thresholds: Object.fromEntries(Object.entries(DEFAULT_THRESHOLDS).map(([k, v]) => [k, { ...v, ...((config.thresholds || {})[k] || {}) }])),
    };
    this._sort = null;
    this._last = "";
    if (this._hass) this._render();
  }

  set hass(hass) { this._hass = hass; this._render(); }
  getCardSize() { return 6; }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  _t(key) {
    const l = this._cfg.language === "auto" ? (this._hass.locale?.language || this._hass.language || "en") : this._cfg.language;
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
    const nodes = [], qemu = [], lxc = [], storage = [], disks = [];
    for (const [devId, roles] of Object.entries(byDev)) {
      const dev = h.devices[devId];
      if (!dev) continue;
      const raw = dev.name_by_user || dev.name || "";
      const model = `${dev.model || ""}`.toLowerCase();
      const m = raw.match(/^\s*(qemu|vm|lxc|ct|node|storage|disk)\b[\s_:-]*(.*)$/i);
      const p = (m?.[1] || "").toLowerCase();
      const kind = p === "storage" ? "storage" : p === "disk" ? "disk"
        : /qemu|virtual/.test(model) || p === "qemu" || p === "vm" ? "qemu"
        : /lxc|container/.test(model) || p === "lxc" || p === "ct" ? "lxc"
        : /node/.test(model) || p === "node" ? "node" : null;
      if (!kind) continue;
      if (kind === "storage" ? !roles.disk_pct && !roles.active : kind === "disk" ? !roles.temp && !roles.health && !roles.wearout : !roles.status && !roles.cpu) continue;
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
      ({ node: nodes, qemu, lxc, storage, disk: disks })[kind].push(item);
    }
    const sort = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true });
    nodes.sort(sort);
    qemu.sort((a, b) => (Number(a.vmid) || 0) - (Number(b.vmid) || 0) || sort(a, b));
    lxc.sort((a, b) => (Number(a.vmid) || 0) - (Number(b.vmid) || 0) || sort(a, b));
    storage.sort(sort); disks.sort(sort);
    return { nodes, qemu, lxc, storage, disks };
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

  _render() {
    if (!this._cfg || !this._hass) return;
    this._rid = 0; // deterministic SVG ids: identical data must give identical HTML, or the DOM is rebuilt on every HA state change
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
        const failed = data.nodes.reduce((a, n) => a + (num(this._state(n.roles.failed)) || 0), 0);
        if (failed) al.push(["crit", `${failed} ${this._t("failed")}`]);
        const inactive = data.storage.filter((s) => this._state(s.roles.active) === "off").length;
        if (inactive) al.push(["crit", `${inactive} ${this._t("inactive")}`]);
        const dprob = data.disks.filter((d) => isOn(d.roles.health)).length;
        if (dprob) al.push(["crit", `${dprob} ${this._t("diskProblem")}`]);
        if (al.length) html += `<div class="alerts">${al.map(([cl, tx]) => `<span class="chip ${cl}">${esc(tx)}</span>`).join("")}</div>`;
      }

      if (c.show_nodes && data.nodes.length) {
        html += `<div class="sec">${esc(this._t("nodes"))}</div><div class="nodes">` + data.nodes.map((n) => {
          const s = statusOf(n.roles.status, this._hass);
          const up = fmtUptime(this._state(n.roles.uptime));
          return `<div class="node ${s === "off" ? "off" : ""}" data-more="${esc((n.roles.status || n.roles.cpu).entity_id)}">
            <div class="nhead"><span class="dot ${s === "on" ? "on" : s === "off" ? "off" : ""}"></span><span class="nname">${esc(n.name)}</span>${this._ver(n)}${up ?`<span class="up">${esc(up)}</span>` : ""}</div>
            <div class="rings">${this._ring(this._t("cpu"), this._pct(n, "cpu"), T.cpu)}${this._ring(this._t("ram"), this._pct(n, "mem"), T.memory)}${this._ring(this._t("disk"), this._pct(n, "disk"), T.disk)}</div>
            ${c.show_swap && n.roles.swap_pct ? this._metric(this._t("swap"), this._pct(n, "swap"), T.memory) : ""}
            ${this._xtra(n)}</div>`;
        }).join("") + `</div>`;
      }

      const shown = guests.filter((g) => c.show_stopped || statusOf(g.roles.status, this._hass) === "on");
      const st = this._sortState(), dir = st.dir === "desc" ? -1 : 1;
      const idn = (g) => Number(g.vmid) || 0, byName = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true });
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
        html += `<div class="sec">${esc(this._t("guests"))}${sortbar}</div><div class="guests">` + shown.map((g) => {
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
            <div class="gi"><ha-icon icon="${g.kind === "lxc" ? ICON.ct : ICON.vm}"></ha-icon><span class="dot ${on ? "on" : s === "off" ? "off" : ""}"></span></div>
            <div class="gn"><div>${esc(g.name)}${badges}</div><div>${esc(sub)}</div></div>
            <div class="gms">
              ${this._mini(this._t("cpu"), on ? this._pct(g, "cpu") : null, T.cpu)}
              ${this._mini(this._t("ram"), on ? this._pct(g, "mem") : null, T.memory)}
              ${this._mini(this._t("disk"), on ? this._pct(g, "disk") : null, T.disk)}
            </div>
            <div class="acts">${acts}</div></div>`;
        }).join("") + `</div>`;
      }

      if (c.show_storage && data.storage.length) {
        html += `<div class="sec">${esc(this._t("storage"))}</div><div class="stors">` + data.storage.map((s) => {
          const act = this._state(s.roles.active);
          const v = this._pct(s, "disk");
          const multi = new Set(data.storage.map((x) => x.host)).size > 1 && s.host;
          return `<div class="stor ${act === "off" ? "off" : ""}" data-more="${esc((s.roles.disk_pct || s.roles.active).entity_id)}">
            <div class="sh"><span class="dot ${act === "on" ? "on" : act === "off" ? "off" : ""}"></span><span title="${esc(s.host)}">${esc(s.name)}${multi ? ` · ${esc(s.host)}` : ""}</span><b>${v === null ? "–" : Math.round(v) + "%"}</b></div>
            <div class="bar"><i class="${level(v, T.disk)}" style="width:${v ?? 0}%"></i></div></div>`;
        }).join("") + `</div>`;
      }

      if (c.show_disks && data.disks.length) {
        html += `<div class="sec">${esc(this._t("disks"))}</div><div class="dks">` + data.disks.map((d) => {
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
        }).join("") + `</div>`;
      }
    }
    if (html !== this._last) { this._last = html; morph(this._root, html); }
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
    const more = e.target.closest("[data-more]");
    if (more) this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: more.dataset.more } }));
  }
}

if (!customElements.get("proxmox-card")) customElements.define("proxmox-card", ProxmoxCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "proxmox-card"))
  window.customCards.push({ type: "proxmox-card", name: "Proxmox Card", description: `Nodes, VMs and containers from the Proxmox VE integration (v${VERSION})`, preview: false });
