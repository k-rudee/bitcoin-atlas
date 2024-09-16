select
      block_id
    , height
    , time_utc
    , lag(time_utc) over (order by block_id) as prev_time_utc
    , datediff('seconds', prev_time_utc, time_utc) / 60 as min_between_blocks
from warehouse.stnd.blocks
where height >= 630000
;
