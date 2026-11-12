/*
 * ha-proxmox-card — Lovelace card for the Proxmox VE integration
 * https://github.com/dougiteixeira/proxmoxve
 * Vanilla JS, Shadow DOM, no dependencies.
 */
const VERSION = "0.1.0";

const DEFAULT_THRESHOLDS = {
  cpu: { warning: 70, critical: 90 },
  memory: { warning: 80, critical: 95 },
  disk: { warning: 80, critical: 90 },
};

const STRINGS = {
  en: { nodes: "Nodes", online: "online", running: "running", vms: "VMs", cts: "CTs", cpu: "CPU", ram: "RAM", disk: "Disk", uptime: "Uptime", start: "Start", shutdown: "Shutdown", reboot: "Reboot", stop: "Force stop", noData: "No Proxmox entities found. Is the proxmoxve integration set up?", noRegistry: "This card needs a recent Home Assistant (entity and device registry in the frontend).", guests: "Guests", stopped: "stopped", unknown: "unknown", confirm: "Confirm: " },
  fr: { nodes: "Nœuds", online: "en ligne", running: "actifs", vms: "VM", cts: "CT", cpu: "CPU", ram: "RAM", disk: "Disque", uptime: "Uptime", start: "Démarrer", shutdown: "Arrêter", reboot: "Redémarrer", stop: "Forcer l'arrêt", noData: "Aucune entité Proxmox trouvée. L'intégration proxmoxve est-elle installée ?", noRegistry: "Cette carte nécessite une version récente de Home Assistant.", guests: "Invités", stopped: "arrêté", unknown: "inconnu", confirm: "Confirmer : " },
};

