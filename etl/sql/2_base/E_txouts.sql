create or replace table warehouse.shared_sandbox.txouts as (
select * from warehouse.shared_sandbox.txouts_since_halving

union

select * from warehouse.shared_sandbox.txouts_context
);
