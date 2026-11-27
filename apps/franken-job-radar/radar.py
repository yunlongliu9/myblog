"""Fresh crawls of employer career pages and a persistent Sunday inventory."""

import argparse
from collections import Counter, deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timezone
from html import unescape
from ipaddress import ip_address
from html.parser import HTMLParser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import math
from pathlib import Path
import os
import re
import socket
from threading import Lock, Thread
from time import sleep
import unicodedata
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, unquote, urljoin, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
from urllib.robotparser import RobotFileParser
from uuid import uuid4
from xml.etree import ElementTree
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
DATA = Path(os.environ.get("RADAR_DATA_DIR", str(ROOT / "data")))
INVENTORY = DATA / "inventory.json"
AGENT = "FrankenJobRadar/1.0"
CENTER = (49.4521, 11.0767)
MAJOR = {"Würzburg", "Coburg", "Bamberg", "Bayreuth", "Schweinfurt", "Hof", "Aschaffenburg"}
DIRECTIONS = {
    "cloud": r"cloud computing|cloud infrastructure|cloud engineer|cloud archite|cloud developer|cloud plattform|cloud platform|cloud.native|cloud operations|aws\b|azure\b|gcp\b|kubernetes|plattform.engineer|platform engineer|devops|distributed systems?|verteilte systeme|sre",
    "software": r"software[- ]?(?:entwickl|entwickler|engineer|entwickel|development|developer|archite|design|testing)|full.?stack|front.?end|back.?end|anwendungsentwickl|webentwickl|(?:sap|java|python|c[+#]+|typescript|rust|golang|web|app|api|embedded|\.net) developer|programmier",
    "security": r"cyber.?security|information.?security|informationssicherheit|it.sicherheit|it.security|isms|it.governance|it.audit|grc|nis.?2|iso.?27001",
    "bpm": r"low[- ]code|business process|prozess(management|optimierung|digitalisierung|automatisierung)|digitalisier|digital transformation|bpm[n]?\b|process mining|workflow automation|rpa\b",
    "agent": r"agentic|(?:ai|ki|llm)[- ]agents?|(?:ai|ki)[- ]agenten|multi[- ]agent|langgraph|crewai|autogen|agent development|agentenentwicklung|agent orchestration",
    "cloud-security": r"cloud.{0,25}(?:security|sicherheit|governance|compliance)|(?:security|governance).{0,25}cloud|devsecops|cnapp|cspm",
}
SOFTWARE_TITLE = re.compile(r"\b(?:developer|entwickler|entwicklerin)\b", re.I)
OTHER_DEVELOPER = re.compile(r"business development|business developer|personalentwickl|organisationsentwickl|hardwareentwickl|mechanikentwickl", re.I)
STUDENT = re.compile(r"werk\s*student|working\s*student|werkstudier|praktik|praxissemester|internship|\bintern\b|studentische hilfskraft|\bpractice\b", re.I)
OTHER_STUDENT = re.compile(r"abschlussarbeit|bachelorarbeit|masterarbeit|\bthesis\b|ausbildung|apprentice|duales studium|dual study|student job|student assistant|\bstudent\b|volontariat|ferienjob", re.I)
OFF_TOPIC_TITLE = re.compile(
    r"arbeitsrecht|sozialrecht|rechtsreferendar|arbeitssicherheit|arbeitsmedizin|gefahrstoff|corporate controller|"
    r"eventmanagement|corporate events|einkäufer|procurement partner|thermomanagement|leistungselektronik|konstruktion elektrischer maschinen|schaltungsmodul",
    re.I,
)
SCHOOL_INTERNSHIP = re.compile(r"sch[üu]lerpraktik|schulpraktik|school internship|high school intern", re.I)
SENIOR = re.compile(r"\b(?:senior|sr\.?|lead|principal|staff|director|leiter(?:in)?|leitung|head|chief|vp|vice president|experienced|berufserfahrene|niveau senior)\b", re.I)
NON_REGULAR = re.compile(r"freelance|selbstständig|\bcontractor\b|volunteer|ehrenamt|\btemporary\b|external|consultant on demand", re.I)
EXPERIENCE = re.compile(r"(?:mindestens|minimum|at least|mehr als|over)?\s*([5-9]|[1-9]\d)\s*\+?\s*(?:jahre|years)(?:\s+(?:of\s+)?(?:experience|berufserfahrung))", re.I)
CAREER = re.compile(r"karriere|career|stellenangebote|stellenb[öo]erse|stellenportal|stellenmarkt|jobboard|jobsearch|job-search|open.positions|vacancies|recruiting|bewerbung|alle jobs|job openings|offene stellen|successfactors|myworkdayjobs|smartrecruiters|personio|greenhouse", re.I)
DETAIL = re.compile(r"/(?:job|position|vacancy|jobdetail|stellenangebot|stellenanzeige|job-details|jobdetailseite|vacatures|jobs?)/(?:[^/?#]+[-/][^?#]+|\d+)(?:[/?#]|$)|[?&](?:jobid|job-id|job_id|jobId|jobRequisitionId|positionId|reqId|vacancyId)=", re.I)
ATS = ("myworkdayjobs.com", "personio.de", "personio.com", "smartrecruiters.com", "successfactors.eu", "successfactors.com", "greenhouse.io", "lever.co", "rexx-recruitment.com", "onlyfy.jobs", "softgarden.io", "teamtailor.com", "dvinci-hr.com", "recruitee.com", "b-ite.com", "bewerbermanagement.net", "umantis.com", "mana-hr.de")
SKIP = re.compile(r"\.(?:pdf|jpg|jpeg|png|svg|css|js|zip|mp4|woff2?)(?:$|\?)|/(?:login|privacy|datenschutz|impressum|share|signin)(?:/|$)", re.I)


