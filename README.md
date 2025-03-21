# FoodLogger

This is a learning project using full stack TypeScript.

default remix readme shown below:

# Welcome to Remix!

- 📖 [Remix docs](https://remix.run/docs)

## Development

Note: after stepping away from the project for a little bit, seems like my version of mysql (which I installed with homebrew) has issues authenticating my db user from my .env file because the mysql version got upgraded? Or maybe it wasn't and something else changed. In any case, I dockerized the app for development use (also plan to deploy to production using docker and containers) around March 2025 and as part of this effort I added a db backup I previously made to the mysql image startup scripts to init the db with the backup. The `compose.yml` file for docker compose local dev expects a directory called `db_init` in the root of the project containing files that will run the first time the mysql container is started, and this `db_init` directory was added to `.gitignore`. So if anyone else (or future me) needs to clone this project at some point, they should reach out to me asking for a copy of the db backup before running the app for the first time. **See below for list of steps to follow for local dev using docker compose**

### Instructions for running locally with docker compose

1. Clone the project
2. I will send over database backup (if desired)
3. Create a directory in the root of the project called `db_init`
4. Save the database backup file (aka a db dump) into the `db_init` directory
5. Run `docker compose up --build` to build all the containers from the `compose.yml` file
6. Check that you can access the app at `http://localhost:5137`

Run the dev server locally (not in docker):

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`
