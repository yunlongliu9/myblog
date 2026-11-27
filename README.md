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
