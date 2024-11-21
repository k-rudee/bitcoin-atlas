import pandas as pd
import sqlite3
import os
from pathlib import Path
from dotenv import load_dotenv
import numpy as np
from tqdm import tqdm
import gc
import csv  # Added for debugging

# Load environment variables
load_dotenv()

def create_database_schema(conn):
    """Create the database tables and indices"""
    print("Creating database schema...")
    
    conn.execute('DROP TABLE IF EXISTS entity_clusters')
    conn.execute('''
    CREATE TABLE entity_clusters (
        entity_id INTEGER PRIMARY KEY,
        total_receive_addresses INTEGER,
        total_receive_transactions INTEGER,
        total_btc_received REAL,
        total_spend_addresses INTEGER,
        total_spend_transactions INTEGER,
        total_btc_spent REAL,
        pc1 REAL,
        pc2 REAL,
        pc3 REAL,
        cluster INTEGER,
        cluster_1 REAL,
        cluster_2 REAL,
        cluster_3 REAL,
        cluster_4 REAL,
        cluster_5 REAL,
        cluster_6 REAL,
        cluster_7 REAL,
        cluster_8 REAL,
        cluster_9 REAL,
        cluster_10 REAL,
        cluster_11 REAL,
        cluster_12 REAL
    )
    ''')
    
    print("Database schema created successfully!")

def optimize_sqlite_connection(conn):
    """Configure SQLite connection for better performance"""
    conn.execute('PRAGMA journal_mode = WAL')
    conn.execute('PRAGMA synchronous = NORMAL')
    conn.execute('PRAGMA cache_size = -2000000')
    conn.execute('PRAGMA temp_store = MEMORY')
    conn.execute('PRAGMA mmap_size = 30000000000')

def insert_records(conn, df, batch_size=100):
    """Insert records in small batches"""
    
    # Prepare the insert statement
    columns = df.columns.tolist()
    placeholders = ','.join(['?' for _ in columns])
    insert_sql = f"INSERT INTO entity_clusters ({','.join(columns)}) VALUES ({placeholders})"
    
    # Convert DataFrame to list of tuples for faster processing
    records = df.values.tolist()  
    
    # Process in small batches
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        try:
            conn.executemany(insert_sql, batch)
        except Exception as e:
            print(f"Error inserting batch {i//batch_size}: {str(e)}")
            if batch:
                print(f"Number of columns in SQL: {len(columns)}")
                print(f"Number of values in first row: {len(batch[0])}")
                print(f"Columns: {columns}")
                print(f"First row of failing batch: {batch[0]}")
            raise

def import_data_to_sqlite():
    current_file = Path(__file__)
    app_dir = current_file.parent
    project_root = app_dir.parent
    data_dir = project_root / "data"
    db_path = app_dir / "bitcoin_clusters.db"
    csv_path = data_dir / "dataset_pca_clusters_sample.csv"

    print(f"\nProject structure:")
    print(f"- Project root: {project_root}")
    print(f"- Data directory: {data_dir}")
    print(f"- Database will be created at: {db_path}")
    print(f"- Looking for CSV at: {csv_path}")

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found at {csv_path}")

    
    print("\nChecking CSV file...")
    with open(csv_path, 'r') as f:
        first_line = f.readline()
        print(f"First line preview: {first_line[:50]}")

    conn = sqlite3.connect(str(db_path))
    
    try:
        optimize_sqlite_connection(conn)
        create_database_schema(conn)

        # Get total number of rows
        total_rows = sum(1 for _ in open(csv_path)) - 1
        print(f"\nTotal rows to process: {total_rows:,}")

        # Process in chunks
        chunk_size = 5000
        batch_size = 100

        # Define dtypes for all columns
        dtypes = {
            'ENTITY_ID': np.int64,
            'TOTAL_RECIEVE_ADDRESSES': np.int32,
            'TOTAL_RECIEVE_TRANSACTIONS': np.int32,
            'TOTAL_BTC_RECEIVED': np.float64,
            'TOTAL_SPEND_ADDRESSES': np.int32,
            'TOTAL_SPEND_TRANSACTIONS': np.int32,
            'TOTAL_BTC_SPENT': np.float64,
            'PC1': np.float64,
            'PC2': np.float64,
            'PC3': np.float64,
            'Cluster': np.int32
        }
        
        # Add cluster probability columns
        for i in range(1, 13):
            dtypes[f'Cluster_{i}'] = np.float64

        with tqdm(total=total_rows, desc="Importing data") as pbar:
            # reading files 
            try:
                chunks = pd.read_csv(
                    csv_path,
                    chunksize=chunk_size,
                    dtype=dtypes,
                    sep=None,  
                    engine='python', 
                    on_bad_lines='warn'
                )
            except Exception as e:
                print(f"Error reading CSV: {str(e)}")
                raise

            for chunk in chunks:
                try:
                    # Clean column names
                    chunk.columns = [col.lower().replace('recieve', 'receive') for col in chunk.columns]
                    
                    # Print chunk info for debugging
                    print(f"\nChunk columns: {chunk.columns.tolist()}")
                    print(f"Chunk shape: {chunk.shape}")
                    print(f"First row of chunk: {chunk.iloc[0].tolist()}")
                    
                    # Begin transaction
                    conn.execute('BEGIN TRANSACTION')
                    
                    # Insert records in batches
                    insert_records(conn, chunk, batch_size)
                    
                    # Commit transaction
                    conn.commit()
                    
                    # Update progress
                    pbar.update(len(chunk))
                    
                except Exception as e:
                    print(f"\nError processing chunk: {str(e)}")
                    conn.rollback()
                    raise
                finally:
                    del chunk
                    gc.collect()

        print("\nCreating indices...")
        conn.execute('CREATE INDEX IF NOT EXISTS idx_pc_coords ON entity_clusters(pc1, pc2, pc3)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_main_cluster ON entity_clusters(cluster)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_cluster_probs ON entity_clusters(cluster_1, cluster_2, cluster_3, cluster_4, cluster_5, cluster_6, cluster_7, cluster_8, cluster_9, cluster_10, cluster_11, cluster_12)')
        
        print("Import completed successfully!")

    except Exception as e:
        print(f"\nError occurred: {str(e)}")
        try:
            conn.rollback()
        except sqlite3.Error:
            pass
        raise
    finally:
        conn.close()
        print("\nDatabase connection closed")

if __name__ == "__main__":
    import_data_to_sqlite()