const $ = (id) => document.getElementById(id);
const start = $("start");
const status = $("status");
const progress = $("progress");
const jobs = $("jobs");
const showJobs = $("show-jobs");
const showIncomplete = $("show-incomplete");
const incompleteView = $("incomplete-view");
const coverageFilter = $("coverage-filter");
const crawlStages = { robots: "抓取规则", entry: "招聘入口", page: "详情或列表", feed: "职位数据源", crawl: "本轮抓取" };
const crawlIssues = {
  gateway_connection: "网络网关未连上网站", dns: "域名解析失败", timeout: "请求超时",
  disallowed: "站点规则限制", invalid_response: "响应格式不受支持", connection: "连接失败",
  page_limit: "达到抓取范围上限", no_job_data: "页面可访问，未识别职位数据", internal_error: "解析异常",
};

function describeIssues(issues = {}) {
  return Object.entries(issues).map(([code, count]) => {
    const [stage, reason] = code.split(":");
    return crawlStages[stage] + "：" + (crawlIssues[reason] || reason.replace("http_", "HTTP "))
      + (count > 1 ? " × " + count : "");
  }).join("，");
}

const sourceStatus = { partial: "部分读取", failed: "未能读取" };
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
  $("count").textContent = sorted.length + " 个岗位";
  jobs.replaceChildren(...sorted.map((job) => {
    const card = element("article", "", "job");
    const text = element("div", "");
    const metadata = [job.company, job.city, job.km.toFixed(1) + " km", job.posted, job.unverified ? "待复核" : ""].filter(Boolean);
    text.append(element("h3", job.title), element("p", metadata.join(" · ")));
    const link = element("a", "官网申请");
    link.href = job.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", job.title + " · 官网申请");
    card.append(text, link);
    return card;
  }));
  if (current.done && sorted.length === 0) jobs.append(element("p", "这轮已读取的来源中没有符合当前筛选条件的岗位。", "note"));
}

function renderCoverage() {
  const incomplete = (current?.sources || []).filter(({ status }) => status !== "ok");
  showIncomplete.textContent = incomplete.length ? "未完整读取 · " + incomplete.length : "未完整读取";
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
    ? partial + " 个部分读取 · " + (incomplete.length - partial) + " 个未能读取。可直接打开官网查看。"
    : "";
  $("coverage-empty").textContent = visible.length ? "" : (
    incomplete.length ? "当前筛选下没有来源。" :
    current?.done ? "本次记录中没有未完整读取的来源。" :
    start.disabled ? "正在抓取，目前没有未完整读取的来源。" :
    "开始搜索后，这里会显示未完整读取的招聘来源。"
  );
  $("sources").replaceChildren(...Array.from(groups).sort(([a], [b]) => a.localeCompare(b, "de")).map(([city, entries]) => {
    const group = element("section", "", "coverage-city");
    const items = element("ul", "", "coverage-list");
    entries.sort((a, b) => a.company.localeCompare(b.company, "de"));
    for (const source of entries) {
      const row = element("li", "", "coverage-card");
      const text = element("div", "", "coverage-copy");
      const heading = element("div", "", "coverage-heading");
      heading.append(element("h4", source.company), element("span", sourceStatus[source.status] || "待复核", "coverage-state " + source.status));
      const reason = describeIssues(source.issues) || "本次记录没有详细原因。";
      text.append(heading, element("p", reason, "note"));
      if (Number.isInteger(source.pages)) {
        text.append(element("p", "尝试 " + source.pages + " 页", "note"));
      }
      row.append(text);
      if (source.url) {
        const link = element("a", "官网招聘入口", "coverage-link");
        link.href = source.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", source.company + " · 官网招聘入口");
        row.append(link);
      }
      items.append(row);
    }
    group.append(element("h3", city + " · " + entries.length + " 个来源"), items);
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
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data;
}

async function monitor(id) {
  start.disabled = true;
  start.textContent = "正在抓取";
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
      status.textContent = error || (done ? "本轮结束。 " : "正在重新访问企业官网。 ")
        + sources.length + " / " + total + " 个来源已检查，" + incomplete + " 个未完整读取。";
      if (lastSourceCount !== sources.length || wasDone !== done) renderCoverage();
      render();
      if (done) break;
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  } catch (error) {
    status.textContent = "读取进度失败。 " + error.message;
  } finally {
    start.disabled = false;
    start.textContent = "开始搜索";
  }
}

start.addEventListener("click", async () => {
  if (!document.querySelector('input[name="direction"]:checked')) {
    status.textContent = "请至少选择一个专业方向。";
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
    status.textContent = "正在启动新一轮搜索。";
    await monitor(id);
  } catch (error) {
    status.textContent = error.message;
    start.disabled = false;
  }
});
document.querySelector(".filters").addEventListener("change", render);
$("locate").addEventListener("click", () => {
  if (!navigator.geolocation) {
    $("location").textContent = "浏览器定位不可用，按距纽伦堡市中心排序。";
    return;
  }
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    origin = [coords.latitude, coords.longitude];
    $("location").textContent = "按距你当前位置的直线距离排序";
    render();
  }, () => {
    $("location").textContent = "未获取定位，按距纽伦堡市中心排序。";
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
    status.textContent = "最近保存的盘点 · " + new Date(snapshot.finished).toLocaleString("zh-CN")
      + "。点击开始搜索会重新访问企业官网。";
    renderCoverage();
    render();
  } else if (!current && !start.disabled) {
    status.textContent = "当前清单有 " + total + " 个招聘来源，地点表含 " + cities + " 个城市和市镇。点击开始搜索，每周日也会自动复查。";
  }
}).catch(() => {});

const directory = $("directory");
directory.addEventListener("toggle", async () => {
  if (!directory.open || directory.dataset.loaded) return;
  const message = $("directory-status");
  directory.dataset.loaded = "loading";
  message.textContent = "正在读取已保存的目录。";
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
      group.append(element("summary", city + " · " + employers.length + " 个入口"), list);
      return group;
    }));
    message.textContent = cities.length + " 个城市和市镇 · " + total + " 个招聘入口";
    directory.dataset.loaded = "ready";
  } catch (error) {
    message.textContent = "读取目录失败。合上后重新展开可重试。";
    delete directory.dataset.loaded;
  }
});
