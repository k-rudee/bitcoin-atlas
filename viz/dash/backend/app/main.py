from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from databases import Database
import os
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(title="Bitcoin Clustering API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database URL - using relative path
DATABASE_URL = f"sqlite:///{Path(__file__).parent}/bitcoin_clusters.db"
database = Database(DATABASE_URL)

@app.on_event("startup")
async def startup():
    await database.connect()
    print(f"Database path: {Path(__file__).parent}/bitcoin_clusters.db")
    try:
        query = "SELECT * FROM entity_clusters LIMIT 1"
        result = await database.fetch_one(query)
        print("Database connection test:")
        print(f"Columns available: {result.keys() if result else 'No data found'}")
    except Exception as e:
        print(f"Database test error: {str(e)}")

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.get("/")
async def root():
    return {"message": "Bitcoin Clustering API is running"}

@app.get("/api/cluster-data")
async def get_cluster_data(sample_size: int = 1000):
    """
    Get sampled cluster data for 3D visualization with all cluster probabilities
    """
    query = """
    SELECT 
        entity_id,
        total_receive_addresses,
        total_receive_transactions,
        total_btc_received,
        total_spend_addresses,
        total_spend_transactions,
        total_btc_spent,
        pc1, pc2, pc3,
        cluster,
        cluster_1, cluster_2, cluster_3, cluster_4,
        cluster_5, cluster_6, cluster_7, cluster_8,
        cluster_9, cluster_10, cluster_11, cluster_12
    FROM entity_clusters 
    ORDER BY RANDOM() 
    LIMIT :sample_size
    """
    
    try:
        data = await database.fetch_all(query=query, values={"sample_size": min(sample_size, 25000)})
        return [dict(row) for row in data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/entity/{entity_id}")
async def get_entity(entity_id: int):
    """
    Get details for a specific entity including cluster probabilities
    """
    query = """
    SELECT 
        entity_id,
        total_receive_addresses,
        total_receive_transactions,
        total_btc_received,
        total_spend_addresses,
        total_spend_transactions,
        total_btc_spent,
        pc1, pc2, pc3,
        cluster,
        cluster_1, cluster_2, cluster_3, cluster_4,
        cluster_5, cluster_6, cluster_7, cluster_8,
        cluster_9, cluster_10, cluster_11, cluster_12
    FROM entity_clusters
    WHERE entity_id = :entity_id
    """
    
    result = await database.fetch_one(query=query, values={"entity_id": entity_id})
    
    if result is None:
        raise HTTPException(status_code=404, detail="Entity not found")
        
    return dict(result)

@app.get("/api/cluster-stats")
async def get_cluster_stats():
    """
    Get comprehensive statistics about cluster distribution
    """
    query = """
    SELECT 
        cluster,
        COUNT(*) as count,
        AVG(total_btc_received) as avg_btc_received,
        MAX(total_btc_received) as max_btc_received,
        AVG(total_btc_spent) as avg_btc_spent,
        MAX(total_btc_spent) as max_btc_spent,
        AVG(total_receive_transactions) as avg_receive_transactions,
        AVG(total_spend_transactions) as avg_spend_transactions,
        AVG(pc1) as avg_pc1,
        AVG(pc2) as avg_pc2,
        AVG(pc3) as avg_pc3
    FROM entity_clusters
    GROUP BY cluster
    ORDER BY cluster
    """
    
    try:
        stats = await database.fetch_all(query=query)
        return [dict(row) for row in stats]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/cluster/{cluster_id}")
async def get_cluster_entities(
    cluster_id: int, 
    limit: int = 1000, 
    offset: int = 0
):
    """
    Get entities belonging to a specific cluster with pagination
    """
    query = """
    SELECT 
        entity_id,
        total_btc_received,
        total_btc_spent,
        total_receive_transactions,
        total_spend_transactions,
        pc1, pc2, pc3,
        cluster,
        cluster_1, cluster_2, cluster_3, cluster_4,
        cluster_5, cluster_6, cluster_7, cluster_8,
        cluster_9, cluster_10, cluster_11, cluster_12
    FROM entity_clusters
    WHERE cluster = :cluster_id
    ORDER BY total_btc_received DESC
    LIMIT :limit OFFSET :offset
    """
    
    try:
        entities = await database.fetch_all(
            query=query, 
            values={
                "cluster_id": cluster_id,
                "limit": limit,
                "offset": offset
            }
        )
        return [dict(row) for row in entities]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/visualization-stats")
async def get_visualization_stats():
    """
    Get statistics needed for visualization scaling and coloring
    """
    query = """
    SELECT 
        MIN(pc1) as min_pc1,
        MAX(pc1) as max_pc1,
        MIN(pc2) as min_pc2,
        MAX(pc2) as max_pc2,
        MIN(pc3) as min_pc3,
        MAX(pc3) as max_pc3,
        COUNT(DISTINCT cluster) as num_clusters,
        MIN(total_btc_received) as min_btc,
        MAX(total_btc_received) as max_btc
    FROM entity_clusters
    """
    
    try:
        stats = await database.fetch_one(query=query)
        return dict(stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)


    