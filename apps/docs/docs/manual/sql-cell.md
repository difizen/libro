---
title: SQL Cell Guide
order: 1
---

# Overview

Libro supports using SQL Cells to simplify database interactions. By combining SQL and Python in Libro, you can:

- Query databases directly to quickly retrieve data and save the results as a DataFrame.
- Further process and visualize query results using Python.
- Integrate SQL’s powerful querying capabilities with the dynamic nature of notebooks, improving development efficiency.

The following example demonstrates how to use SQL Cells in Libro to interact with a database and analyze data using Python.

## 📍 Scenario: Sales Data Analysis for an E-commerce Platform

Imagine we manage an e-commerce platform and want to analyze sales data to optimize business strategies. The database includes multiple tables, such as `orders` (order table), `customers` (customer table), `products` (product table), and `order_items` (order item table), which record customer orders and purchase details. We’ll use SQL Cells in Libro to address several common questions:

1. Analyze product sales: Calculate the sales quantity and revenue for each product.
2. Analyze customer purchasing behavior: Identify each customer’s total spend and average order value.
3. Determine the best sales month for the platform: Analyze sales performance over time.

### Preparation

1. Configure the database connection details by adding them to the `~/.libro/libro_config.yaml` file and enable the `libro-sql` extension.

```yaml
db:
  - db_type: postgresql
    username: 'libro'
    password: '12345678'
    host: '127.0.0.1'
    port: 5432
    database: libro
jpserver_extensions:
  libro_sql: True
```

> 💡 **Tip**: If the configuration file doesn’t already exist, generate it by running the command `libro config generate` in the terminal.  
> Additionally, here are configuration examples for MySQL and SQLite:
>
> ```yaml
> - db_type: mysql
>   username: 'root'
>   password: '12345678'
>   host: '127.0.0.1'
>   port: 3306
>   database: sql_demo
>
> - db_type: sqlite
>   username: ''
>   password: ''
>   host: ''
>   port: 0
>   database: sql_demo.db # relative to the libro startup path
> ```

2. Start Libro by running the command `libro` in the terminal. If Libro is already running, restart the kernel after configuring.

### Example 1: Analyzing Product Sales

1. Query product sales  
   We start by using SQL to calculate the sales quantity and total revenue for each product. This query returns the sales quantity and total revenue for each product, with the results saved in a Pandas DataFrame.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/df_sales.png" alt="alt text" width="600" >

2. Visualize product sales performance  
   We can visualize product sales using Python visualization tools such as Matplotlib or Seaborn. This histogram provides a quick overview of the platform’s best-selling products.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/vis_sales.png" alt="alt text" width="600" >

### Example 2: Analyzing Customer Purchasing Behavior

1. Calculate the number of orders, total spend, and average order value for each customer  
   Using SQL, we calculate each customer’s total spending and average order value. This query returns the number of orders, total spend, and average order value for each customer, allowing us to identify loyal customers and understand their purchasing habits.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/df_customers.png" alt="alt text" width="600" >

2. Data Analysis  
   We can further analyze this data in Python to identify customer spending patterns, such as identifying high-value customers.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/high_value_customers.png" alt="alt text" width="600" >

### Example 3: Identifying the Best Sales Month

1. Query total sales by month  
   We analyze the platform’s best sales month over time. This query returns the total monthly sales, sorted in descending order, allowing you to see which months had the highest sales.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/df_monthly_sales.png" alt="alt text" width="600" >

2. Visualize monthly sales trends  
   We can visualize the monthly sales data as a line chart. This line chart helps you easily see the monthly sales trend, providing insights to adjust inventory and marketing strategies.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/df_monthly_sales_revnue.png" alt="alt text" width="600" >

# Conclusion

Through this sales data analysis case for an e-commerce platform, we demonstrated how to use SQL Cells in Libro to address real-world problems, including product sales analysis, customer behavior analysis, and sales trend analysis. You can extend these methods to suit your needs, leveraging the powerful combination of SQL and Python in Libro for personalized data analysis.
