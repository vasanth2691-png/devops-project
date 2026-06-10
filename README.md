# DevOps Sample Workspace

Beginner-friendly end-to-end project to practice DevOps tooling.

## Stack
- Node.js + Express API
- PostgreSQL
- Docker + Docker Compose
- Kubernetes manifests + Helm chart
- GitHub Actions CI
- Jenkins CI pipeline
- Terraform starter

## Project Structure
- `app/` API source code and tests
- `k8s/` raw Kubernetes manifests
- `helm/devops-sample/` Helm chart
- `.github/workflows/ci.yml` CI pipeline
- `Jenkinsfile` Jenkins pipeline
- `jenkins/plugins.txt` suggested Jenkins plugins
- `docker-compose.jenkins.yml` optional local Jenkins server
- `terraform/` infrastructure as code starter

## 1) Run Locally
```bash
cd app
npm install
copy .env.example .env
npm run dev
```
Open http://localhost:3000/health

## 2) Run With Docker Compose
From repository root:
```bash
docker compose up --build
```
Check:
```bash
curl http://localhost:3000/health
```
Stop:
```bash
docker compose down
```

## 3) Build Image Manually
From repository root:
```bash
docker build -t devops-sample-api:latest .
```

## 4) Deploy To Local Kubernetes (kind)
Create cluster:
```bash
kind create cluster --name devops-sample
```

Load local image into kind:
```bash
docker build -t devops-sample-api:latest .
kind load docker-image devops-sample-api:latest --name devops-sample
```

Apply manifests:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

Check status:
```bash
kubectl get pods -n devops-sample
kubectl get svc -n devops-sample
```

Port-forward:
```bash
kubectl port-forward svc/api-service 8080:80 -n devops-sample
```
Open http://localhost:8080/health

## 5) Deploy With Helm
```bash
helm install devops-sample ./helm/devops-sample -n devops-sample --create-namespace
kubectl get all -n devops-sample
```

## 6) CI Pipeline
Workflow file: `.github/workflows/ci.yml`
- Install dependencies
- Run tests
- Build Docker image

## 7) Jenkins Pipeline
Pipeline file: `Jenkinsfile`

Prerequisites on Jenkins agent:
- Git
- Node.js and npm
- Docker CLI with access to Docker daemon

Setup steps:
1. Create a Pipeline job in Jenkins.
2. Select Pipeline script from SCM.
3. Point SCM to this repository and set script path to `Jenkinsfile`.
4. Run Build Now.

Run Jenkins locally (optional):
```bash
docker compose -f docker-compose.jenkins.yml up -d
```
Open http://localhost:8081 and complete first-time setup.

Get initial admin password:
```bash
docker exec devops-sample-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

What it does:
- Checkout code
- Install app dependencies (`npm ci`)
- Run tests (`npm test`)
- Build Docker image tagged with build number
- Optionally push image if `DOCKERHUB_REPO` env var is set

Optional push example:
- Set environment variable in Jenkins job: `DOCKERHUB_REPO=<your-dockerhub-user>/devops-sample-api`
- Add Docker registry credentials in Jenkins for authenticated push

## 8) Terraform Starter
```bash
cd terraform
copy terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
```
Note: set a globally unique `bucket_name` in `terraform.tfvars`.

## Troubleshooting
- If `/health` returns 503, verify DB is running and env vars are correct.
- In kind, ensure image is loaded with `kind load docker-image`.
- If Ingress is needed, install an ingress controller first.
