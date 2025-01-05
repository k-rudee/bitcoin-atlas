create or replace table warehouse.shared_sandbox.txs as (
select * from warehouse.shared_sandbox.txs_since_halving

union

select * from warehouse.shared_sandbox.txs_context
);
