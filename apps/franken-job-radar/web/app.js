const $ = (id) => document.getElementById(id);
const start = $("start");
const status = $("status");
const progress = $("progress");
const jobs = $("jobs");
const showJobs = $("show-jobs");
const showIncomplete = $("show-incomplete");
const incompleteView = $("incomplete-view");
const coverageFilter = $("coverage-filter");
const messages = {
  title: ["Franken Job Radar", "Jobsuche in Franken"],
  back: ["Back to Services", "Zurück zu Services"],
  region: ["UPPER FRANCONIA / MIDDLE FRANCONIA / LOWER FRANCONIA", "OBERFRANKEN / MITTELFRANKEN / UNTERFRANKEN"],
  intro: ["Find IT and digitalisation jobs across Franconia and apply directly on employer websites.", "Finde IT- und Digitalisierungsjobs in ganz Franken und bewirb dich direkt bei den Arbeitgebern."],
  filters: ["Job filters", "Stellenfilter"],
  directions: ["Fields of work", "Fachrichtungen"],
  kind: ["Employment type", "Beschäftigungsart"],
  locate: ["Use my location", "Meinen Standort verwenden"],
  locationDefault: ["Sorted by straight-line distance from central Nuremberg", "Nach Luftlinie ab Nürnberger Innenstadt sortiert"],
  start: ["Start search", "Suche starten"],
  results: ["Search results", "Suchergebnisse"],
  matching: ["Matching jobs", "Passende Stellen"],
  incomplete: ["Incomplete sources", "Unvollständig gelesene Quellen"],
  initial: ["Start a fresh search of employer websites. Sources also refresh every Sunday.", "Starte eine neue Suche auf den Karriereseiten. Die Quellen werden auch sonntags aktualisiert."],
  all: ["All statuses", "Alle Status"],
  partial: ["Partially read", "Teilweise gelesen"],
  failed: ["Could not read", "Nicht lesbar"],
  directory: ["Employer directory by city", "Arbeitgeberverzeichnis nach Stadt"],
  cloud: ["Cloud & Distributed Systems", "Cloud und verteilte Systeme"],
  software: ["Software Engineering", "Softwareentwicklung"],
  security: ["IT Security & Governance", "IT-Sicherheit und Governance"],
  bpm: ["BPM & Digital Transformation", "BPM und digitale Transformation"],
  agent: ["AI Agent Development", "Entwicklung von KI-Agenten"],
  cloudSecurity: ["Cloud Security & Governance", "Cloud-Sicherheit und Governance"],
  student: ["Working student jobs & internships", "Werkstudentenstellen und Praktika"],
  regular: ["Graduate & non-senior roles", "Berufseinstieg und Stellen ohne Senior-Level"],
  multiple: ["Select one or more", "Mehrfachauswahl möglich"],
  viewLabel: ["Switch result view", "Ergebnisansicht wechseln"],
  filterLabel: ["Filter by source status", "Nach Quellenstatus filtern"],
  robots: ["Crawl rules", "Crawler-Regeln"],
  entry: ["Careers page", "Karriereseite"],
  page: ["Job or listing page", "Stellen- oder Übersichtsseite"],
  feed: ["Job feed", "Stellendatenquelle"],
  crawl: ["Search", "Suche"],
  gateway_connection: ["Gateway could not reach the site", "Gateway konnte die Website nicht erreichen"],
  dns: ["DNS lookup failed", "DNS-Auflösung fehlgeschlagen"],
  timeout: ["Request timed out", "Zeitüberschreitung"],
  disallowed: ["Blocked by site crawl rules", "Durch Crawler-Regeln der Website gesperrt"],
  invalid_response: ["Unsupported response format", "Nicht unterstütztes Antwortformat"],
  connection: ["Connection failed", "Verbindung fehlgeschlagen"],
  page_limit: ["Page limit reached", "Seitenlimit erreicht"],
  no_job_data: ["Page reachable but no job data recognised", "Seite erreichbar, aber keine Stellendaten erkannt"],
  internal_error: ["Parsing error", "Fehler beim Auslesen"],
  jobsCount: ["{0} jobs", "{0} Stellen"],
  unverified: ["Unverified", "Noch nicht verifiziert"],
  apply: ["Apply on employer site", "Beim Arbeitgeber bewerben"],
  emptyJobs: ["No matching jobs found in the sources checked.", "In den geprüften Quellen wurden keine passenden Stellen gefunden."],
  coverageSummary: ["{0} partially read · {1} could not be read. You can open the employer sites directly.", "{0} teilweise gelesen · {1} nicht lesbar. Die Karriereseiten lassen sich direkt öffnen."],
  coverageFilterEmpty: ["No sources match this filter.", "Keine Quellen entsprechen diesem Filter."],
  coverageDone: ["No incomplete sources were recorded.", "Es wurden keine unvollständig gelesenen Quellen erfasst."],
  coverageRunning: ["Search in progress. No incomplete sources so far.", "Suche läuft. Bisher gibt es keine unvollständig gelesenen Quellen."],
  coverageInitial: ["Incomplete sources will appear here after a search starts.", "Nach dem Start der Suche erscheinen hier unvollständig gelesene Quellen."],
  noReason: ["No details were recorded.", "Es wurden keine Details erfasst."],
  pages: ["Pages attempted: {0}", "Aufgerufene Seiten: {0}"],
  official: ["Employer careers site", "Karriereseite des Arbeitgebers"],
  sourcesCount: ["{0} sources", "{0} Quellen"],
  searching: ["Searching…", "Suche läuft…"],
  runDone: ["Search complete. {0} of {1} sources checked, {2} incomplete.", "Suche abgeschlossen. {0} von {1} Quellen geprüft, {2} unvollständig."],
  runProgress: ["Checking employer websites. {0} of {1} sources checked, {2} incomplete.", "Karriereseiten werden geprüft. {0} von {1} Quellen geprüft, {2} unvollständig."],
  requestFailed: ["Request failed. Please try again.", "Anfrage fehlgeschlagen. Bitte erneut versuchen."],
  busy: ["A search is already running.", "Es läuft bereits eine Suche."],
  monitorFailed: ["Could not load search progress.", "Der Suchfortschritt konnte nicht geladen werden."],
  runFailed: ["The search could not finish or save its results.", "Die Suche konnte nicht abgeschlossen oder gespeichert werden."],
  selectDirection: ["Select at least one field of work.", "Wähle mindestens eine Fachrichtung aus."],
  starting: ["Starting a fresh search…", "Eine neue Suche wird gestartet…"],
  locationUnavailable: ["Location is unavailable. Sorted by distance from central Nuremberg.", "Standort nicht verfügbar. Sortierung ab Nürnberger Innenstadt."],
  locationCurrent: ["Sorted by straight-line distance from your location", "Nach Luftlinie ab deinem Standort sortiert"],
  locationFailed: ["Could not access your location. Sorted by distance from central Nuremberg.", "Kein Zugriff auf deinen Standort. Sortierung ab Nürnberger Innenstadt."],
  inventory: ["Last saved search: {0}. Start a search to check employer websites again.", "Letzte gespeicherte Suche: {0}. Starte eine neue Suche, um die Karriereseiten erneut zu prüfen."],
  catalog: ["Directory: {0} careers sites and {1} cities and towns. Start a search to check the sites.", "Verzeichnis: {0} Karriereseiten und {1} Städte und Gemeinden. Starte eine Suche, um die Seiten zu prüfen."],
  directoryLoading: ["Loading the saved directory…", "Das gespeicherte Verzeichnis wird geladen…"],
  directoryCount: ["{0} cities and towns · {1} careers sites", "{0} Städte und Gemeinden · {1} Karriereseiten"],
  directoryFailed: ["Could not load the directory. Close and reopen it to retry.", "Das Verzeichnis konnte nicht geladen werden. Schließe und öffne es erneut."],
  careersCount: ["{0} careers sites", "{0} Karriereseiten"],
};
let language = "en";
try {
  if (localStorage.getItem("franken-radar-language") === "de") language = "de";
} catch {}
let statusMessage = ["initial"];
let locationMessage = "locationDefault";
let directoryMessage;

