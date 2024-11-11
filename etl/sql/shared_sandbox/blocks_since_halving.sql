create or replace table warehouse.shared_sandbox.blocks_since_halving as (
select *
from warehouse.stnd.blocks
where height >= 840000
order by height asc
);
