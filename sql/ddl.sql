----- CREATE SCHAMA statement -----
create schema dataset_name;

create schema if not exists dataset_name
-- break
options();

----- CREATE TABLE statement -----
create table table_name (x int64);

create temporary table table_name (x int64, y int64);

create or replace table table_name (x int64 options(description = 'dummy'))
partition by _partitiondate
options(partition_expiration_days = 1);

create table if not exists table_name (x int64 not null)
cluster by x
as select 1 union all select 2;

-- EXTERNAL
create external table table_name
with partition columns
options (
  uris = ['dummy'],
  format = csv
);

create external table table_name
with partition columns (
    col1 string
)
options (
  uris = ['dummy'],
  format = csv
);

----- CREATE VIEW statement -----
create view view_name
as
  select *
  from t
;

create view view_name(uno, dos)
as select 1 one, 2 two
;

-- MATERIALIZED
create materialized view view_name
options(dummy = 'dummy')
as
  select count(*)
  from t
;

----- CREATE FUNCTION statement -----
-- sql function definition
create or replace function abc() as ('abc');

create temporary function abc(x int64) as ('abc');

create function if not exists abc(x array<int64>, y any type)
returns int64
as ('dummy');

-- javascript function definition
create function abc() returns int64 language js
options()
as '''return 1''';

create function abc() returns int64 deterministic language js
options(library = ['dummy'])
as '''
  // break
  return 1
''';

create function abc() returns int64 not deterministic language js
as '''return 1''';

----- CREATE PROCEDURE statement -----
create procedure abc() begin select 'abc'; end;

create procedure abc(
  x int64,
  -- break
  inout y int64)
options(dummy = 'dummy')
begin select 'abc'; end;

----- ALTER SCHEMA statement -----
alter schema prettier_plugin_bq_test set options();

alter schema if exists prettier_plugin_bq_test set options(dummy = 'dummy');

----- ALTER TABLE statement -----
-- SET
alter table t set options (dummy='dummy');

-- ADD COLUMN
alter table t
add column x int64;

alter table t
add column if not exists x int64 options (description = 'dummy'),
add column y struct<z int64 not null>;

-- DROP
alter table t
drop column if exists int,
-- break
drop column float;

