# Production Deployment

## AWS EC2 with Terraform (Recommended)

**One command to deploy everything:**

```bash
cd terraform
terraform init
terraform apply
```

See `terraform/README.md` for full instructions.

After first deploy, use:
```bash
./deploy.sh  # Auto-detects server from terraform
```

---

## Manual VPS Setup (Alternative)

1. **Get a VPS** (DigitalOcean, Hetzner, etc.)

2. **Install Docker:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Install Docker Compose:**
   ```bash
   sudo apt-get update
   sudo apt-get install docker-compose-plugin
   ```

4. **Clone the repo:**
   ```bash
   mkdir -p ~/app
   cd ~/app
   git clone <your-repo-url> .
   ```

5. **Start:**
   ```bash
   docker compose up -d
   ```

---

## DNS Setup (for custom domain)

Add these records:
- `A` record: `@` → `your-server-ip`
- `A` record: `*` → `your-server-ip`

## Logs

```bash
# With Terraform:
ssh -i ~/.ssh/multitenant-key.pem ubuntu@$(cd terraform && terraform output -raw public_ip) "cd ~/app && docker compose logs -f"

# Manual setup:
ssh your-server "cd ~/app && docker compose logs -f"
```
