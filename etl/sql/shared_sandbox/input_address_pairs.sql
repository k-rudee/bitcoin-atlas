with multi_input_txins as (
    select *
    , max(tx_n) over (partition by tx_id) + 1 as n_inputs
    from warehouse.shared_sandbox.txins_2 i
    qualify n_inputs > 1
)

, final as (
    select distinct i.tx_id
    , public_key_uuid
    from multi_input_txins i
    inner join warehouse.shared_sandbox.txouts_2 o
        on o.tx_id = i.prevout_tx_id
        and o.tx_n = i.prev_tx_n
    order by i.tx_id
)

select * from final
