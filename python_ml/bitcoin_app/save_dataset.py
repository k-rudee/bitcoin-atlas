"""Prepare Dataset with principal components and probability distribution
among clusters."""

import logging
from pathlib import Path

import pandas as pd
import numpy as np

from bitcoin_app.logging_config import logger_config

logger = logging.getLogger(__name__)
logger_config(logger)


def save_dataset(
        df: pd.DataFrame,
        X_pca: np.ndarray,
        X_proba: np.ndarray,
        path: Path,
) -> pd.DataFrame:
    """Prepares dataset with initial data, PCA, prob distribution.

    :param df: Initial dataset.
    :type df: pandas.DataFrame
    :param X_pca: the result of PCA
    :type X_pca: np.ndarray
    :param X_proba: the result of Gaussian Mixtures
    :type X_proba: np.ndarray

    :return: Merged dataset
    :rtype: pandas.DataFrame
    """

    df_pca = pd.DataFrame(
        X_pca,
        columns=[f'PC{i + 1}' for i in range(X_pca.shape[1])]
    )
    logger.info('PCA DataFrame has been prepared. Shape: %s', df_pca.shape)

    df_gmm_proba = pd.DataFrame(
        X_proba,
        columns=[f'Cluster_{i + 1}' for i in range(X_proba.shape[1])]
    )
    logger.info('GMM DataFrame has been prepared. Shape: %s', df_gmm_proba.shape)

    # Concatenate all DataFrames
    df_final = pd.concat([df, df_pca, df_gmm_proba], axis=1)
    logger.info('DataFrames have been merged. Shape: %s', df_final.shape)

    # Save dataset
    df_final.to_csv(path, index=False)
    logger.info('DataFrame has been saved to %s', path)
