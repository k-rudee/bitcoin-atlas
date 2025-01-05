"""Application Settings."""

from pathlib import Path

from pydantic_settings import BaseSettings

from bitcoin_app import module_root


class DatasetSettings(BaseSettings):
    """Dataset Load settings"""
    dataset_folder: str = 'dataset'
    dataset_file: str = 'entity_features_final.csv' # "entity_features_small.csv" entity_features_final
    dataset_save_file: str = 'dataset_pca_clusters.csv'
    drop_na: bool = True
    cols: list = [
        "ENTITY_ID", "TOTAL_RECIEVE_ADDRESSES", "TOTAL_RECIEVE_TRANSACTIONS",
        "TOTAL_BTC_RECEIVED", "TOTAL_SPEND_ADDRESSES",
        "TOTAL_SPEND_TRANSACTIONS", "TOTAL_BTC_SPENT",
    ]
    dtype: dict = {
        'ENTITY_ID': 'Int32',
        'TOTAL_RECIEVE_ADDRESSES': 'Int32',
        'TOTAL_RECIEVE_TRANSACTIONS': 'Int32',
        'TOTAL_BTC_RECEIVED': 'float32',
        'TOTAL_SPEND_ADDRESSES': 'Int32',
        'TOTAL_SPEND_TRANSACTIONS': 'Int32',
        'TOTAL_BTC_SPENT': 'float32',
    }

    @property
    def dataset_path(self) -> Path:
        """Returns the path to the dataset file."""
        return module_root / ".." / self.dataset_folder / self.dataset_file

    @property
    def dataset_save_path(self) -> Path:
        """Returns the path to the dataset file."""
        return module_root / ".." / self.dataset_folder / self.dataset_save_file


class PreprocessingSettings(BaseSettings):
    """Dataset Preprocessing settings."""
    pca_n_components: int = 3
    pca_random_state: int = 0


class FindClustersSettings(BaseSettings):
    """Settings for the search of the optimal number of the clusters."""
    n_components: tuple[int, int] = 3, 30
    random_state: int = 0
    verbose: bool = True
    plot_filename: str = 'clusters_AIC_BIC_Sil.png'

    @property
    def plot_path(self) -> Path:
        """Returns the path to the clustering plot."""
        return module_root / ".." / self.plot_filename


class ClusteringSettings(BaseSettings):
    """"Clustering Settings."""
    n_components: int = 12
    random_state: int = 0


class Settings(BaseSettings):
    """Application settings"""
    dataset: DatasetSettings = DatasetSettings()
    preprocessing: PreprocessingSettings = PreprocessingSettings()
    find_clusters: FindClustersSettings = FindClustersSettings()
    clustering: ClusteringSettings = ClusteringSettings()

    find_clustering: bool = False
