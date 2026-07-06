# ynov-devops-final

Deploiement automatise d'une application conteneurisee sur AWS avec Terraform, Ansible
et GitHub Actions, images hebergees sur un registre Docker prive auto-heberge.

## Organisation
- app/ : application et images de production
- registry/ : registre Docker prive (Terraform + Ansible)
- infra/ : infrastructure de l'application (Terraform)
- ansible/ : deploiement de l'application
- .github/workflows/deploy.yml : pipeline

Voir DOCUMENTATION.md pour l'architecture.

## Mise en route
1. Deployer le registre prive :
   ```
   cd registry
   export REGISTRY_USER=admin
   export REGISTRY_PASSWORD='...'
   bash deploy.sh
   ```
   Noter l'IP publique affichee.
2. Configurer les GitHub Secrets (voir .env.sample), dont REGISTRY_HOST=<ip>:443.
3. Onglet Actions > Deploy > Run workflow.
4. L'URL de l'application s'affiche a la fin du job.

## Nettoyage
```
cd registry/terraform && terraform destroy -auto-approve
```
