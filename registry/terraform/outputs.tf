output "public_ip" {
  value = aws_instance.registry.public_ip
}

output "ssh_private_key" {
  value     = tls_private_key.registry.private_key_pem
  sensitive = true
}
