"""Class project for CSE 6242."""
import numpy as np
from bitcoin_app.data_load import load_dataset
from bitcoin_app.data_processing import data_processing
from bitcoin_app.clustering import find_n_clusters, clustering
from bitcoin_app.save_dataset import save_dataset
from bitcoin_app.settings import Settings

if __name__ == "__main__":

    settings = Settings()

    idx, X, df = load_dataset(
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
        clusters, clusters_proba = clustering(
            X=X_pca,
            n_components=settings.clustering.n_components,
            random_state=settings.clustering.random_state,
        )

        # Save dataset
        save_dataset(
            df=df,
            X_pca=X_pca,
            X_proba=clusters_proba,
            path=settings.dataset.dataset_save_path,
        )
