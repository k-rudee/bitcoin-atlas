"""Load dataset."""

from pathlib import Path

import numpy as np
import pandas as pd


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

    df = pd.read_csv(
        path,
        header=0,
        dtype=dtype,
    )

    # Delete NaN values
    if drop_na:
        df.dropna(
            how='any',
            inplace=True,
        )

    # Split Dataset to indexes and other values
    idx, X = df.iloc[:, 0].values, df.iloc[:, 1:].values

    return idx, X