def rows(name):
    return [line.split("\t") for line in (ROOT / name).read_text().splitlines() if line and not line.startswith("#")]


def flat(value):
    value = str(value or "").casefold().replace("ß", "ss")
    return "".join(ch for ch in unicodedata.normalize("NFKD", value) if not unicodedata.combining(ch))


CITIES = {}
ALIASES = {}
for name, lat, lon, *aliases in rows("cities.tsv"):
    extra = aliases[0] if aliases else ""
    CITIES[name] = (float(lat), float(lon))
    for alias in [name, *extra.split("|")]:
        if alias:
            ALIASES[flat(alias)] = name


def distance(a, b):
    lat1, lon1, lat2, lon2 = map(math.radians, (*a, *b))
    h = math.sin((lat1-lat2)/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin((lon1-lon2)/2)**2
    return 6371 * 2 * math.asin(math.sqrt(min(1, h)))


def city_of(value):
    for part in re.split(r"[,;/|\n()]+", flat(value)):
        part = re.sub(r"^(?:de\s+)?(?:\d{5}\s+)?", "", part.strip())
        if part in ALIASES:
            return ALIASES[part]
        words = part.split()
        for cutoff in range(min(8, len(words)-2), 0, -1):
            prefix, street = " ".join(words[:cutoff]), " ".join(words[cutoff:])
            if prefix in ALIASES and re.search(r"(?:str\.?|strasse|street|weg|platz|allee|ring)\s+\d+[a-z]?\b", street):
                return ALIASES[prefix]
    return None


def clean_url(value, base=""):
    try:
        url = urlsplit(urljoin(base, value))
        if url.scheme != "https" or not url.hostname or url.username or url.password or url.port not in (None, 443):
            return None
        if "." not in url.hostname or not re.search(r"\.[a-z]{2,}$", url.hostname):
            return None
        return urlunsplit((url.scheme, url.netloc, url.path or "/", url.query, ""))
    except ValueError:
        return None


def host(url):
    return urlsplit(url).hostname


def same_site(a, b):
    return a == b or a.endswith("." + b) or b.endswith("." + a)


def allowed_link(url, origin):
    return same_site(host(url).removeprefix("www."), host(origin).removeprefix("www.")) or any(
        same_site(host(url), provider) for provider in ATS
    )


def detail_page_url(url):
    path = urlsplit(url).path
    return bool(
        DETAIL.search(unquote(url))
        or re.search(r"-[a-z]{2}-j\d+\.html$|/(?:karriere/(?:jobcenter|detail)|vacancies|offer)/[^/]+", path, re.I)
        or re.search(r"/karriere/job-[^/]+-\d+\.html$|/FolderDetail/[^/]+/\d+$", path, re.I)
        or (host(url) == "jobs.siemens-energy.com" and re.search(r"(?:^|&)folderId=\d+(?:&|$)", urlsplit(url).query))
        or (host(url) == "jobs.smartrecruiters.com" and re.search(r"^/[^/]+/\d+-[^/]+", path))
    )


class CareerPage(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self, content):
        super().__init__(convert_charrefs=True)
        self.links = []
        self.documents = []
        self.in_json = False
        self.script = []
        self.anchor = None
        self.hidden_tag = None
        self.visible = []
        self.microdata = []
        self.feed(content)

    def handle_starttag(self, tag, attrs):
        info = dict(attrs)
        if tag in ("script", "style", "template"):
            self.hidden_tag = tag
        if tag == "script" and info.get("type") == "application/ld+json":
            self.in_json = True
            self.script = []
        if tag == "a" and info.get("href"):
            self.anchor = [info["href"], ""]
        if tag == "iframe" and info.get("src"):
            self.links.append((info["src"], "career recruiting"))
        parent = next((frame["scope"] for frame in reversed(self.microdata) if frame["scope"] is not None), None)
        prop = info.get("itemprop")
        scope = None
        if "itemscope" in info:
            scope = {"@type": (info.get("itemtype") or "").rsplit("/", 1)[-1]}
            if scope["@type"] == "JobPosting":
                self.documents.append(scope)
            if parent is not None and prop:
                self.add_property(parent, prop, scope)
        value = info.get("content") or info.get("datetime") or info.get("href")
        if prop and parent is not None and scope is None and value:
            self.add_property(parent, prop, value)
        capture = prop if parent is not None and scope is None and not value else None
        if tag not in self.VOID and (scope is not None or self.microdata):
            self.microdata.append(dict(tag=tag, scope=scope, prop=capture, parent=parent, text=[]))

    @staticmethod
    def add_property(parent, prop, value):
        if prop == "jobLocation":
            parent.setdefault(prop, []).append(value)
        elif prop not in parent:
            parent[prop] = value

    def handle_data(self, data):
        if not self.hidden_tag:
            self.visible.append(data)
        if self.in_json:
            self.script.append(data)
        if self.anchor:
            self.anchor[1] += data
        if not self.in_json:
            for frame in self.microdata:
                if frame["prop"]:
                    frame["text"].append(data)

    def handle_endtag(self, tag):
        if self.hidden_tag == tag:
            self.hidden_tag = None
        for index in range(len(self.microdata) - 1, -1, -1):
            if self.microdata[index]["tag"] == tag:
                for frame in self.microdata[index:]:
                    if frame["prop"]:
                        self.add_property(frame["parent"], frame["prop"], " ".join(frame["text"]).strip())
                del self.microdata[index:]
                break
        if tag == "script" and self.in_json:
            self.in_json = False
            try:
                self.documents.append(json.loads("".join(self.script)))
            except (ValueError, RecursionError):
                pass
        if tag == "a" and self.anchor:
            self.links.append(tuple(self.anchor))
            self.anchor = None


def postings(value):
    if isinstance(value, list):
        for item in value:
            yield from postings(item)
    if isinstance(value, dict):
        kind = value.get("@type", [])
        if "JobPosting" in kind:
            yield value
        for key in ("@graph", "mainEntity", "itemListElement", "item"):
            yield from postings(value.get(key))


def plain(value):
    return unescape(re.sub(r"<[^>]+>", " ", str(value or "")))


def job_type(title, employment, description):
    if SENIOR.search(title) or SCHOOL_INTERNSHIP.search(title):
        return None
    if STUDENT.search(title) or STUDENT.search(employment):
        return "student"
    if OTHER_STUDENT.search(title) or OTHER_STUDENT.search(employment):
        return None
    if NON_REGULAR.search(title) or NON_REGULAR.search(employment) or EXPERIENCE.search(description):
        return None
    explicit = re.search(r"full[_ -]?time|part[_ -]?time|permanent|festanstellung|unbefristet|vollzeit|teilzeit|berufseinstieg", employment, re.I)
    if not explicit:
        explicit = re.search(r"festanstellung|unbefristet|vollzeit|teilzeit|full.time|part.time|permanent", description, re.I)
    if explicit and not re.search(r"immatrikuliert|currently enrolled|enrolled student", description, re.I):
        return "regular"
    return None


def published(value):
    text = str(value or "")
    for candidate, pattern in ((text[:10], "%Y-%m-%d"), (text, "%a %b %d %H:%M:%S UTC %Y")):
        try:
            return datetime.strptime(candidate, pattern).date().isoformat()
        except ValueError:
            pass
    return ""


def expiry(value):
    if not value:
        return False
    try:
        return date.fromisoformat(str(value)[:10]) < datetime.now(ZoneInfo("Europe/Berlin")).date()
    except ValueError:
        return False


def extract(raw, employer, page, base):
    title = plain(raw.get("title")).strip()
    if not title or re.search(r"initiativbewerbung|unsolicited application|speculative application|talent pool", title, re.I) or expiry(raw.get("validThrough")):
        return []
    description = plain(raw.get("description"))
    employment = str(raw.get("employmentType") or "")
    kind = job_type(title, employment, description)
    if not kind:
        return []
    role_text = re.split(
        r"\b(?:was wir bieten|was wir dir bieten|das bieten wir|deine benefits|unsere benefits|what we offer|your benefits|über uns|about us)\b",
        description, maxsplit=1, flags=re.I,
    )[0]
    directions = [key for key, expr in DIRECTIONS.items() if re.search(expr, title + " " + role_text, re.I)]
    if "software" not in directions and SOFTWARE_TITLE.search(title) and not OTHER_DEVELOPER.search(title):
        directions.append("software")
    if "agent" in directions and not re.search(DIRECTIONS["agent"], title, re.I):
        application = r"entwickl|develop|build|implement|integrat|programmier|engineer|orchestrat"
        if not re.search(
            rf"(?:{application}).{{0,110}}(?:{DIRECTIONS['agent']})|(?:{DIRECTIONS['agent']}).{{0,110}}(?:{application})",
            role_text, re.I | re.S,
        ):
            directions.remove("agent")
    if not directions or (OFF_TOPIC_TITLE.search(title) and not any(
            re.search(DIRECTIONS[key], title, re.I) for key in ("cloud", "software", "security", "agent", "cloud-security"))):
        return []
    org = raw.get("hiringOrganization")
    company = plain(org.get("name") if isinstance(org, dict) else org).strip()
    locations = raw.get("jobLocation")
    locations = locations if isinstance(locations, list) else [locations]
    url = clean_url(raw.get("url") or page, page)
    if not url or not allowed_link(url, base):
        url = page
    if url == page and not DETAIL.search(url) and (url == base or "/search/" in urlsplit(url).path):
        return []
    output = []
    for location in locations:
        address = location.get("address") if isinstance(location, dict) else None
        address = address if isinstance(address, dict) else {}
        country = address.get("addressCountry")
        if isinstance(country, dict):
            country = country.get("name")
        if country and flat(country) not in {"de", "deu", "germany", "deutschland"}:
            continue
        region = address.get("addressRegion")
        if region and flat(region) not in {"by", "bavaria", "bayern", "de-by", "mittelfranken", "oberfranken", "unterfranken"}:
            continue
        city = city_of(address.get("addressLocality") or address.get("streetAddress") or address.get("addressRegion"))
        if city:
            output.append(dict(title=title, company=company or employer, city=city, url=url, kind=kind,
                               directions=directions, posted=published(raw.get("datePosted")),
                               lat=CITIES[city][0], lon=CITIES[city][1]))
    return output


def public_target(url):
    target = clean_url(url)
    if not target:
        raise ValueError("不支持的来源地址")
    addresses = socket.getaddrinfo(host(target), 443, type=socket.SOCK_STREAM)
    if not addresses or any(not ip_address(address[4][0]).is_global for address in addresses):
        raise ValueError("来源须指向公网")
    return target


class SafeRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return super().redirect_request(req, fp, code, msg, headers, public_target(newurl))


OPENER = build_opener(SafeRedirect())


def download(url):
    with OPENER.open(Request(public_target(url), headers={"User-Agent": AGENT, "Accept-Language": "de-DE,de;q=0.9,en;q=0.7",
                                      "Cache-Control": "no-cache"}), timeout=10) as response:
        resolved = clean_url(response.url)
        if not resolved:
            raise ValueError("不支持的来源地址")
        payload = response.read(2_000_001)
        if len(payload) > 2_000_000:
            raise ValueError("页面过大")
        return resolved, payload.decode(response.headers.get_content_charset() or "utf-8", "replace")


def employer_posting(page, html):
    site = host(page)
    path = urlsplit(page).path
    if site == "jobs.siemens.com" and re.search(r"/JobDetail/\d+/?$", path, re.I):
        title = re.search(r'<meta property="og:title" content="([^"]+)"', html, re.I)
        locations = re.search(r'<ul[^>]+list--locations[^>]*>(.*?)</ul>', html, re.I | re.S)
        if not title or not locations:
            return None
        cities = [plain(location).strip().split(" - ", 1)[0] for location in
                  re.findall(r"<li\b[^>]*>(.*?)</li>", locations[1], re.I | re.S)]
        fields = {plain(label).strip(): plain(value).strip() for label, value in re.findall(
            r'field__label"[^>]*>(.*?)</div>\s*<div class="article__content__view__field__value"[^>]*>(.*?)</div>',
            html, re.S)}
        contract = " ".join(fields.get(field, "") for field in ("Beschäftigungsart", "Vertragsart", "Erfahrungsniveau"))
        description = html.split('id="section1__content"', 1)[-1].split("</article>", 1)[0]
    elif site == "career.hetzner.com" and re.search(r"/jobs/[^/]+-j\d+/?$", path, re.I):
        detail = html.split('id="jobTplContainer"', 1)[-1].split("Jetzt bewerben", 1)[0]
        title = re.search(r"<h1\b[^>]*>(.*?)</h1>", detail, re.I | re.S)
        cities = [plain(city).strip() for city in re.findall(
            r'fa-map-marker-alt[^>]*></i>(.*?)</li>', detail, re.I | re.S)]
        employment = re.search(r'fa-clock[^>]*></i>(.*?)</li>', detail, re.I | re.S)
        if not title or not cities:
            return None
        contract = plain(employment[1]).strip() if employment else ""
        description = detail
    else:
        return None
    return {
        "title": plain(title[1]), "description": description, "employmentType": contract,
        "jobLocation": [{"address": {"addressLocality": city}} for city in cities],
    }


def html_job_posting(page, doc, html):
    if not detail_page_url(page):
        return None
    iso_job = host(page) == "www.iso-gruppe.com" and "/karriere/jobcenter/" in urlsplit(page).path
    has_application = any(
        re.search(r"jetzt bewerben|online.?bewerbung|online bewerben|apply now|apply here|bewerbung einreichen|^bewerben$",
                  label.strip(), re.I) or (iso_job and re.search(r"/karriere/bewerbung/\d+", href))
        for href, label in doc.links
    )
    if not has_application and not (iso_job and re.search(r"Kennziffer:\s*ISO-\d+", " ".join(doc.visible), re.I)):
        return None
    title = re.search(r"<h1\b[^>]*>(.*?)</h1>", html, re.I | re.S)
    if not title:
        return None
    fields = [text.strip() for text in doc.visible if text.strip()]
    locations = []
    employment = []
    for index, field in enumerate(fields):
        location = re.fullmatch(r"(?:arbeitsort|einsatzort|standort(?:\(e\))?|job location|location)(?:\s*:\s*|\s+|$)(.*)", field, re.I)
        if location:
            value = location[1] or (fields[index + 1] if index + 1 < len(fields) else "")
            if value:
                locations.append(value)
        contract = re.fullmatch(r"(?:beschäftigungsart|anstellungsart|arbeitszeit|employment type|contract type)(?:\s*:\s*|\s+|$)(.*)", field, re.I)
        if contract:
            employment.append(contract[1] or (fields[index + 1] if index + 1 < len(fields) else ""))
    if not locations and host(page) == "www.ncp-e.com" and "/karriere/detail/" in urlsplit(page).path:
        for field in fields:
            match = re.search(r"\bunserem Standort (.+?)[.!]?$", field, re.I)
            if match and city_of(match[1]):
                locations.append(match[1])
    if not locations:
        return None
    content = re.search(r"<(?:main|article)\b[^>]*>(.*?)</(?:main|article)>", html, re.I | re.S)
    if not content:
        description = ""
    else:
        description = " ".join(CareerPage(content[1]).visible)
    return {
        "title": plain(title[1]), "description": description, "employmentType": " ".join(employment),
        "jobLocation": [{"address": {"addressLocality": value}} for value in locations],
    }


def workday_job_links(page, policies):
    site = urlsplit(page)
    if not site.hostname.endswith(".myworkdayjobs.com") or DETAIL.search(page):
        return []
    portal = site.path.strip("/").rsplit("/", 1)[-1]
    if not re.fullmatch(r"[A-Za-z0-9_-]+", portal):
        return []
    sitemap = urljoin(page, f"/{portal}/siteMap.xml")
    if not check_robots(sitemap, policies):
        return []
    _, xml = download(sitemap)
    return [(entry.text, "") for entry in ElementTree.fromstring(xml).iter()
            if entry.tag.rsplit("}", 1)[-1] == "loc" and entry.text and DETAIL.search(entry.text)
            and clean_url(entry.text) and host(entry.text) == site.hostname]


def check_robots(url, policies):
    site = urlsplit(url).netloc
    if site not in policies:
        policy = RobotFileParser()
        try:
            _, rules = download(f"https://{site}/robots.txt")
        except HTTPError as error:
            if error.code not in (404, 410):
                raise
            rules = ""
        policy.parse(rules.splitlines())
        policies[site] = policy
    return policies[site].can_fetch(AGENT, url)


EMPLOYERS = rows("employers.tsv")
PRIORITY_EMPLOYERS = {row[0] for row in EMPLOYERS if row[3:] == ["priority"]}


def priority_employer(employer, city):
    return city in MAJOR or employer in PRIORITY_EMPLOYERS


def fetch_issue(error):
    if isinstance(error, HTTPError):
        if error.code in (502, 503, 504) and error.headers and error.headers.get("Server", "").lower() == "envoy":
            try:
                if b"upstream connect error" in error.read(512):
                    return "gateway_connection"
            except OSError:
                pass
        return f"http_{error.code}"
    reason = error.reason if isinstance(error, URLError) else error
    if isinstance(reason, socket.gaierror):
        return "dns"
    if isinstance(reason, TimeoutError):
        return "timeout"
    if isinstance(reason, ValueError):
        return "invalid_response"
    return "connection"


def crawl(employer, city, root, previous=(), report_jobs=None):
    budget = 32 if distance(CENTER, CITIES[city]) <= 50 else 25 if priority_employer(employer, city) else 12
    listing = root
    if host(root) in {"jobs.fraunhofer.de", "jobs.schaeffler.com", "jobs.zf.com", "jobs.koenig-bauer.com", "jobs.danfoss.com"}:
        listing = urljoin(root, "/search/?" + urlencode({"q": "", "locationsearch": city}))
    if host(root) == "jobs.siemens.com":
        listing = urljoin(root, "/de_DE/externaljobs/SearchJobs/?" + urlencode({"search": city}))
    queue = deque([(listing, 0)])
    seen = set()
    policies = {}
    jobs = {}
    failures = 0
    issues = Counter()
    recognized = 0
    empty = False
    depth_limited = False
    removed = set()
    while queue and len(seen) < budget:
        url, depth = queue.popleft()
        if url in seen:
            continue
        seen.add(url)
        stage = "robots"
        try:
            if not check_robots(url, policies):
                failures += 1
                issues["robots:disallowed"] += 1
                continue
            stage = "entry" if url == listing else "page"
            if depth:
                sleep(0.15)
            page, html = download(url)
            # Official career links may redirect to a dedicated recruiting domain.
            doc = CareerPage(html)
        except HTTPError as error:
            if error.code in (404, 410) and error.url == url and url != listing:
                removed.add(url)
            failures += 1
            issues[f"{stage}:{fetch_issue(error)}"] += 1
            continue
        except (OSError, ValueError, LookupError, RecursionError) as error:
            failures += 1
            issues[f"{stage}:{fetch_issue(error)}"] += 1
            continue
        records = list(postings(doc.documents))
        if not records:
            adapted = employer_posting(page, html) or html_job_posting(page, doc, html)
            if adapted:
                records.append(adapted)
        recognized += len(records)
        page_jobs = {}
        for raw in records:
            for job in extract(raw, employer, page, root):
                page_jobs[(job["url"], job["city"])] = job
        jobs.update(page_jobs)
        if report_jobs and page_jobs:
            report_jobs(page_jobs)
        if url == listing:
            empty = bool(re.search(r"keine (?:offenen stellen|passenden stellen|stellenangebote)|no (?:current openings|open positions|jobs found)",
                                   " ".join(doc.visible), re.I))
        if records and detail_page_url(page):
            continue
        links = []
        try:
            careers_links = doc.links + workday_job_links(page, policies)
        except (OSError, ValueError, LookupError, ElementTree.ParseError) as error:
            careers_links = doc.links
            failures += 1
            issues[f"feed:{fetch_issue(error)}"] += 1
        for href, label in careers_links:
            target = clean_url(href, page)
            if not target or target in seen or SKIP.search(target) or not allowed_link(target, page):
                continue
            if detail_page_url(target):
                relevance = any(re.search(expression, unquote(target) + " " + label, re.I) for expression in DIRECTIONS.values())
                links.append((0 if relevance else 1, target))
            elif re.search(r"(?i)(?:^|\b)(?:next|weiter|nächste)(?:\b|$)|[?&](?:page|startrow|jobOffset)=", label + " " + target):
                links.append((2, target))
            elif listing == root and CAREER.search(unquote(target) + " " + label):
                listing_link = re.search(
                    r"stellenangebot|offene stellen|open positions|job openings|job offers|vacancies|jobportal|alle jobs",
                    unquote(urlsplit(target).path) + " " + label, re.I,
                )
                links.append((2 if listing_link else 3, target))
        for _, target in sorted(set(links)):
            if depth < 3:
                queue.append((target, depth + 1))
            else:
                depth_limited = True
    remaining = depth_limited or any(url not in seen for url, _ in queue)
    if remaining:
        issues["crawl:page_limit"] += 1
    if not recognized and not empty and len(seen) > failures:
        issues["crawl:no_job_data"] += 1
    status = "failed"
    if recognized or empty:
        status = "partial" if remaining or failures else "ok"
    if status != "ok":
        found = {url for url, _ in jobs}
        for url in {job["url"] for job in previous} - found - removed:
            if not clean_url(url) or not allowed_link(url, root):
                continue
            try:
                if check_robots(url, policies):
                    sleep(0.15)
                    detail_page, html = download(url)
                    if detail_page == url and any(expiry(job.get("validThrough")) for job in postings(CareerPage(html).documents)):
                        removed.add(url)
            except HTTPError as error:
                if error.code in (404, 410) and error.url == url:
                    removed.add(url)
            except (OSError, ValueError, LookupError, RecursionError):
                pass
    return dict(company=employer, city=city, url=root, status=status,
                pages=len(seen), error=failures, structured=recognized, jobs=list(jobs.values()),
                removed=sorted(removed), issues=dict(issues))


SOURCES = sorted(
    (tuple(row[:3]) for row in EMPLOYERS if row[1] in CITIES),
    key=lambda row: distance(CENTER, CITIES[row[1]]) - (35 if priority_employer(*row[:2]) else 0),
)
def employer_directory():
    by_city = {}
    for name, city, url in SOURCES:
        by_city.setdefault(city, []).append({"name": name, "url": url})
    return [
        {"city": city, "employers": sorted(employers, key=lambda item: flat(item["name"]))}
        for city, employers in sorted(by_city.items(), key=lambda item: flat(item[0]))
    ]


LOCK = Lock()
RUNS = {}
ACTIVE = None
COMPLETED = None


def read_inventory():
    try:
        return json.loads(INVENTORY.read_text())
    except (OSError, ValueError):
        return {"sources": {}}


def save_inventory(run):
    previous = read_inventory()
    sources = previous.get("sources", {})
    for source in run["sources"]:
        url = source["url"]
        prior = sources.get(url, {}).get("jobs", [])
        removed = set(source.get("removed", []))
        known = {} if source["status"] == "ok" else {
            (job["url"], job["city"]): job for job in prior if job["url"] not in removed
        }
        known.update({(job["url"], job["city"]): job for job in source["jobs"]})
        checked = {(job["url"], job["city"]) for job in source["jobs"]}
        sources[url] = {**source, "jobs": [
            {**job, "unverified": key not in checked} for key, job in known.items()
        ]}
    active_urls = {url for _, _, url in SOURCES}
    sources = {url: source for url, source in sources.items() if url in active_urls}
    DATA.mkdir(parents=True, exist_ok=True)
    temporary = INVENTORY.with_suffix(".tmp")
    temporary.write_text(json.dumps({"week": run["week"] or previous.get("week"), "finished": run["finished"],
                                    "sources": sources}, ensure_ascii=False))
    temporary.replace(INVENTORY)


def execute(run):
    global ACTIVE, COMPLETED
    def report_jobs(jobs):
        with LOCK:
            run["live_jobs"].update(jobs)

    try:
        prior = read_inventory().get("sources", {}) if run["week"] else {}
        with ThreadPoolExecutor(max_workers=16) as pool:
            tasks = {
                pool.submit(crawl, *source, prior.get(source[2], {}).get("jobs", []), report_jobs): source
                for source in SOURCES
            }
            for task in as_completed(tasks):
                employer, city, url = tasks[task]
                try:
                    result = task.result()
                except Exception:
                    result = dict(company=employer, city=city, url=url, status="failed", pages=0, error=1, jobs=[], issues={"crawl:internal_error": 1})
                with LOCK:
                    run["sources"].append(result)
        run["finished"] = datetime.now(timezone.utc).isoformat()
        save_inventory(run)
    except Exception as error:
        run["error"] = "保存或抓取失败：" + str(error)
    finally:
        with LOCK:
            run["done"] = True
            run.pop("live_jobs", None)
            ACTIVE = None
            COMPLETED = run["id"]
            for old in list(RUNS)[:-12]:
                RUNS.pop(old, None)


def start(week=None):
    global ACTIVE
    with LOCK:
        if ACTIVE:
            return None
        run = dict(id=uuid4().hex, sources=[], live_jobs={}, total=len(SOURCES), done=False, week=week, finished=None)
        RUNS[run["id"]] = run
        ACTIVE = run["id"]
        thread = Thread(target=execute, args=(run,), daemon=True)
        thread.start()
        return run["id"], thread


def schedule():
    while True:
        now = datetime.now(ZoneInfo("Europe/Berlin"))
        if now.weekday() == 6 and now.hour >= 5:
            week = now.date().isoformat()
            if read_inventory().get("week") != week:
                start(week)
        sleep(60)


def public_run(run):
    result = {key: value for key, value in run.items() if key != "live_jobs"}
    result["sources"] = [
        {key: value for key, value in source.items() if key not in ("jobs", "removed")}
        for source in run["sources"]
    ]
    if "live_jobs" in run:
        result["jobs"] = list(run["live_jobs"].values())
    else:
        result["jobs"] = [job for source in run["sources"] for job in source["jobs"]]
    return result


class Handler(BaseHTTPRequestHandler):
    def send(self, data, mime="application/json; charset=utf-8", status=200):
        body = data if isinstance(data, bytes) else json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path.startswith("/api/runs/"):
            with LOCK:
                run = RUNS.get(path.rsplit("/", 1)[-1])
                response = public_run(run) if run else {"error": "找不到这一轮搜索"}
            self.send(response, status=200 if run else 404)
        elif path == "/api/employers":
            self.send({"cities": employer_directory(), "total": len(SOURCES)})
        elif path == "/api/inventory":
            inventory = read_inventory()
            sources = list(inventory.get("sources", {}).values())
            self.send(public_run({"sources": sources, "done": True, "finished": inventory.get("finished")}))
        elif path == "/api/status":
            with LOCK:
                self.send({"active": ACTIVE, "last": COMPLETED, "total": len(SOURCES), "cities": len(CITIES),
                           "inventory": read_inventory().get("finished")})
        elif path in ("/", "/app.js", "/style.css"):
            file, mime = {"/": ("index.html", "text/html"), "/app.js": ("app.js", "text/javascript"),
                          "/style.css": ("style.css", "text/css")}[path]
            self.send((ROOT / "web" / file).read_bytes(), mime + "; charset=utf-8")
        else:
            self.send({"error": "页面不存在"}, status=404)

    def do_POST(self):
        if self.path != "/api/runs":
            self.send({"error": "页面不存在"}, status=404)
            return
        if self.headers.get("X-Radar-Search") != "1":
            self.send({"error": "请从搜索页面发起"}, status=403)
            return
        started = start()
        if not started:
            self.send({"error": "已有一轮正在抓取。完成后可以开始新的搜索。"}, status=409)
            return
        self.send({"id": started[0]}, status=202)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=3000)
    parser.add_argument("--crawl-once", action="store_true")
    options = parser.parse_args()
    if options.crawl_once:
        run_id, worker = start()
        worker.join()
        results = RUNS[run_id]
        print(json.dumps({key: value for key, value in public_run(results).items() if key != "jobs"}, ensure_ascii=False, indent=2))
        raise SystemExit(int(bool(results.get("error") or not any(s["status"] != "failed" for s in results["sources"]))))
    Thread(target=schedule, daemon=True).start()
    ThreadingHTTPServer((options.host, options.port), Handler).serve_forever()
