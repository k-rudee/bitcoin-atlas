create or replace table warehouse.shared_sandbox.txouts_context as (
select distinct o.*
from warehouse.shared_sandbox.txins_since_halving i2
inner join warehouse.stnd.txouts o
    on o.tx_id = i2.prevout_tx_id
    and o.tx_n = i2.prev_tx_n
);
