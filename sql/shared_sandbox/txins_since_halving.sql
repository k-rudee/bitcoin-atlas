create or replace table warehouse.shared_sandbox.txins_since_halving as (
select i.*
from warehouse.shared_sandbox.txs_since_halving t
inner join warehouse.stnd.txins i
    on t.tx_id = i.tx_id
);
