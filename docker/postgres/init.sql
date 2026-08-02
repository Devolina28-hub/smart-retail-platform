-- Auto-run by the official Postgres image on first container start
-- (mounted into /docker-entrypoint-initdb.d/). Creates the schema ahead
-- of the API's first request so nothing races on a cold start.
\i /docker-entrypoint-initdb.d/schema.sql
