# Documentation

## Objectif
Deployer l'application sur AWS sans connexion SSH manuelle, via une pipeline CI/CD
declenchee a la main.

## Architecture
Deux instances EC2 dans la region eu-west-3 :

- Registre : heberge un registre Docker prive (registry:2 + interface web + nginx en
  reverse proxy SSL + authentification par mot de passe). Deploye une seule fois avec
  registry/deploy.sh (Terraform puis Ansible).
- Application : creee par la pipeline. Un nginx sert le front statique et proxifie /api
  vers le backend ; MySQL et Adminer tournent a cote.

## Organisation du depot
- app/ : application (React, FastAPI, MySQL, Adminer) et images de production.
- registry/ : Terraform et Ansible du registre prive.
- infra/ : Terraform de l'instance applicative.
- ansible/ : playbook de deploiement de l'application.
- .github/workflows/deploy.yml : orchestration.

## Pipeline (deploy.yml, declenchement manuel)
1. Build et push des images vers le registre prive.
2. terraform apply : creation de l'instance, outputs IP et cle SSH.
3. Generation de l'inventaire Ansible a partir des outputs.
4. Ansible : installation de Docker, connexion au registre, pull des images, demarrage.
5. Verification du front et de l'API avec curl.

## Securite
Aucun secret dans le depot : tout passe par les GitHub Secrets. La cle SSH est generee
par Terraform. Les Security Groups n'exposent que le port 80 (front et API) et le 22
(pour Ansible) ; Adminer et la base restent internes.

## Choix technique
Le front est construit avec une URL d'API relative (/api) et servi par nginx qui la
proxifie vers le backend. L'image ne depend donc pas de l'IP de l'instance, connue
seulement apres l'execution de Terraform.
