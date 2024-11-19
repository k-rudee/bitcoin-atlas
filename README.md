# bitcoin-class-project
Class project for CSE 6242




# HOW TO RUN
## ETL, Scala 


## Clusterization
The provided Python script determines the optimal number of clusters and 
prepares the dataset for visualization. Follow the steps below to set up and 
run the script:

1. **Create a new Conda environment**:  
   Run the command:  
   ```bash
   conda env create -f environment.yml
   ```

2. **Activate the Conda environment**:  
   ```bash
   conda activate cse6242_project
   ```

3. **Set parameters based on your goal**:
   - To find the optimal number of clusters, set the parameter:  
     ```python
     find_clustering: bool = True
     ```  
     Ensure other parameters are configured as needed for the experiment.
   - To prepare the dataset based on a specific number of clusters, set the parameters:  
     ```python
     find_clustering: bool = False
     n_components: int = <desired_number_of_clusters>
     ```

4. **Run the application**:  
   Execute the following command:  
   ```bash
   python -m bitcoin_app.bitcoin
   ```  

## Data visualization 
