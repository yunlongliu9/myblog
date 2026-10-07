1. create Next.js app
2. start localhost to validate frontend 
3. then try NestJS


# initialize frontend next.js app
+ `pnpm create next-app apps/web`

TypeScript       ✅
ESLint           ✅
Tailwind CSS     ✅
App Router       ✅
then
+ cd /apps/web `pnpm dev` to activate the proj(frontend)

dependencies (app dependency)
├── next
├── react
└── react-dom

devDependencies(tool chain dependency - typecheck/css build/...)
├── typescript
├── eslint
├── @types/react
├── @types/node
└── tailwindcss

# try to deploy the frontend(tested well) on server
+ `output: "standalone",` should be added into apps/web/next.config.ts
this will generate a seperate and independent productive directory only with node.js independencies [that is needed]; like ".next/standalone" then only the productive env needed  will be put into Docker image;

+ pnpm --filter web build
only build those scripts in workspace "web";
that is:


myblog workspace
├── apps/web      ← build this!!!!
├── apps/api      ← ignore
└── packages/*    ← no build


# dockerfile

after dockerfile, 
+ docker build -f apps/web/Dockerfile -t myblog-web .

and due to huge tons of data in dependencies, need to write gitignore and dockerignore(prevent the dependencies into img)
