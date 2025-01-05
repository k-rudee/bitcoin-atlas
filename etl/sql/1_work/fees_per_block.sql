with fourth_epoch_blocks as (
    select *
    from warehouse.stnd.blocks
    where height >= 630000
)

,  fourth_epoch_coinbase_txs as (
    select
          tx_id
        , block_id
        , virt_size
    from warehouse.stnd.txs
    where tx_n = 0
        and block_id >= 630001
)

, coinbase_aggregates as (
    select
          txs.tx_id
        , txs.block_id
        , max(txs.virt_size) as virt_size
        , max(b.virt_size) as block_virt_size
        , sum(txo.amount_sats) as total_coinbase_sats
        , sum(txo.amount_btc) as total_coinbase_btc
    from fourth_epoch_coinbase_txs txs
    left join warehouse.stnd.txouts txo
        on txo.tx_id = txs.tx_id
    left join fourth_epoch_blocks b
        on txs.block_id = b.block_id
    group by all
)

, final as (
    select
          block_id
        , tx_id
        , virt_size
        , block_virt_size
        , block_virt_size - virt_size as txs_virt_size
        , total_coinbase_sats
        , total_coinbase_btc
        , total_coinbase_sats - 625000000 as total_fees_sats
        , total_coinbase_btc - 6.25 as total_fees_btc
        , total_fees_sats / txs_virt_size as sats_per_vbyte
    from coinbase_aggregates
    order by block_id
)

select * from final
;
