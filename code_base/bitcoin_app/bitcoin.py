"""Class project for CSE 6242."""
import numpy as np
from bitcoin_app.data_load import load_dataset
from bitcoin_app.data_processing import data_processing
from bitcoin_app.clustering import find_n_clusters, clustering
from bitcoin_app.settings import Settings

if __name__ == "__main__":

    settings = Settings()

    idx, X = load_dataset(
        path=settings.dataset.dataset_path,
        dtype=settings.dataset.dtype,
        drop_na=settings.dataset.drop_na,
    )

    scaler, pca, X_pca = data_processing(
        X,
        pca_n_components=settings.preprocessing.pca_n_components,
        pca_random_state=settings.preprocessing.pca_random_state,
    )

    # Find the optimal number of clusters
    if settings.find_clustering:
        find_n_clusters(
            X=X_pca,
            n_components=settings.find_clusters.n_components,
            random_state=settings.find_clusters.random_state,
            verbose=settings.find_clusters.verbose,
            plot_path=settings.find_clusters.plot_path,
        )
    # Run clustering
    else:
        clusters = clustering(
            X=X_pca,
            n_components=settings.clustering.n_components,
            random_state=settings.clustering.random_state,
        )
        clusters_count = np.unique(clusters, return_counts=True)

        print(f'{clusters.shape=}')
        print(f'Clusters: {clusters_count[0]}')
        print(f'Cluster counts: {clusters_count[1]}')


        # Plotly
        import plotly.express as px
        import pandas as pd

        df = pd.DataFrame({
            'PC1': X_pca[:, 0],
            'PC2': X_pca[:, 1],
            'PC3': X_pca[:, 2],
            'Cluster': clusters
        })

        fig = px.scatter_3d(
            df,
            x='PC1',
            y='PC2',
            z='PC3',
            color='Cluster',
            symbol='Cluster',  # Optional: Different symbols for each cluster
            opacity=0.8,
            title='Interactive 3D Visualization of Clusters'
        )

        # Update marker size
        fig.update_traces(marker=dict(size=5))

        # Show the plot
        fig.show()