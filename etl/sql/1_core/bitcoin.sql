CREATE TABLE transaction_inputs (
    tx_id BIGINT,
    public_key_uuid UUID
);

COPY transaction_inputs(tx_id, public_key_uuid)
FROM '/path/to/your/input_address_pairs_long.csv'
DELIMITER ','
CSV HEADER;

WITH RECURSIVE address_clusters AS (
    -- Select initial rows as seeds for clusters
    SELECT
        ROW_NUMBER() OVER() AS entity_id,
        tx_id,
        public_key_uuid
    FROM
        transaction_inputs
    WHERE tx_id IS NOT NULL

    UNION ALL

    -- Recursively find all connected public keys in the same transactions
    SELECT
        ac.entity_id,
        ti.tx_id,
        ti.public_key_uuid
    FROM
        address_clusters ac
    JOIN transaction_inputs ti ON ac.tx_id = ti.tx_id
    WHERE ti.public_key_uuid <> ac.public_key_uuid
)
SELECT DISTINCT
    entity_id,
    public_key_uuid
INTO TEMP entity_mapping
FROM
    address_clusters;

-- Total number of addresses per entity
SELECT
    entity_id,
    COUNT(DISTINCT public_key_uuid) AS total_addresses
FROM
    entity_mapping
GROUP BY
    entity_id;

-- Total number of transactions per entity
SELECT
    em.entity_id,
    COUNT(DISTINCT ti.tx_id) AS total_transactions
FROM
    entity_mapping em
JOIN
    transaction_inputs ti ON em.public_key_uuid = ti.public_key_uuid
GROUP BY
    em.entity_id;

CREATE TABLE entity_summary AS
SELECT
    em.entity_id,
    COUNT(DISTINCT em.public_key_uuid) AS total_addresses,
    COUNT(DISTINCT ti.tx_id) AS total_transactions
FROM
    entity_mapping em
JOIN
    transaction_inputs ti ON em.public_key_uuid = ti.public_key_uuid
GROUP BY
    em.entity_id;
    
SELECT * FROM entity_summary;
