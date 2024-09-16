create or replace table warehouse.shared_sandbox.txs_context as (
select distinct t.*
from warehouse.stnd.txs t
inner join warehouse.shared_sandbox.txins_since_halving i2
    on i2.prevout_tx_id = t.tx_id
);
