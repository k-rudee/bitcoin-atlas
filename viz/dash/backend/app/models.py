from sqlalchemy import Column, Integer, Float
from database import Base

class EntityCluster(Base):
    __tablename__ = "entity_clusters"

    entity_id = Column(Integer, primary_key=True, index=True)
    total_receive_addresses = Column(Integer)
    total_receive_transactions = Column(Integer)
    total_btc_received = Column(Float)
    total_spend_addresses = Column(Integer)
    total_spend_transactions = Column(Integer)
    total_btc_spent = Column(Float)
    pc1 = Column(Float)
    pc2 = Column(Float)
    pc3 = Column(Float)
    
    # Cluster probability columns
    cluster_1 = Column(Float)
    cluster_2 = Column(Float)
    cluster_3 = Column(Float)
    cluster_4 = Column(Float)
    cluster_5 = Column(Float)
    cluster_6 = Column(Float)
    cluster_7 = Column(Float)
    cluster_8 = Column(Float)
    cluster_9 = Column(Float)
    cluster_10 = Column(Float)
    cluster_11 = Column(Float)
    cluster_12 = Column(Float)
 