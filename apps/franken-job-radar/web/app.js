const $ = (id) => document.getElementById(id);
const status = $("status");
const jobs = $("jobs");
const showJobs = $("show-jobs");
const showIncomplete = $("show-incomplete");
const incompleteView = $("incomplete-view");
const coverageFilter = $("coverage-filter");
const messages = {
  title: ["Franken Job Radar", "Jobsuche in Franken", "弗兰肯求职雷达"],
  back: ["Back to Services", "Zurück zu Services", "返回服务页"],
  region: ["UPPER FRANCONIA / MIDDLE FRANCONIA / LOWER FRANCONIA", "OBERFRANKEN / MITTELFRANKEN / UNTERFRANKEN", "上弗兰肯 / 中弗兰肯 / 下弗兰肯"],
  intro: ["Find IT and digitalisation jobs across Franconia and apply directly on employer websites.", "Finde IT- und Digitalisierungsjobs in ganz Franken und bewirb dich direkt bei den Arbeitgebern.", "查找弗兰肯地区的 IT 与数字化岗位，直接前往雇主官网申请。"],
  filters: ["Job filters", "Stellenfilter", "岗位筛选"],
  directions: ["Fields of work", "Fachrichtungen", "专业方向"],
  kind: ["Employment type", "Beschäftigungsart", "岗位类型"],
  locate: ["Use my location", "Meinen Standort verwenden", "使用我的位置"],
  locationDefault: ["Sorted by straight-line distance from central Nuremberg", "Nach Luftlinie ab Nürnberger Innenstadt sortiert", "按到纽伦堡市中心的直线距离排序"],
  results: ["Search results", "Suchergebnisse", "搜索结果"],
  matching: ["Matching jobs", "Passende Stellen", "匹配岗位"],
  incomplete: ["Incomplete sources", "Unvollständig gelesene Quellen", "未完整读取"],
  initial: ["Results refresh automatically every Friday at 05:00 Berlin time.", "Die Ergebnisse werden freitags um 05:00 Uhr (Berlin) automatisch aktualisiert.", "结果于每周五柏林时间 05:00 自动更新。"],
  all: ["All statuses", "Alle Status", "全部状态"],
  partial: ["Partially read", "Teilweise gelesen", "部分读取"],
  failed: ["Could not read", "Nicht lesbar", "未能读取"],
  directory: ["Employer directory by city", "Arbeitgeberverzeichnis nach Stadt", "按城市查看企业招聘目录"],
  cloud: ["Cloud & Distributed Systems", "Cloud und verteilte Systeme", "云计算与分布式系统"],
  software: ["Software Engineering", "Softwareentwicklung", "软件开发"],
  security: ["IT Security & Governance", "IT-Sicherheit und Governance", "IT 安全与治理"],
  bpm: ["BPM & Digital Transformation", "BPM und digitale Transformation", "业务流程管理与数字化转型"],
  agent: ["AI Agent Development", "Entwicklung von KI-Agenten", "AI Agent 应用开发"],
  cloudSecurity: ["Cloud Security & Governance", "Cloud-Sicherheit und Governance", "云安全与治理"],
  student: ["Working student jobs & internships", "Werkstudentenstellen und Praktika", "在读岗位与实习"],
  regular: ["Graduate & non-senior roles", "Berufseinstieg und Stellen ohne Senior-Level", "毕业后正式岗位（非高级）"],
  multiple: ["Select one or more", "Mehrfachauswahl möglich", "可多选"],
  viewLabel: ["Switch result view", "Ergebnisansicht wechseln", "切换结果视图"],
  filterLabel: ["Filter by source status", "Nach Quellenstatus filtern", "按读取状态筛选"],
  robots: ["Crawl rules", "Crawler-Regeln", "抓取规则"],
  entry: ["Careers page", "Karriereseite", "招聘入口"],
  page: ["Job or listing page", "Stellen- oder Übersichtsseite", "职位详情或列表"],
  feed: ["Job feed", "Stellendatenquelle", "职位数据源"],
  crawl: ["Search", "Suche", "本轮抓取"],
  gateway_connection: ["Gateway could not reach the site", "Gateway konnte die Website nicht erreichen", "网络网关未连上网站"],
  dns: ["DNS lookup failed", "DNS-Auflösung fehlgeschlagen", "域名解析失败"],
  timeout: ["Request timed out", "Zeitüberschreitung", "请求超时"],
  disallowed: ["Blocked by site crawl rules", "Durch Crawler-Regeln der Website gesperrt", "站点规则限制抓取"],
  invalid_response: ["Unsupported response format", "Nicht unterstütztes Antwortformat", "响应格式不受支持"],
  connection: ["Connection failed", "Verbindung fehlgeschlagen", "连接失败"],
  page_limit: ["Page limit reached", "Seitenlimit erreicht", "达到抓取页数上限"],
  no_job_data: ["Page reachable but no job data recognised", "Seite erreichbar, aber keine Stellendaten erkannt", "页面可访问，但未识别出职位数据"],
  internal_error: ["Parsing error", "Fehler beim Auslesen", "解析异常"],
  jobsCount: ["{0} jobs", "{0} Stellen", "{0} 个岗位"],
  unverified: ["Unverified", "Noch nicht verifiziert", "待复核"],
  apply: ["Apply on employer site", "Beim Arbeitgeber bewerben", "官网申请"],
  emptyJobs: ["No matching jobs found in the sources checked.", "In den geprüften Quellen wurden keine passenden Stellen gefunden.", "已检查的来源中没有符合当前筛选条件的岗位。"],
  coverageSummary: ["{0} partially read · {1} could not be read. You can open the employer sites directly.", "{0} teilweise gelesen · {1} nicht lesbar. Die Karriereseiten lassen sich direkt öffnen.", "{0} 个部分读取，{1} 个未能读取。可直接打开官网查看。"],
  coverageFilterEmpty: ["No sources match this filter.", "Keine Quellen entsprechen diesem Filter.", "当前筛选下没有来源。"],
  coverageDone: ["No incomplete sources were recorded.", "Es wurden keine unvollständig gelesenen Quellen erfasst.", "本次记录中没有未完整读取的来源。"],
  coverageRunning: ["The first weekly update is running. Source reports will appear when it finishes.", "Die erste Wochenaktualisierung läuft. Die Quellenberichte erscheinen danach.", "首次周度更新正在运行，完成后会显示来源报告。"],
  coverageInitial: ["Source reports will appear after the first weekly update.", "Die Quellenberichte erscheinen nach der ersten Wochenaktualisierung.", "首次周度更新完成后会显示来源报告。"],
  noReason: ["No details were recorded.", "Es wurden keine Details erfasst.", "本次没有记录详细原因。"],
  pages: ["Pages attempted: {0}", "Aufgerufene Seiten: {0}", "已尝试 {0} 页"],
  official: ["Employer careers site", "Karriereseite des Arbeitgebers", "官网招聘入口"],
  sourcesCount: ["{0} sources", "{0} Quellen", "{0} 个来源"],
  requestFailed: ["Request failed. Please try again.", "Anfrage fehlgeschlagen. Bitte erneut versuchen.", "请求失败，请重试。"],
  locationUnavailable: ["Location is unavailable. Sorted by distance from central Nuremberg.", "Standort nicht verfügbar. Sortierung ab Nürnberger Innenstadt.", "浏览器定位不可用，将按到纽伦堡市中心的距离排序。"],
  locationCurrent: ["Sorted by straight-line distance from your location", "Nach Luftlinie ab deinem Standort sortiert", "按到你当前位置的直线距离排序"],
  locationFailed: ["Could not access your location. Sorted by distance from central Nuremberg.", "Kein Zugriff auf deinen Standort. Sortierung ab Nürnberger Innenstadt.", "未能获取你的位置，将按到纽伦堡市中心的距离排序。"],
  inventory: ["Weekly results updated {0}. Automatic refresh every Friday.", "Wochenstand vom {0}. Automatische Aktualisierung jeden Freitag.", "本周结果更新于 {0}。每周五自动更新。"],
  directoryLoading: ["Loading the saved directory…", "Das gespeicherte Verzeichnis wird geladen…", "正在读取已保存的目录…"],
  directoryCount: ["{0} cities and towns · {1} careers sites", "{0} Städte und Gemeinden · {1} Karriereseiten", "{0} 个城市和市镇 · {1} 个招聘入口"],
  directoryFailed: ["Could not load the directory. Close and reopen it to retry.", "Das Verzeichnis konnte nicht geladen werden. Schließe und öffne es erneut.", "读取目录失败，请合上后重新打开。"],
  careersCount: ["{0} careers sites", "{0} Karriereseiten", "{0} 个招聘入口"],
  pendingInventory: ["Weekly update in progress. Showing results from {0}.", "Die Wochenaktualisierung läuft. Angezeigt wird der Stand vom {0}.", "正在更新本周结果，当前显示 {0} 保存的结果。"],
  firstUpdate: ["The first weekly update is running. Results will appear once it finishes.", "Die erste Wochenaktualisierung läuft. Die Ergebnisse erscheinen danach.", "首次周度更新正在运行，完成后会显示结果。"],
  loadFailed: ["Could not load the weekly results. Reload the page to try again.", "Die Wochenergebnisse konnten nicht geladen werden. Lade die Seite erneut.", "无法加载本周结果，请刷新页面重试。"],
  languageLabel: ["Page language", "Seitensprache", "页面语言"],
};
const locales = ["en", "de", "zh-Hans"];
const languageButtons = document.querySelectorAll("[data-locale]");
let language = "en";
try {
  const saved = localStorage.getItem("franken-radar-language");
  if (locales.includes(saved)) language = saved;
} catch {}
let statusMessage = ["initial"];
let locationMessage = "locationDefault";
let directoryMessage;

