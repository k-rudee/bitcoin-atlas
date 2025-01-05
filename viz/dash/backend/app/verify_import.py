import sqlite3
import pandas as pd
from pathlib import Path
import os

def verify_database():
    # Setup paths
    current_file = Path(__file__)
    app_dir = current_file.parent
    project_root = app_dir.parent
    data_dir = project_root / "data"
    db_path = app_dir / "bitcoin_clusters.db"
    csv_path = data_dir / "dataset_pca_cluster.csv"

    print("\n=== Database Verification Report ===")

    # Connect to database
    conn = sqlite3.connect(str(db_path))
    
    try:
        # 1. Check total number of rows
        row_count = pd.read_sql("SELECT COUNT(*) as count FROM entity_clusters", conn).iloc[0]['count']
        print(f"\n1. Total rows in database: {row_count:,}")

        # 2. Check column names and types
        schema = pd.read_sql("PRAGMA table_info(entity_clusters)", conn)
        print(f"\n2. Column Information:")
        print(schema[['name', 'type']])

        # 3. Sample data verification
        print("\n3. Sample Data (first 5 rows):")
        sample = pd.read_sql("SELECT * FROM entity_clusters LIMIT 5", conn)
        print(sample)

        # 4. Check for null values
        null_counts = pd.read_sql("""
            SELECT 
                SUM(CASE WHEN entity_id IS NULL THEN 1 ELSE 0 END) as null_entity_ids,
                SUM(CASE WHEN pc1 IS NULL THEN 1 ELSE 0 END) as null_pc1,
                SUM(CASE WHEN pc2 IS NULL THEN 1 ELSE 0 END) as null_pc2,
                SUM(CASE WHEN pc3 IS NULL THEN 1 ELSE 0 END) as null_pc3
            FROM entity_clusters
        """, conn)
        print("\n4. Null Value Counts:")
        print(null_counts)

        # 5. Check value ranges
        ranges = pd.read_sql("""
            SELECT 
                MIN(entity_id) as min_entity_id,
                MAX(entity_id) as max_entity_id,
                MIN(pc1) as min_pc1,
                MAX(pc1) as max_pc1,
                MIN(pc2) as min_pc2,
                MAX(pc2) as max_pc2,
                MIN(pc3) as min_pc3,
                MAX(pc3) as max_pc3
            FROM entity_clusters
        """, conn)
        print("\n5. Value Ranges:")
        print(ranges)

        # 6. Verify clusters sum to approximately 1
        cluster_sums = pd.read_sql("""
            SELECT 
                AVG(cluster_1 + cluster_2 + cluster_3 + cluster_4 + cluster_5 +
                    cluster_6 + cluster_7 + cluster_8 + cluster_9 + cluster_10 +
                    cluster_11 + cluster_12 + cluster_13 + cluster_14 + cluster_15 +
                    cluster_16 + cluster_17 + cluster_18 + cluster_19 + cluster_20 +
                    cluster_21 + cluster_22 + cluster_23 + cluster_24 + cluster_25 +
                    cluster_26 + cluster_27) as avg_cluster_sum
            FROM entity_clusters
        """, conn)
        print("\n6. Average Cluster Probability Sum:")
        print(cluster_sums)

        # 7. Compare with original CSV file
        csv_row_count = sum(1 for _ in open(csv_path)) - 1  # subtract 1 for header
        print(f"\n7. CSV Comparison:")
        print(f"Rows in CSV: {csv_row_count:,}")
        print(f"Rows in Database: {row_count:,}")
        print(f"Match: {'Yes' if csv_row_count == row_count else 'No'}")

    except Exception as e:
        print(f"Error during verification: {str(e)}")
    finally:
        conn.close()

if __name__ == "__main__":
    verify_database()