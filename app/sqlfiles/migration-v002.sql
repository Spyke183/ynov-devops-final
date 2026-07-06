USE ynov_ci;

CREATE TABLE utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    last_name VARCHAR(100),
    first_name VARCHAR(100),
    email VARCHAR(255),
    birth_date DATE,
    city VARCHAR(100),
    zip_code VARCHAR(5)
);
