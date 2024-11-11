create or replace table warehouse.shared_sandbox.txs_since_halving as (
select t.*
from warehouse.shared_sandbox.blocks_since_halving b
inner join warehouse.stnd.txs t
    on t.block_id = b.block_id
);