function t(key, ...args) {
  return (messages[key]?.[locales.indexOf(language)] || key)
    .replace(/\{(\d+)\}/g, (_, index) => args[index]);
}

function message(key, ...args) {
  statusMessage = [key, ...args];
  renderStatus();
}

function renderStatus() {
  const [key, ...args] = statusMessage;
  const values = ["inventory", "pendingInventory"].includes(key) ? [new Date(args[0]).toLocaleString(language, { timeZone: "Europe/Berlin" })] : args;
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
  for (const button of languageButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.locale === language));
  }
  $("location").textContent = t(locationMessage);
  if (directoryMessage) $("directory-status").textContent = t(...directoryMessage);
  for (const node of document.querySelectorAll("[data-careers-count]")) {
    node.textContent = t("careersCount", node.dataset.careersCount);
  }
  renderStatus();
  renderCoverage();
  render();
}

for (const button of languageButtons) {
  button.addEventListener("click", () => {
    language = button.dataset.locale;
    try { localStorage.setItem("franken-radar-language", language); } catch {}
    applyLanguage();
  });
}

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

function formatDistance(km) {
  return km.toLocaleString(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " km";
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
    const metadata = [job.company, job.city, formatDistance(job.km), job.posted, job.unverified ? t("unverified") : ""].filter(Boolean);
    text.append(element("h3", job.title), element("p", metadata.join(" · ")));
    const link = element("a", t("apply"));
    link.href = job.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", job.title + " · " + t("apply"));
    card.append(text, link);
    return card;
  }));
  if (current.finished && sorted.length === 0) jobs.append(element("p", t("emptyJobs"), "note"));
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
    current?.finished ? t("coverageDone") :
    current?.updating ? t("coverageRunning") :
    t("coverageInitial")
  );
  const ordered = Array.from(groups).sort(([cityA, entriesA], [cityB, entriesB]) =>
    (entriesA[0].distance_from_nuremberg ?? Infinity) - (entriesB[0].distance_from_nuremberg ?? Infinity)
    || cityA.localeCompare(cityB, "de")
  );
  $("sources").replaceChildren(...ordered.map(([city, entries]) => {
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
    const km = entries[0].distance_from_nuremberg;
    const metadata = [city, Number.isFinite(km) ? formatDistance(km) : "", t("sourcesCount", entries.length)];
    group.append(element("h3", metadata.filter(Boolean).join(" · ")), items);
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
  if (!response.ok) throw new Error("requestFailed");
  return data;
}

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

async function loadWeeklyResults() {
  try {
    current = await request("./api/inventory");
    if (current.finished) {
      message(current.updating ? "pendingInventory" : "inventory", current.finished);
    } else {
      message(current.updating ? "firstUpdate" : "initial");
    }
    renderCoverage();
    render();
    if (current.updating || !current.finished) setTimeout(loadWeeklyResults, 15_000);
  } catch {
    message("loadFailed");
  }
}

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
loadWeeklyResults();
