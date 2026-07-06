variable "aws_region" {
  type    = string
  default = "eu-west-3"
}

variable "name" {
  type    = string
  default = "ynov-registry"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "ssh_cidr" {
  type    = string
  default = "0.0.0.0/0"
}
