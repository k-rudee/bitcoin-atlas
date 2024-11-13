-- blocks
create or replace table warehouse.stnd.blocks as (
select id as block_id
    , height
    , to_timestamp(time) as time_utc
    , version
    , virt_size
    , weight / 4e6 as fill_ratio
    , weight / 1e6 as size_mb
    -- , _airbyte_meta:"errors" errors
from airbyte_database.airbyte_schema.blocks
where _ab_cdc_deleted_at is null
    and not orphan
order by height desc
)
;
