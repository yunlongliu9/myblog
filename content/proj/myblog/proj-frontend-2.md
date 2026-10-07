So now the frontend has been successfully deployed in server docker, but we need nginx to forward these reqs instead of let all of them go onto our server directly;

# nginx docker (docker-compose to manage all docker imgs)
+ downloaded and installed docker nginx on server;
Ubuntu
└── Docker
    ├── nginx
    ├── web        Next.js
    ├── api        NestJS(later)
    └── postgres   PostgreSQL(later)

instead of using docker run -d ... myblog-web to run;
with nginx , use `docker compose up -d` ;