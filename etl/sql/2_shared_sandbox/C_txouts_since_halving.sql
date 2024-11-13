create or replace table warehouse.shared_sandbox.txouts_since_halving as (
select o.*
from warehouse.shared_sandbox.txs_since_halving t
inner join warehouse.stnd.txouts o
    on o.tx_id = t.tx_id
);
