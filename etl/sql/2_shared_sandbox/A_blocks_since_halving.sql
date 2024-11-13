create or replace table warehouse.shared_sandbox.blocks_since_halving as (
select *
from warehouse.stnd.blocks
where height >= 840000
and height < 842016 -- This is about two weeks worth of block data with ~144 blocks mined per day
order by height asc
);
