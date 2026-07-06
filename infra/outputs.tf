output "public_ip" {
  value = aws_instance.app.public_ip
}

output "ssh_private_key" {
  value     = tls_private_key.app.private_key_pem
  sensitive = true
}

output "app_url" {
  value = "http://${aws_instance.app.public_ip}"
}
