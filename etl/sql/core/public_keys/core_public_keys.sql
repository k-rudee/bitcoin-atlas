-- core public keys initial load
create or replace table warehouse.core.public_keys as (
with unique_public_keys as (
    select distinct public_key
    from warehouse.stnd.txouts
)

, final as (
    select
          public_key
        , uuid_string('0226456f-55a0-44f6-9d56-463d1fdb24c3', public_key) as public_key_uuid
    from unique_public_keys
)

select *
from final
)
