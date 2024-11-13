
-- insert new records into core public keys
insert into warehouse.core.public_keys (public_key, public_key_uuid)
select public_key
, uuid_string('0226456f-55a0-44f6-9d56-463d1fdb24c3', public_key)
from warehouse.core.new_public_keys
