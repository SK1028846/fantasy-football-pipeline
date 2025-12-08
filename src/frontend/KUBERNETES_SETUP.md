# Kubernetes Domain Setup Guide

This guide explains how to set up your Fantasy Trade application to use a domain name (`trade-helper.local`) instead of localhost or IP addresses.

## Prerequisites

1. **Kubernetes cluster** running
2. **Ingress Controller** installed (e.g., NGINX Ingress Controller)
   - Check if installed: `kubectl get pods -n ingress-nginx`
   - If not installed, see installation instructions below

## Step 1: Install Ingress Controller (if not already installed)

### For NGINX Ingress Controller:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### For other clusters (minikube, kind, etc.):
- **Minikube**: `minikube addons enable ingress`
- **Kind**: Follow kind-specific ingress setup
- **Docker Desktop**: May already have ingress enabled

## Step 2: Configure DNS

You have two options:

### Option A: Use `.local` domain (for local testing)

Add to your `/etc/hosts` file (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1    trade-helper.local
```

Or if using minikube, get the IP first:
```bash
minikube ip
# Then add: <MINIKUBE_IP>    trade-helper.local
```

### Option B: Use a real domain

1. Point your domain's DNS to your Kubernetes cluster's external IP
2. Update the `host` field in `ingress.yaml` to your actual domain
3. Update `VITE_AUTH0_REDIRECT_URI` in `frontend-deployment.yaml` to use your domain

### Option C: Use nip.io (for quick testing)

You can use a service like nip.io that automatically resolves to any IP:
- Update `host` in `ingress.yaml` to: `trade-helper.<YOUR_IP>.nip.io`
- Example: If your node IP is `192.168.1.100`, use `trade-helper.192.168.1.100.nip.io`
- No need to edit hosts file!

## Step 3: Deploy the Application

1. **Apply the backend deployment:**
   ```bash
   kubectl apply -f backend-deployment.yaml
   ```

2. **Apply the frontend deployment:**
   ```bash
   kubectl apply -f frontend-deployment.yaml
   ```

3. **Apply the ingress:**
   ```bash
   kubectl apply -f ingress.yaml
   ```

## Step 4: Update Auth0 Configuration

1. Go to your Auth0 Dashboard → Applications → Your Application → Settings

2. Update the following URLs (replace `trade-helper.local` with your actual domain if different):
   - **Allowed Callback URLs**: 
     ```
     http://trade-helper.local, http://trade-helper.local/*
     ```
   - **Allowed Logout URLs**: 
     ```
     http://trade-helper.local, http://trade-helper.local/*
     ```
   - **Allowed Web Origins**: 
     ```
     http://trade-helper.local
     ```

3. Save changes

## Step 5: Verify the Setup

1. **Check ingress status:**
   ```bash
   kubectl get ingress
   kubectl describe ingress trade-helper-ingress
   ```

2. **Get the ingress IP/address:**
   ```bash
   kubectl get ingress trade-helper-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
   ```
   Or for hostname:
   ```bash
   kubectl get ingress trade-helper-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
   ```

3. **Access your application:**
   - Open browser and go to: `http://trade-helper.local`
   - The frontend should load
   - Try logging in with Auth0

## Troubleshooting

### Ingress not working?

1. **Check if ingress controller is running:**
   ```bash
   kubectl get pods -n ingress-nginx
   ```

2. **Check ingress events:**
   ```bash
   kubectl describe ingress trade-helper-ingress
   ```

3. **Check if services are accessible:**
   ```bash
   kubectl get svc
   kubectl get pods
   ```

### Can't resolve domain?

1. **Verify hosts file entry** (if using .local)
2. **Try accessing via IP directly** to test if ingress is working
3. **Check DNS resolution:**
   ```bash
   ping trade-helper.local
   nslookup trade-helper.local
   ```

### Auth0 callback still failing?

1. **Verify the redirect URI matches exactly** what's in Auth0 (including http/https, port, trailing slash)
2. **Check browser console** for the exact redirect URI being used
3. **Verify environment variables** in the pod:
   ```bash
   kubectl exec -it <frontend-pod-name> -- env | grep VITE_AUTH0
   ```

### Backend API not working?

1. **Check if backend service is running:**
   ```bash
   kubectl get svc backend-service
   kubectl get pods -l app=backend
   ```

2. **Test API endpoint directly:**
   ```bash
   curl http://trade-helper.local/api/previoustrades
   ```

3. **Check ingress logs:**
   ```bash
   kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
   ```

## Architecture Overview

```
Internet
   ↓
Ingress Controller (Port 80/443)
   ↓
   ├─→ /api/* → Backend Service (Port 3000)
   │              └─→ Backend Pods
   │
   └─→ /* → Frontend Service (Port 80)
              └─→ Frontend Pods
```

## Next Steps

- **HTTPS/SSL**: Consider setting up TLS certificates (Let's Encrypt with cert-manager)
- **Production**: Use a real domain name and proper DNS configuration
- **Monitoring**: Set up monitoring and logging for your services

