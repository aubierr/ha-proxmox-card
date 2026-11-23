// Checks how the card classifies every entity of the Proxmox VE Custom integration (translation key -> role).
// The table lists every key of the integration's translations/en.json (6.0.x); null = deliberately not used.
// A new or renamed key in the integration should be added here, so the card is checked against it.
// Usage: node test/check-roles.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../dist/proxmox-card.js", import.meta.url), "utf8");
const a = src.indexOf("/** Roles recognised");
const b = src.indexOf("function statusOf");
if (a < 0 || b < 0) throw new Error("roleOf not found in dist/proxmox-card.js");
const { roleOf } = new Function(`${src.slice(a, b)}; return { roleOf };`)();

const EXPECTED = {
  binary_sensor: {
    status: "status", backup_running: "backup_running", health: "health", locked: "locked", guest_agent: "agent", update_avail: "update_avail",
    ha_managed: "ha_managed", replication_failing: "repl_failing", cluster_quorate: "quorate", ha_crm_master_stale: "crm_stale",
    storage_active: "active", storage_enabled: "enabled", storage_shared: "shared", backup_status: "backup_status",
  },
  button: {
    start: "btn_start", shutdown: "btn_shutdown", reboot: "btn_reboot", stop: "btn_stop", snapshot: "btn_snapshot", backup: "btn_backup",
    unlock: "btn_unlock", resume: "btn_resume", suspend: "btn_suspend", reset: "btn_reset", hibernate: "btn_hibernate",
    start_all: "btn_start_all", stop_all: "btn_stop_all", suspend_all: "btn_suspend_all", backup_all: "btn_backup_all", wakeonlan: "btn_wol",
    arm_ha: "btn_arm_ha", disarm_ha: "btn_disarm_ha",
  },
  sensor: {
    cpu_used: "cpu", cpu_of_host: "cpu_host", cpus: null,
    pressure_cpu_some: "p_cpu", pressure_io_some: "p_io", pressure_memory_some: "p_mem", pressure_cpu_full: null, pressure_io_full: null, pressure_memory_full: null,
    memory_of_host: "mem_host", memory_used: "mem_used", memory_free: "mem_free", memory_total: "mem_total", memory_used_perc: "mem_pct", memory_free_perc: "mem_free_pct",
    disk_used: "disk_used", disk_free: "disk_free", disk_total: "disk_total", disk_used_perc: "disk_pct", disk_free_perc: "disk_free_pct",
    disk_rpm: "disk_rpm", disk_size: "disk_size", disk_wearout: "wearout", life_left: "life_left", temperature: "temp",
    power_cycles: "power_cycles", power_loss: "power_loss", power_hours: "power_hours",
    swap_used_perc: "swap_pct", swap_used: null, swap_free: null, swap_total: null, swap_free_perc: null,
    ip_address: "ip", snapshots: "snapshots", uptime: "uptime", version: "version", node: "node_name", status_raw: "status_raw", node_status: "status",
    load_1m: "load", load_5m: "load5", load_15m: "load15", io_wait: "io",
    failed_tasks_count: "failed", updates_total: "updates_total", backup_last: "backup_last", backup_duration: "backup_dur",
    network_in: "net_in", network_out: "net_out", guest_file_content: null, lxc_on: null, qemu_on: null,
    ceph_health: "ceph_health", ceph_used: "ceph_used", ceph_total: "ceph_total", ceph_used_perc: "ceph_pct",
    cluster_nodes_online: "c_nodes", cluster_qemu_running: "c_qemu", cluster_lxc_running: "c_lxc", cluster_cpu_used: "cpu",
    cluster_memory_used_perc: "mem_pct", cluster_memory_used: "mem_used", cluster_memory_total: "mem_total",
    certificate_expires: "cert_expires", subscription_status: "subscription", guests_without_backup: "no_backup",
    replication_last_sync: "repl_sync", ha_armed_state: "ha_armed", ha_resources_error: "ha_errors", ha_resources_total: null,
    ha_crm_master: null, ha_crm_master_last_seen: null,
    zfs_health: "zfs_health", zfs_used_perc: "disk_pct", zfs_free_perc: "disk_free_pct", zfs_total: "disk_total", zfs_used: "disk_used",
  },
  update: { node_update: "pve_update" },
};

// Entities without a translation key (older integrations): the object id is matched instead.
const BY_OBJECT_ID = [
  ["sensor.qemu_web_101_cpu_used", "cpu"], ["sensor.lxc_dns_102_memory_used_perc", "mem_pct"], ["sensor.qemu_web_101_disk_used_perc", "disk_pct"],
  ["binary_sensor.qemu_web_101_status", "status"], ["button.qemu_web_101_start", "btn_start"], ["button.qemu_web_101_shutdown", "btn_shutdown"],
  ["button.node_pve_start_all", null], ["button.node_pve_stop_all", null], ["sensor.storage_pve_local_storage_status", null],
];

let errors = 0, checked = 0;
const check = (ent, want) => {
  const got = roleOf(ent);
  checked++;
  if (got !== want) { errors++; console.error(`✗ ${ent.entity_id} (${ent.translation_key ?? "no key"}): ${got} instead of ${want}`); }
};
for (const [domain, keys] of Object.entries(EXPECTED))
  for (const [key, want] of Object.entries(keys)) check({ entity_id: `${domain}.device_${key}`, translation_key: key }, want);
for (const [id, want] of BY_OBJECT_ID) check({ entity_id: id }, want);

// two keys must never share a role inside one kind of device, or one would hide the other
const seen = {};
for (const [domain, keys] of Object.entries(EXPECTED))
  for (const [key, role] of Object.entries(keys)) if (role) (seen[role] ||= []).push(`${domain}.${key}`);
const allowed = new Set(["status", "cpu", "mem_pct", "mem_used", "mem_total", "disk_pct", "disk_free_pct", "disk_total", "disk_used", "btn_shutdown", "btn_reboot"]); // node vs guest vs cluster vs ZFS: different devices
for (const [role, keys] of Object.entries(seen)) if (keys.length > 1 && !allowed.has(role)) { errors++; console.error(`✗ role ${role} shared by ${keys.join(", ")}`); }

if (errors) process.exit(1);
console.log(`✓ ${checked} entities classified as expected`);
