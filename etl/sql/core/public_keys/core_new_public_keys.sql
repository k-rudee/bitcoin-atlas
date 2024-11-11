-- core public keys incremental
create or replace table warehouse.core.new_public_keys as (
select distinct public_key
from warehouse.stnd.txouts o
left join warehouse.core.public_keys pk
    on o.public_key = pk.public_key
where public_key is null
);
