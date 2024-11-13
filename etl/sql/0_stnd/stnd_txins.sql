-- stnd txins
create or replace table warehouse.stnd.txins as (
select
      tx_id
    , n		as tx_n
    , prevout_tx_id
    , prevout_n as prev_tx_n
from airbyte_database.airbyte_schema.txins
where _ab_cdc_deleted_at is null
)
;
