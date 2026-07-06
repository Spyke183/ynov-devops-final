#!/usr/bin/env bash
# Deploie le registre prive : Terraform puis Ansible.
# Prerequis : AWS configure, terraform + ansible installes, REGISTRY_PASSWORD exporte.
set -euo pipefail
cd "$(dirname "$0")"

: "${REGISTRY_USER:=admin}"
: "${REGISTRY_PASSWORD:?Exporte d'abord REGISTRY_PASSWORD}"

cd terraform
terraform init -input=false
terraform apply -auto-approve
REG_IP=$(terraform output -raw public_ip)
terraform output -raw ssh_private_key > ../ansible/registry-key.pem
chmod 600 ../ansible/registry-key.pem
cd ..

cat > ansible/inventory.ini <<EOF
[registry]
$REG_IP ansible_user=ubuntu ansible_ssh_private_key_file=registry-key.pem
EOF

cd ansible
ansible-playbook -i inventory.ini playbook.yml \
  -e "registry_public_ip=$REG_IP" \
  -e "registry_user=$REGISTRY_USER" \
  -e "registry_password=$REGISTRY_PASSWORD"

echo "Registre deploye : https://$REG_IP"
echo "Secret REGISTRY_HOST a utiliser : $REG_IP:443"
