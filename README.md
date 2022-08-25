# Paraulogic Backend

[![Uses Gitmoji][gitmoji-badge]](https://gitmoji.dev)

The backend code for the Paraulogic's apps.

### Repository State

![GitHub issues][issues-badge]
![GitHub commit activity][commit-activity-badge]

### Release

![package.json version][package-version-badge]
[![Latest Release][release-version-badge]][latest-release]

### Build

[![Docker Hub Build Status][docker-build-badge]][docker-hub]
[![Github Container Build Status][github-build-badge]][github-container]


[gitmoji-badge]: https://img.shields.io/static/v1?label=Gitmoji&message=%20%F0%9F%98%9C%20%20%F0%9F%98%8D&color=FFDD67&style=for-the-badge

[package-version-badge]: https://img.shields.io/github/package-json/v/Paraulogic/Backend?style=for-the-badge

[release-version-badge]: https://img.shields.io/github/v/release/Paraulogic/Backend?include_prereleases&style=for-the-badge

[issues-badge]: https://img.shields.io/github/issues/Paraulogic/Backend?style=for-the-badge

[commit-activity-badge]: https://img.shields.io/github/commit-activity/m/Paraulogic/Backend?style=for-the-badge

[docker-build-badge]: https://img.shields.io/github/workflow/status/Paraulogic/Backend/docker-ci?label=Docker%20Hub&style=for-the-badge

[github-build-badge]: https://img.shields.io/github/workflow/status/Paraulogic/Backend/docker-ci-tag?label=Github&style=for-the-badge

[docker-hub]: https://hub.docker.com/repository/docker/arnyminerz/paraulogic-backend

[github-container]: https://github.com/Paraulogic/Backend/pkgs/container/backend

[latest-release]: https://github.com/Paraulogic/Backend/releases/latest

[issues]: https://github.com/Paraulogic/Backend/issues

# How to use

The recommended method to use is Docker Compose files, since a lot of variables and syncing is required.

Also having production and development compose files is something to have into account. For example, the
development `docker-compose.yml` file:

```yaml
version: '3'

services:
  api:
    build: .
    container_name: api
    restart: unless-stopped
    ports:
      - "${HTTP_PORT}:${HTTP_PORT}"
    environment:
      HTTP_PORT: "${HTTP_PORT}"
    working_dir: /opt/api
    links:
      - db
    volumes:
      - ./:/opt/api
      - node_modules:/opt/api/node_modules
  db:
    image: mongo
    container_name: mongo_db
    restart: always
    expose:
      - "27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
  node_modules:
```

and `docker-compose.override.yml` for production environments:

```yaml
version: '3'

services:
  api:
    image: arnyminerz/paraulogic-backend:latest
    restart: always
    ports:
      - "80:80"
    environment:
      HTTP_PORT: "80"

```

Those files are already available in the repository, and can be launched with:

```shell
docker-compose up -d
```

for development. And

```shell
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

This last one will override certain parameters to make sure the environment is as stable as possible. The image will be
selected from the already prebuilt ones at the container repository, and port will be preset at `80`.

For development environments, the default port is `3000`, however, you can override it with environment variables.

# Environment variables

Environment variables can be passed manually with the Docker Compose files, or using a `.env` file:

```.dotenv
# The port to use for receiving the http requests.
# Defaults to 3000
HTTP_PORT=3000

# The name of the Mongo database.
# Defaults to "paraulogic"
DATABASE_NAME=paraulogic
```
