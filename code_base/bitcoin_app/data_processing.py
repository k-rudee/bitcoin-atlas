"""Dataset normalization and PCA dimensional reduction."""
import logging
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

from bitcoin_app.logging_config import logger_config

logger = logging.getLogger(__name__)
logger_config(logger)

def data_processing(
        X: np.ndarray,
        pca_n_components: int,
        pca_random_state: int,

) -> tuple[StandardScaler, PCA, np.ndarray]:
    """Dataset normalization and PCA dimensional reduction.

    :param X: Numpy array with values.
    :type X: numpy.ndarray
    :param pca_n_components: the number of PCA components to be used for
    dimensional reduction/
    :type pca_n_components: int
    :param pca_random_state: random state for PCA
    :type pca_random_state: int

    :return: StandardScaler, PCA and first n principal components
    :rtype: tuple
    """

    logger.info('Data preprocessing has been started.')

    # Normalise dataset
    scaler = StandardScaler()
    X = scaler.fit_transform(X)

    logger.info('Data scaled.')

    # Apply PCA
    pca = PCA(
        n_components=pca_n_components,
        random_state=pca_random_state,
        copy=False,
    )

    X = pca.fit_transform(X)
    logger.info('PCA performed.')
    logger.info('PCA Components: %s', pca.components_)
    logger.info('PCA Explained Variance: %s', pca.explained_variance_ratio_)

    return scaler, pca, X
