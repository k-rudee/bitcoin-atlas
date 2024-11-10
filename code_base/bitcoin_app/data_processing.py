"""Dataset normalization and PCA dimensional reduction."""
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA


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

    # Normalise dataset
    scaler = StandardScaler()
    X = scaler.fit_transform(X)

    # Apply PCA
    pca = PCA(
        n_components=pca_n_components,
        random_state=pca_random_state,
        copy=False,
    )

    X = pca.fit_transform(X)

    return scaler, pca, X
