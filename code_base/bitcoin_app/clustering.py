"""Clustering methods."""
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score


def find_n_clusters(
        X: np.ndarray,
        n_components: tuple[int, int],
        random_state: int,
        verbose: bool,
        plot_path: Path,
):
    """Tries to find the optimal number of clusters for GaussianMixture.

    :param X: dataset
    :type X: numpy.ndarray
    :param n_components: min and max number of clusters to be tested.
    :type n_components: tuple
    :param random_state: random state for the GaussianMixture.
    :type random_state: int
    :param verbose: if True, the ongoing statistics will be std out.
    :type verbose: bool
    :param plot_path: path where the resulted plot will be saved.
    :type plot_path: Path
    """

    scores_AIC = np.zeros(n_components[1] - n_components[0], dtype=np.float32)
    scores_BIC = np.zeros(n_components[1] - n_components[0], dtype=np.float32)
    scores_sil = np.zeros(n_components[1] - n_components[0], dtype=np.float32)
    n_components = np.arange(*n_components)

    for i, n in enumerate(n_components):
        # Run GaussianMixture
        gmm = GaussianMixture(
            n_components=n,
            random_state=random_state,
        )
        gmm.fit(X)
        clusters = gmm.predict(X)

        # Extract scores
        scores_AIC[i] = gmm.aic(X)
        scores_BIC[i] = gmm.bic(X)
        scores_sil[i] = silhouette_score(X, clusters)

        if verbose:
            print(
                f'# Clusters: {n} | '
                f'AIC: {scores_AIC[i]:.4f} | '
                f'BIC: {scores_BIC[i]:.4f} | '
                f'Silhouette Score: {scores_sil[i]:.4f}'
            )

    # Plot metrics
    _, ax = plt.subplots(1, 1, figsize=(12, 8))

    twin1 = ax.twinx()
    twin1.spines.right.set_position(("axes", 1))

    p1, = ax.plot(n_components, scores_AIC, label='AIC')
    p2, = ax.plot(n_components, scores_BIC, label='BIC')
    p3, = twin1.plot(n_components, scores_sil, 'g-', label='Sil Score')

    # ax.set_xlim([2, 25])
    # ax.set_ylim([-3.5e7, 3e7])
    ax.set_xlabel('Number of clusters')
    ax.set_ylabel('AIC and BIC')
    twin1.set_ylabel('Silhouette Score')
    ax.set_title(
        'AIC, BIC and Silhouette Score for different numbers of clusters'
    )
    ax.legend(handles=[p1, p2, p3])
    plt.savefig(plot_path)
    plt.show()
    plt.close()


def clustering(
        X: np.ndarray,
        n_components: int,
        random_state: int,
) -> np.ndarray:
    """Clustering based on GaussianMixture.

    :param X: dataset
    :type X: numpy.ndarray
    :param n_components: number of clusters.
    :type n_components: int
    :param random_state: random state for the GaussianMixture.
    :type random_state: int

    :return: clusters
    :rtype: numpy.ndarray
    """
    gmm = GaussianMixture(
        n_components=n_components,
        random_state=random_state,
    )
    gmm.fit(X)
    return gmm.predict(X)
