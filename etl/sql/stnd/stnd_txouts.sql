-- stnd txouts
create or replace table warehouse.stnd.txouts as (
with clean_txouts as (
    select
          txo.tx_id
        , txo.n			as tx_n
        , txo.spent		as is_spent
        , txo.value		as amount_sats
        , txo.value / 1e8	as amount_btc
    from airbyte_database.airbyte_schema.txouts txo
    where txo._ab_cdc_deleted_at is null
)

, final as (
    select
          tx_id
        , tx_n
        , is_spent
        , amount_sats
        , amount_btc
    from clean_txouts
)

select * from final
)
;
