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

    print(f'PCA Components: {pca.components_}')
    print(f'PCA Explained Variance: {pca.explained_variance_ratio_=}')

    print(f'{idx.shape=}')
    print(f'{X.shape}')
    print(f'{X_pca.shape}')

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