function t(key, ...args) {
  return (messages[key]?.[language === "de" ? 1 : 0] || key)
    .replace(/\{(\d+)\}/g, (_, index) => args[index]);
}

function message(key, ...args) {
  statusMessage = [key, ...args];
  renderStatus();
}

function renderStatus() {
  const [key, ...args] = statusMessage;
  const values = key === "inventory" ? [new Date(args[0]).toLocaleString(language)] : args;
  status.textContent = t(key, ...values);
}

function describeIssues(issues = {}) {
  return Object.entries(issues).map(([code, count]) => {
    const [stage, reason] = code.split(":");
    return t(stage) + ": " + (reason.startsWith("http_") ? reason.replace("http_", "HTTP ") : t(reason))
      + (count > 1 ? " × " + count : "");
  }).join(" · ");
}

function applyLanguage() {
  document.documentElement.lang = language;
  for (const node of document.querySelectorAll("[data-i18n]")) node.textContent = t(node.dataset.i18n);
  for (const node of document.querySelectorAll("[data-i18n-label]")) node.setAttribute("aria-label", t(node.dataset.i18nLabel));
  const switcher = $("language-switch");
  switcher.lang = language === "en" ? "de" : "en";
  switcher.textContent = language === "en" ? "Deutsch" : "English";
  start.textContent = t(start.disabled ? "searching" : "start");
  $("location").textContent = t(locationMessage);
  if (directoryMessage) $("directory-status").textContent = t(...directoryMessage);
  for (const node of document.querySelectorAll("[data-careers-count]")) {
    node.textContent = t("careersCount", node.dataset.careersCount);
  }
  renderStatus();
  renderCoverage();
  render();
}

