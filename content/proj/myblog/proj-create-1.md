# env check
+ node -v
+ pnpm -v
(brew install pnpm)
>pnpm is a package manager like maven of java 

>package.json = pom.xml 

>pnpm install/list/workspace
>![analog.png](https://raw.githubusercontent.com/Viende/fresh-photos/main/photo1/20261007214347.png) 
# start
+ pnpm init 
(pnpm init to create package.json (package management))

But now it is still not monorepo so we need workspace:  create pnpm-workspace.yaml in root dir.
then only apps/* and packages/* files will be regarded into pnpm(context and docs are not codes ,so excluded);

 then pnpm add -D -w turbo

# turbo
withou turbo, need to go to each dir to pnpm build xxx.But with turbo it is easier to build the project according to some sequences(to some extend similar to docker-compose).
