-- core txouts
create or replace table warehouse.core.txouts as (
    select o.tx_id
    , o.tx_n
    , pk.public_key_uuid
    , o.is_spent
    , o.amount_sats
    , o.amount_btc
    from warehouse.stnd.txouts o
    left join warehouse.core.public_keys pk
        on pk.public_key = o.public_key
)
;
