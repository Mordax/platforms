# Terraform AWS EC2 Deployment

## One-Time Setup

1. **Install Terraform:**
   ```bash
   # macOS
   brew install terraform

   # Linux
   wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
   unzip terraform_1.6.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

2. **Configure AWS credentials:**
   ```bash
   aws configure
   # Enter your AWS Access Key ID and Secret Access Key
   ```

3. **Create SSH key pair in AWS:**
   ```bash
   aws ec2 create-key-pair --key-name multitenant-key --query 'KeyMaterial' --output text > ~/.ssh/multitenant-key.pem
   chmod 400 ~/.ssh/multitenant-key.pem
   ```

4. **Configure variables:**
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

## Deploy

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Type `yes` when prompted.

## Get Info

After deployment:
```bash
terraform output
```

Shows:
- Public IP
- SSH command
- App URL

## Update/Redeploy

SSH to server and pull latest:
```bash
ssh -i ~/.ssh/multitenant-key.pem ubuntu@<public-ip>
cd ~/app
git pull
docker compose up -d --build
```

Or destroy and recreate:
```bash
terraform destroy
terraform apply
```

## Destroy

```bash
terraform destroy
```

## Costs

Estimated AWS costs:
- t3.small EC2: ~$15/month
- 20GB EBS: ~$2/month
- Elastic IP: Free while attached

Total: ~$17/month
