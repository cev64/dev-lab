// Season Pass page: license activation, feed instructions (revealed after unlock).
import { initPage, API, getKey, setKey, clearKey, postJSON, track, loadSnapshot, toast } from "./core.js";

initPage();

const $ = (s) => document.querySelector(s);
const form = $("#unlock-form");
const msg = $("#unlock-msg");

function feedUrl(key, table) {
  return `${API || "https://YOUR-API"}/nfl.csv?key=${encodeURIComponent(key)}&table=${table}`;
}
const mask = (k) => (k.length > 8 ? k.slice(0, 4) + "…" + k.slice(-4) : k);

function renderUnlocked() {
  const key = getKey();
  const on = Boolean(key);
  $("#active").hidden = !on;
  $("#feed").hidden = !on;
  form.hidden = on;
  $("#unlock-title").textContent = on ? "Season Pass active on this browser" : "Already bought? Enter your license key";
  if (!on) return;
  $("#active-key").textContent = mask(key);
  const players = feedUrl(key, "players"), defenses = feedUrl(key, "defenses");
  $("#url-players").textContent = players;
  $("#url-defenses").textContent = defenses;
  $("#formula-players").textContent = `=IMPORTDATA("${players}")`;
  $("#formula-defenses").textContent = `=IMPORTDATA("${defenses}")`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const key = form.key.value.trim();
  msg.className = "msg";
  if (!key) { msg.className = "msg err"; msg.textContent = "Paste the license key from your receipt email."; return; }
  if (!API) { msg.textContent = "License activation opens with the Season Pass launch."; return; }
  const btn = form.querySelector("button"); btn.disabled = true;
  msg.textContent = "Checking your key…";
  try {
    const r = await postJSON("/license/activate", { key });
    if (r.ok) {
      setKey(key);
      track("unlock_ok");
      msg.className = "msg ok"; msg.textContent = "Unlocked. Pro data is on for this browser.";
      renderUnlocked();
      loadSnapshot().catch(() => {}); // warm the Pro cache for the dashboard
      $("#active").focus();
    } else {
      msg.className = "msg err"; msg.textContent = r.error || "That key was not recognised. Check it and try again.";
    }
  } catch {
    msg.className = "msg err"; msg.textContent = "Network error. Try again in a minute.";
  }
  btn.disabled = false;
});

$("#remove-key").addEventListener("click", () => {
  clearKey();
  msg.className = "msg"; msg.textContent = "Key removed from this browser.";
  renderUnlocked();
  form.key.focus();
});

document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-copy]");
  if (!b) return;
  const text = document.getElementById(b.dataset.copy).textContent;
  try { await navigator.clipboard.writeText(text); toast("Copied"); }
  catch { toast("Copy failed. Select the text instead."); }
});

renderUnlocked();
