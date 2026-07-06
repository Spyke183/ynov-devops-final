#!/bin/bash
# Cree la table admin et y insere le compte administrateur.
# Lance automatiquement au fresh init de MySQL (dossier docker-entrypoint-initdb.d).
# Le mot de passe est passe en variable d'environnement (ADMIN_EMAIL / ADMIN_PASSWORD)
# et stocke hashe en SHA-256.
set -e

mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
  USE ynov_ci;

  CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
  );

  INSERT INTO admin (email, password)
  VALUES ('${ADMIN_EMAIL}', SHA2('${ADMIN_PASSWORD}', 256));
EOSQL
