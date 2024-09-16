create or replace table warehouse.shared_sandbox.txins as (
select * from warehouse.shared_sandbox.txins_since_halving
);
