create or replace table warehouse.shared_sandbox.blocks_context as (
select distinct b.*
from warehouse.stnd.blocks b
inner join warehouse.shared_sandbox.txs_context t2
    on t2.block_id = b.block_id
);
