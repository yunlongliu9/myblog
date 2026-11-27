# myblog
my own blog website, depolyed on my windows pc as a server by means of cloudflare tunnel(free) and .tech for my hostname

[my website](https://yunlongliu.tech)


aim
1. useful posts according to my experience
2. useful courses informaion about informatic to fast review which is benefical for job interview
3. resource to explore in the future
4. self recognition and improvement
5. finial investment dairy

config:
all the configuration files

static:
all the notes and other static files like html

src:
source code files

## News at /news

The desktop and mobile menus link to `/news`. Nginx sends `/news` and its assets and API to the Morgenbrief service on the private Compose network. The homepage and other routes still use the Next.js service.

The reader source in `apps/morgenbrief` was imported from [Morgenbrief at 3e8de56](https://github.com/yunlongliu9/Morgenbrief/commit/3e8de5600a32c5bdd7e878e29ffc694d5bac0aed) and mounted at `/news`. The container builds from the files in this repository without fetching the upstream project.

On the Windows host, run from the `myblog` checkout:

```powershell
git pull --ff-only
docker compose up -d --build
docker compose restart nginx
curl.exe --fail http://localhost/news
curl.exe --fail http://localhost/news/api/editions
```

Once the existing Cloudflare Tunnel is connected, the public route is https://yunlongliu.tech/news.

### Automatic evening edition

The container reads `content/morgenbrief/latest.json` from this repository. That data file
holds two editions per date and may include the next scheduled publication.
New issues become eligible at 18:00 in Europe/Berlin, including daylight-saving
changes. The previous complete issue remains available during failed updates.
An already-open reader checks for a new issue every 20 seconds while visible.

To roll out this feed support the first time, rebuild only the `morgenbrief`
container and restart Nginx. Updating the JSON content afterwards requires no rebuild.

```powershell
git pull --ff-only
docker compose up -d --build --no-deps morgenbrief
docker compose restart nginx
```

## Franken Job Radar at /services

The Services page links to the radar at `/services/franken-job-radar/`. Nginx proxies that route, including its assets and search API, to the Python service on the Compose network. The service publishes a snapshot in the `franken-job-radar-data` volume every Friday at 05:00 Europe/Berlin, or after it starts if that update was missed. Visitors read the snapshot and cannot start a crawl.

The radar was imported from [franken-job-radar at 6628e2b](https://github.com/yunlongliu9/franken-job-radar/commit/6628e2bb4e798122540d4d63f6cfd2301fbff11b) with relative frontend URLs so it works under the Services route.

From the `myblog` checkout on the Windows host:

```powershell
git pull --ff-only
docker compose up -d --build web franken-job-radar nginx
docker compose restart nginx
curl.exe --fail http://localhost/services
curl.exe --fail http://localhost/services/franken-job-radar/api/status
```

## Supermarket offers at /service/food

[Open the offers page](https://yunlongliu.tech/service/food/). Nginx serves the page and
its assets from [coupon-necessarities](https://yunlongliu9.github.io/coupon-necessarities/).
The existing GitHub Actions workflow updates the offer data every Monday at 05:00
Europe/Berlin. Weekly updates need no changes on the Windows host.

Run once from the `myblog` checkout on the Windows host:

```powershell
git pull --ff-only
docker compose exec nginx nginx -t
docker compose restart nginx
curl.exe --fail --location http://localhost/service/food
curl.exe --fail http://localhost/service/food/offers.json
```