const css = `
:host { display:block; height:100%;
  --px-accent:#e57000; --px-ok:var(--success-color,#43a047); --px-warn:var(--warning-color,#ffa600);
  --px-crit:var(--error-color,#db4437); --px-off:var(--disabled-text-color,#9e9e9e); }
ha-card { height:100%; overflow:hidden; container-type:inline-size; padding:12px; box-sizing:border-box; display:flex; flex-direction:column; gap:12px; }
.hdr { display:flex; align-items:center; gap:10px; }
.badge { width:40px; height:40px; border-radius:50%; flex:none; display:grid; place-items:center;
  background:color-mix(in srgb,var(--px-accent) 16%,transparent); color:var(--px-accent); }
.title { font-size:16px; font-weight:500; color:var(--primary-text-color); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.chips { display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }
.chip { font-size:11px; padding:3px 9px; border-radius:12px; background:color-mix(in srgb,var(--px-ok) 15%,transparent); color:color-mix(in srgb,var(--px-ok) 60%,var(--primary-text-color)); white-space:nowrap; }
.chip.warn { background:color-mix(in srgb,var(--px-warn) 18%,transparent); color:color-mix(in srgb,var(--px-warn) 60%,var(--primary-text-color)); }
.chip.crit { background:color-mix(in srgb,var(--px-crit) 16%,transparent); color:color-mix(in srgb,var(--px-crit) 60%,var(--primary-text-color)); }
.sec { font-size:11px; font-weight:500; letter-spacing:.06em; text-transform:uppercase; color:var(--secondary-text-color); margin-bottom:-4px; }
.nodes { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:10px; }
.node { border-radius:12px; padding:10px 12px; background:var(--secondary-background-color,rgba(127,127,127,.08)); cursor:pointer; display:flex; flex-direction:column; gap:8px; }
.node.off { opacity:.6; }
.nhead { display:flex; align-items:center; gap:8px; }
.nname { font-weight:500; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--primary-text-color); }
.up { font-size:11px; color:var(--secondary-text-color); }
.dot { width:9px; height:9px; border-radius:50%; background:var(--px-off); flex:none; }
.dot.on { background:var(--px-ok); box-shadow:0 0 0 3px color-mix(in srgb,var(--px-ok) 25%,transparent); }
.dot.off { background:var(--px-crit); }
.metric { display:grid; grid-template-columns:42px 1fr 44px; align-items:center; gap:8px; font-size:12px; color:var(--secondary-text-color); }
.metric b { text-align:right; font-weight:500; color:var(--primary-text-color); font-variant-numeric:tabular-nums; }
.bar { height:6px; border-radius:3px; background:color-mix(in srgb,var(--primary-text-color) 12%,transparent); overflow:hidden; }
.bar > i { display:block; height:100%; border-radius:3px; background:var(--px-ok); transition:width .6s ease, background .3s; }
.bar > i.warn { background:var(--px-warn); } .bar > i.crit { background:var(--px-crit); }
.guests { display:flex; flex-direction:column; gap:2px; overflow:auto; }
.g { display:grid; grid-template-columns:28px minmax(0,1.2fr) minmax(0,2.4fr) auto; align-items:center; gap:10px; padding:6px 4px; border-radius:8px; cursor:pointer; }
.g:hover { background:color-mix(in srgb,var(--primary-text-color) 6%,transparent); }
.g.off { opacity:.55; }
.gi { position:relative; color:var(--secondary-text-color); display:grid; place-items:center; }
.gi .dot { position:absolute; right:-2px; bottom:-1px; width:8px; height:8px; border:2px solid var(--card-background-color,#fff); box-sizing:content-box; }
.gn { min-width:0; } .gn div:first-child { font-size:14px; color:var(--primary-text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.gn div:last-child { font-size:11px; color:var(--secondary-text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.gms { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; min-width:0; }
.gm { display:flex; flex-direction:column; gap:3px; font-size:11px; color:var(--secondary-text-color); min-width:0; }
.gl { display:flex; justify-content:space-between; gap:4px; }
.gl b { font-weight:500; color:var(--primary-text-color); font-variant-numeric:tabular-nums; }
.acts { display:flex; gap:2px; }
.act { --mdc-icon-size:20px; width:30px; height:30px; border-radius:50%; display:grid; place-items:center; cursor:pointer; color:var(--secondary-text-color); border:0; background:none; padding:0; }
.act:hover { background:color-mix(in srgb,var(--px-accent) 18%,transparent); color:var(--px-accent); }
.act.armed { background:var(--px-crit); color:#fff; }
.empty { padding:16px; text-align:center; color:var(--secondary-text-color); }
@container (max-width:520px) {
  .g { grid-template-columns:28px minmax(0,1fr) auto; row-gap:6px; } .g .gms { grid-column:2 / -1; grid-row:2; }
}
@container (max-width:340px) {
  .badge { display:none; } .chips { display:none; } .g .gms { gap:6px; }
}
@media (prefers-reduced-motion:reduce) { .bar > i { transition:none; } }
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

/** Classify an entity of the proxmoxve integration by translation key / entity_id. */
function roleOf(ent) {
  const id = ent.entity_id;
  const domain = id.split(".")[0];
  const k = `${ent.translation_key || ""} ${id.split(".")[1]}`.toLowerCase();
  if (domain === "button") {
    if (/shutdown/.test(k)) return "btn_shutdown";
    if (/reboot/.test(k)) return "btn_reboot";
    if (/(^|_|\s)stop(_|\s|$)/.test(k) && !/stop_all/.test(k)) return "btn_stop";
    if (/(^|_|\s)start(_|\s|$)/.test(k) && !/start_all/.test(k)) return "btn_start";
    return null;
  }
  if (/pressure|stalled|of_host|on_host|smart|backup|replication|snapshot|cert|subscription|failed|update/.test(k)) return null;
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
  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "node", selector: { text: {} } },
        { type: "grid", name: "", schema: [
          { name: "show_nodes", selector: { boolean: {} } },
          { name: "show_qemu", selector: { boolean: {} } },
          { name: "show_lxc", selector: { boolean: {} } },
          { name: "show_stopped", selector: { boolean: {} } },
          { name: "show_actions", selector: { boolean: {} } },
          { name: "show_ip", selector: { boolean: {} } },
        ] },
        { name: "language", selector: { select: { options: ["auto", "en", "fr"], mode: "dropdown" } } },
      ],
      computeLabel: (s) => ({ title: "Title", node: "Filter by node / name (optional)", show_nodes: "Show nodes", show_qemu: "Show VMs", show_lxc: "Show containers", show_stopped: "Show stopped guests", show_actions: "Show power buttons", show_ip: "Show IP address", language: "Language" }[s.name] || s.name),
    };
  }

  setConfig(config) {
    this._cfg = {
      title: "Proxmox", node: "", show_nodes: true, show_qemu: true, show_lxc: true, show_stopped: true,
      show_actions: true, show_ip: true, language: "auto", ...config,
      thresholds: { ...DEFAULT_THRESHOLDS, ...(config.thresholds || {}) },
    };
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
    const nodes = [], qemu = [], lxc = [];
    for (const [devId, roles] of Object.entries(byDev)) {
      const dev = h.devices[devId];
      if (!dev) continue;
      const raw = dev.name_by_user || dev.name || "";
      const model = `${dev.model || ""}`.toLowerCase();
      const m = raw.match(/^\s*(qemu|vm|lxc|ct|node)\b[\s_:-]*(.*)$/i);
      const kind = /qemu|virtual/.test(model) || /^(qemu|vm)$/i.test(m?.[1] || "") ? "qemu"
        : /lxc|container/.test(model) || /^(lxc|ct)$/i.test(m?.[1] || "") ? "lxc"
        : /node/.test(model) || /^node$/i.test(m?.[1] || "") ? "node" : null;
      if (!kind || !roles.status && !roles.cpu) continue;
      let name = (m ? m[2] : raw).trim();
      let vmid = "";
      const v = name.match(/^(.*?)\s*\((\d+)\)\s*$/) || name.match(/^(.*?)\s+(\d{3,})$/);
      if (v) { name = v[1].trim() || name; vmid = v[2]; }
      if (this._cfg.node && !raw.toLowerCase().includes(this._cfg.node.toLowerCase()) &&
          !(dev.via_device_id && (h.devices[dev.via_device_id]?.name || "").toLowerCase().includes(this._cfg.node.toLowerCase()))) continue;
      const item = { devId, name: name || raw, vmid, kind, roles };
      (kind === "node" ? nodes : kind === "qemu" ? qemu : lxc).push(item);
    }
    const sort = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true });
    nodes.sort(sort);
    qemu.sort((a, b) => (Number(a.vmid) || 0) - (Number(b.vmid) || 0) || sort(a, b));
    lxc.sort((a, b) => (Number(a.vmid) || 0) - (Number(b.vmid) || 0) || sort(a, b));
    return { nodes, qemu, lxc };
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
  _mini(label, v, thr) {
    return `<div class="gm"><div class="gl"><span>${label}</span><b>${v === null ? "–" : Math.round(v) + "%"}</b></div><div class="bar"><i class="${level(v, thr)}" style="width:${v ?? 0}%"></i></div></div>`;
  }

  _render() {
    if (!this._cfg || !this._hass) return;
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

      if (c.show_nodes && data.nodes.length) {
        html += `<div class="sec">${esc(this._t("nodes"))}</div><div class="nodes">` + data.nodes.map((n) => {
          const s = statusOf(n.roles.status, this._hass);
          const up = fmtUptime(this._state(n.roles.uptime));
          return `<div class="node ${s === "off" ? "off" : ""}" data-more="${esc((n.roles.status || n.roles.cpu).entity_id)}">
            <div class="nhead"><span class="dot ${s === "on" ? "on" : s === "off" ? "off" : ""}"></span><span class="nname">${esc(n.name)}</span>${up ? `<span class="up">${esc(up)}</span>` : ""}</div>
            ${this._metric(this._t("cpu"), this._pct(n, "cpu"), T.cpu)}
            ${this._metric(this._t("ram"), this._pct(n, "mem"), T.memory)}
            ${this._metric(this._t("disk"), this._pct(n, "disk"), T.disk)}</div>`;
        }).join("") + `</div>`;
      }

      const shown = guests.filter((g) => c.show_stopped || statusOf(g.roles.status, this._hass) === "on");
      if (shown.length) {
        html += `<div class="sec">${esc(this._t("guests"))}</div><div class="guests">` + shown.map((g) => {
          const s = statusOf(g.roles.status, this._hass);
          const on = s === "on";
          const ip = c.show_ip ? this._state(g.roles.ip) : "";
          const sub = [g.vmid && `#${g.vmid}`, g.kind === "lxc" ? "LXC" : "VM", ip && !/^unk|^unav/.test(ip) ? ip : ""].filter(Boolean).join(" · ");
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
          return `<div class="g ${on ? "" : "off"}" data-more="${esc((g.roles.status || g.roles.cpu).entity_id)}">
            <div class="gi"><ha-icon icon="${g.kind === "lxc" ? ICON.ct : ICON.vm}"></ha-icon><span class="dot ${on ? "on" : s === "off" ? "off" : ""}"></span></div>
            <div class="gn"><div>${esc(g.name)}</div><div>${esc(sub)}</div></div>
            <div class="gms">
              ${this._mini(this._t("cpu"), on ? this._pct(g, "cpu") : null, T.cpu)}
              ${this._mini(this._t("ram"), on ? this._pct(g, "mem") : null, T.memory)}
              ${this._mini(this._t("disk"), on ? this._pct(g, "disk") : null, T.disk)}
            </div>
            <div class="acts">${acts}</div></div>`;
        }).join("") + `</div>`;
      }
    }
    html += this._armed ? "" : "";
    if (html !== this._last) { this._last = html; this._root.innerHTML = html; }
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
    const more = e.target.closest("[data-more]");
    if (more) this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: more.dataset.more } }));
  }
}

if (!customElements.get("proxmox-card")) customElements.define("proxmox-card", ProxmoxCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "proxmox-card"))
  window.customCards.push({ type: "proxmox-card", name: "Proxmox Card", description: `Nodes, VMs and containers from the Proxmox VE integration (v${VERSION})`, preview: false });
