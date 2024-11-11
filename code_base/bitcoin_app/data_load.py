"""Load dataset."""
import logging
from pathlib import Path

import numpy as np
import pandas as pd

from bitcoin_app.logging_config import logger_config

logger = logging.getLogger(__name__)
logger_config(logger)

def load_dataset(
        path: Path,
        dtype: dict,
        drop_na: bool,
) -> tuple[np.ndarray, np.ndarray]:
    """Load dataset.

    :param path: the parth to the dataset.
    :type path: Path
    :param dtype: data types of the columns.
    :type dtype: dict
    :param drop_na: if True, NAN values will be dropped.
    :type drop_na: bool

    :return: numpy arrays with entity ids and values
    :rtype: tuple
    """

    logger.info('Dataset loading has been started.')

    df = pd.read_csv(
        path,
        header=0,
        dtype=dtype,
    )

    logger.info('Dataset has been loaded. DF shape: %s', df.shape)

    # Delete NaN values
    if drop_na:
        df.dropna(
            how='any',
            inplace=True,
        )

        logger.info('NA values has been dropped. DF shape: %s', df.shape)

    # Split Dataset to indexes and other values
    idx, X = df.iloc[:, 0].values, df.iloc[:, 1:].values

    logger.info(
        'Dataset split into indexes and samples. '
        'Index shape: %s. Samples shape: %s',
        idx.shape, X.shape,
    )

    return idx, X
