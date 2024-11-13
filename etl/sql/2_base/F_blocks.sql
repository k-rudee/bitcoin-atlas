create or replace table warehouse.shared_sandbox.blocks as (
select * from warehouse.shared_sandbox.blocks_since_halving

union

select * from warehouse.shared_sandbox.blocks_context
);
