"""Clustering methods."""
import logging
from pathlib import Path

from joblib import Parallel, delayed
import matplotlib.pyplot as plt
import numpy as np
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score, pairwise_distances

from bitcoin_app.logging_config import logger_config


logger = logging.getLogger(__name__)
logger_config(logger)


def compute_scores(
        X: np.ndarray,
        n_components: int,
        random_state: int,
        verbose: bool,
) -> tuple[int, float, float, float]:
    """Compute AIC, BIC, Silhouette scores  for given number of clusters.


    :param X: dataset
    :type X: numpy.ndarray
    :param n_components: number of clusters to be tested.
    :type n_components: int
    :param random_state: random state for the GaussianMixture.
    :type random_state: int
    :param verbose: if True, the ongoing statistics will be std out.
    :type verbose: bool

    :return: number of clusters, AIC, BIC, Silhouette scores
    """
    if verbose:
        logger.info(
            'GMM for %d components started',
            n_components
        )

    # Run GaussianMixture
    gmm = GaussianMixture(
        n_components=n_components,
        random_state=random_state,
        # covariance_type='diag',
        init_params='kmeans',
        tol=1e-3,
        max_iter=100,
        verbose=verbose,
        verbose_interval=1,
    )
    gmm.fit(X)

    if verbose:
        logger.info(
            'GMM for %d components has been fitted.',
            n_components
        )

    clusters = gmm.predict(X)

    if verbose:
        clusters_count = np.unique(clusters, return_counts=True)
        logger.info(
            'Clusters for %d components: %s',
            n_components, clusters_count[0],
        )
        logger.info(
            'Clusters for %d components counts: %s',
            n_components, clusters_count[1],
        )

    # Extract scores
    aic = gmm.aic(X)
    bic = gmm.bic(X)
    sil = silhouette_score(
        X,
        labels=clusters,
        metric='euclidean',     # 'manhattan', 'euclidean',
        sample_size=100000,
        random_state=random_state,
    )

    if verbose:
        logger.info(
            '# Clusters: %d | AIC: %.4f | BIC: %.4f | '
            'Silhouette Score: %.4f',
            n_components, aic, bic, sil
        )

    return n_components, aic, bic, sil



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

    n_components = np.arange(*n_components)
    # Run clustering with different n_components
    results = Parallel(n_jobs=-1)(
        delayed(compute_scores)(X, n, random_state, verbose)
        for n in n_components
    )

    # Save results
    scores_AIC = np.zeros(n_components.shape[0], dtype=np.float32)
    scores_BIC = np.zeros(n_components.shape[0], dtype=np.float32)
    scores_sil = np.zeros(n_components.shape[0], dtype=np.float32)
    for i, (n, aic, bic, sil) in enumerate(results):
        scores_AIC[i] = aic
        scores_BIC[i] = bic
        scores_sil[i] = sil

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
) -> tuple[np.ndarray, np.ndarray]:
    """Clustering based on GaussianMixture.

    :param X: dataset
    :type X: numpy.ndarray
    :param n_components: number of clusters.
    :type n_components: int
    :param random_state: random state for the GaussianMixture.
    :type random_state: int

    :return: clusters and prob distribution
    :rtype: numpy.ndarray
    """
    logger.info(
        'GMM for %d components started',
        n_components
    )

    gmm = GaussianMixture(
        n_components=n_components,
        random_state=random_state,
        init_params='kmeans',
        tol=1e-3,
        max_iter=100,
        verbose=True,
        verbose_interval=1,
    )
    gmm.fit(X)
    logger.info('GMM fitted')

    clusters = gmm.predict(X)
    clusters_proba = gmm.predict_proba(X)
    # print(clusters_prob.shape)

    clusters_count = np.unique(clusters, return_counts=True)
    logger.info(
        'Clusters for %d components: %s',
        n_components, clusters_count[0],
    )
    logger.info(
        'Clusters for %d components counts: %s',
        n_components, clusters_count[1],
    )

    return clusters, clusters_proba