$("language-switch").addEventListener("click", () => {
  language = language === "en" ? "de" : "en";
  try { localStorage.setItem("franken-radar-language", language); } catch {}
  applyLanguage();
});

let origin = [49.4521, 11.0767];
let current;

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function distance(lat, lon) {
  const radians = Math.PI / 180;
  const [a, b] = origin;
  const h = Math.sin((lat - a) * radians / 2) ** 2
    + Math.cos(lat * radians) * Math.cos(a * radians) * Math.sin((lon - b) * radians / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(Math.min(1, h)));
}

function render() {
  if (!current) return;
  const kind = document.querySelector('input[name="kind"]:checked').value;
  const directions = new Set(Array.from(document.querySelectorAll('input[name="direction"]:checked'), (input) => input.value));
  const matching = current.jobs.filter((job) => job.kind === kind && job.directions.some((direction) => directions.has(direction)));
  const unique = new Map(matching.map((job) => [JSON.stringify([job.url, job.city]), job]));
  const sorted = Array.from(unique.values(), (job) => ({ ...job, km: distance(job.lat, job.lon) }));
  sorted.sort((a, b) => a.km - b.km || b.posted.localeCompare(a.posted) || a.title.localeCompare(b.title));
  $("count").textContent = t("jobsCount", sorted.length);
  jobs.replaceChildren(...sorted.map((job) => {
    const card = element("article", "", "job");
    const text = element("div", "");
    const metadata = [job.company, job.city, job.km.toLocaleString(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " km", job.posted, job.unverified ? t("unverified") : ""].filter(Boolean);
    text.append(element("h3", job.title), element("p", metadata.join(" · ")));
    const link = element("a", t("apply"));
    link.href = job.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", job.title + " · " + t("apply"));
    card.append(text, link);
    return card;
  }));
  if (current.done && sorted.length === 0) jobs.append(element("p", t("emptyJobs"), "note"));
}

function renderCoverage() {
  const incomplete = (current?.sources || []).filter(({ status }) => status !== "ok");
  showIncomplete.textContent = t("incomplete") + (incomplete.length ? " · " + incomplete.length : "");
  if (incompleteView.hidden) return;
  const partial = incomplete.filter(({ status }) => status === "partial").length;
  const selection = coverageFilter.value;
  const visible = incomplete.filter(({ status }) => selection === "all" || status === selection);
  const groups = new Map();
  for (const source of visible) {
    if (!groups.has(source.city)) groups.set(source.city, []);
    groups.get(source.city).push(source);
  }

  coverageFilter.disabled = !incomplete.length;
  $("coverage-summary").textContent = incomplete.length
    ? t("coverageSummary", partial, incomplete.length - partial)
    : "";
  $("coverage-empty").textContent = visible.length ? "" : (
    incomplete.length ? t("coverageFilterEmpty") :
    current?.done ? t("coverageDone") :
    start.disabled ? t("coverageRunning") :
    t("coverageInitial")
  );
  $("sources").replaceChildren(...Array.from(groups).sort(([a], [b]) => a.localeCompare(b, "de")).map(([city, entries]) => {
    const group = element("section", "", "coverage-city");
    const items = element("ul", "", "coverage-list");
    entries.sort((a, b) => a.company.localeCompare(b.company, "de"));
    for (const source of entries) {
      const row = element("li", "", "coverage-card");
      const text = element("div", "", "coverage-copy");
      const heading = element("div", "", "coverage-heading");
      heading.append(element("h4", source.company), element("span", t(source.status === "partial" || source.status === "failed" ? source.status : "unverified"), "coverage-state " + source.status));
      const reason = describeIssues(source.issues) || t("noReason");
      text.append(heading, element("p", reason, "note"));
      if (Number.isInteger(source.pages)) {
        text.append(element("p", t("pages", source.pages), "note"));
      }
      row.append(text);
      if (source.url) {
        const link = element("a", t("official"), "coverage-link");
        link.href = source.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", source.company + " · " + t("official"));
        row.append(link);
      }
      items.append(row);
    }
    group.append(element("h3", city + " · " + t("sourcesCount", entries.length)), items);
    return group;
  }));
}

function showResultView(incomplete) {
  showJobs.setAttribute("aria-pressed", String(!incomplete));
  showIncomplete.setAttribute("aria-pressed", String(incomplete));
  $("job-view").hidden = incomplete;
  incompleteView.hidden = !incomplete;
  if (incomplete) renderCoverage();
}

showJobs.addEventListener("click", () => showResultView(false));
showIncomplete.addEventListener("click", () => showResultView(true));
coverageFilter.addEventListener("change", renderCoverage);

async function request(path, options) {
  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok) throw new Error(response.status === 409 ? "busy" : "requestFailed");
  return data;
}

