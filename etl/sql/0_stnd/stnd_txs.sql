--stnd txs
create or replace table warehouse.stnd.txs as (
with clean_txs as (
    select
          t.id
        , ltrim(txid, '\\x') as  clean_txid
        , t.version
        , t.size
        , t.locktime
        , t.base_size
        , t.virt_size
        , t.weight
        , _ab_cdc_deleted_at
    from airbyte_database.airbyte_schema.txs t
)

, final as (
    select
          t.id as tx_id
        , lower(
            concat(
              substr(clean_txid, 63, 2), substr(clean_txid, 61, 2),
              substr(clean_txid, 59, 2), substr(clean_txid, 57, 2),
              substr(clean_txid, 55, 2), substr(clean_txid, 53, 2),
              substr(clean_txid, 51, 2), substr(clean_txid, 49, 2),
              substr(clean_txid, 47, 2), substr(clean_txid, 45, 2),
              substr(clean_txid, 43, 2), substr(clean_txid, 41, 2),
              substr(clean_txid, 39, 2), substr(clean_txid, 37, 2),
              substr(clean_txid, 35, 2), substr(clean_txid, 33, 2),
              substr(clean_txid, 31, 2), substr(clean_txid, 29, 2),
              substr(clean_txid, 27, 2), substr(clean_txid, 25, 2),
              substr(clean_txid, 23, 2), substr(clean_txid, 21, 2),
              substr(clean_txid, 19, 2), substr(clean_txid, 17, 2),
              substr(clean_txid, 15, 2), substr(clean_txid, 13, 2),
              substr(clean_txid, 11, 2), substr(clean_txid, 9, 2),
              substr(clean_txid, 7, 2),  substr(clean_txid, 5, 2),
              substr(clean_txid, 3, 2),  substr(clean_txid, 1, 2)
            )
          ) as hash_id
        , bt.block_id
        , bt.n as tx_n
        , t.version
        , t.size
        , t.locktime
        , t.base_size
        , t.virt_size
        , t.weight / 1e6 as size_mb
    from clean_txs t
    inner join airbyte_database.airbyte_schema.block_txs bt
        on bt.tx_id = t.id
    where t._ab_cdc_deleted_at is null
        and bt._ab_cdc_deleted_at is null
)

select * from final
)
;
