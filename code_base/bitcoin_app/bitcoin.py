"""Class project for CSE 6242."""

from bitcoin_app.data_load import load_dataset
from bitcoin_app.data_processing import data_processing
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

    print(idx.shape)
    print(X.shape)
    print(X_pca.shape)