async function monitor(id) {
  start.disabled = true;
  start.textContent = t("searching");
  progress.hidden = false;
  try {
    while (true) {
      const lastSourceCount = current?.sources.length;
      const wasDone = current?.done;
      current = await request("./api/runs/" + encodeURIComponent(id));
      const { sources, total, done, error } = current;
      const incomplete = sources.filter((source) => source.status !== "ok").length;
      progress.max = total || 1;
      progress.value = sources.length;
      message(error ? "runFailed" : done ? "runDone" : "runProgress", sources.length, total, incomplete);
      if (lastSourceCount !== sources.length || wasDone !== done) renderCoverage();
      render();
      if (done) break;
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  } catch (error) {
    message("monitorFailed");
  } finally {
    start.disabled = false;
    start.textContent = t("start");
  }
}

start.addEventListener("click", async () => {
  if (!document.querySelector('input[name="direction"]:checked')) {
    message("selectDirection");
    return;
  }
  start.disabled = true;
  try {
    const { id } = await request("./api/runs", { method: "POST", headers: { "X-Radar-Search": "1" } });
    current = null;
    jobs.replaceChildren();
    $("count").textContent = "";
    coverageFilter.value = "all";
    renderCoverage();
    message("starting");
    await monitor(id);
  } catch (error) {
    message(error.message === "busy" ? "busy" : "requestFailed");
    start.disabled = false;
    start.textContent = t("start");
  }
});
document.querySelector(".filters").addEventListener("change", render);
$("locate").addEventListener("click", () => {
  if (!navigator.geolocation) {
    $("location").textContent = t(locationMessage = "locationUnavailable");
    return;
  }
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    origin = [coords.latitude, coords.longitude];
    $("location").textContent = t(locationMessage = "locationCurrent");
    render();
  }, () => {
    $("location").textContent = t(locationMessage = "locationFailed");
    origin = [49.4521, 11.0767];
    render();
  }, { timeout: 8000 });
});

request("./api/status").then(async ({ active, total, cities, inventory }) => {
  if (active && !start.disabled) {
    monitor(active);
  } else if (!current && !start.disabled && inventory) {
    const snapshot = await request("./api/inventory");
    if (current || start.disabled) return;
    current = snapshot;
    message("inventory", snapshot.finished);
    renderCoverage();
    render();
  } else if (!current && !start.disabled) {
    message("catalog", total, cities);
  }
}).catch(() => {});

const directory = $("directory");
directory.addEventListener("toggle", async () => {
  if (!directory.open || directory.dataset.loaded) return;
  const directoryStatus = $("directory-status");
  directory.dataset.loaded = "loading";
  directoryStatus.textContent = t(...(directoryMessage = ["directoryLoading"]));
  try {
    const { cities, total } = await request("./api/employers");
    $("directory-cities").replaceChildren(...cities.map(({ city, employers }) => {
      const group = element("details", "");
      const list = element("ul", "");
      for (const { name, url } of employers) {
        const row = element("li", "");
        const link = element("a", name);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        row.append(link);
        list.append(row);
      }
      const summary = element("summary", city + " · ");
      const count = element("span", t("careersCount", employers.length));
      count.dataset.careersCount = employers.length;
      summary.append(count);
      group.append(summary, list);
      return group;
    }));
    directoryStatus.textContent = t(...(directoryMessage = ["directoryCount", cities.length, total]));
    directory.dataset.loaded = "ready";
  } catch (error) {
    directoryStatus.textContent = t(...(directoryMessage = ["directoryFailed"]));
    delete directory.dataset.loaded;
  }
});

applyLanguage();
