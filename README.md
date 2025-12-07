# LevelField - Fantasy Football Trade Analyzer

## Overview
LevelField is a cloud-native fantasy football trade analyzer designed to help users assess the fairness of potential trades between teams.
The project focuses on Kubernetes-based deployment, highlighting scalability, modularity, persistence, and real-world DevOps practices rather than complex fantasy logic.

## Project Overview

## Goals
- Deploy a multi-pod, full-stack application using Kubernetes.
- Demonstrate infrastructure as code with YAML manifests for Deployments, Services, Persistent Volumes, and CronJobs.
- Integrate user authentication, persistent data storage, and automated updates with a CronJob.
- Showcase a modular, scalable architecture using React, Vite, Node.js, and MongoDB.

## System Components
| Component | Description |
|---|---|
| Frontend Pod (React + NGINX) | Hosts the user interface where users log in, enter trade details, and view results. Exposed via a NodePort service for external access. Backend integration is not fully connected yet. |
| Backend Pod (Node.js + Fluent Bit Sidecar) | Main container handles trade evaluation. Fluent Bit sidecar provides centralized logging for backend. |
| MongoDB Pod (Persistent Volume) | Stores player data, trade evaluations, and cached API responses. Uses PVC for durability across restarts. |
| CronJob | Periodically updates player statistics from an external API. |
| External API | Provides real-world player statistics used to calculate trade fairness. |

## Features
- Modular Kubernetes deployment with multiple pods
- Persistent data storage for MongoDB using PVC
- Centralized logging via Fluent Bit sidecar
- Automated player data refresh via CronJob
- 

## Kubernetes Deployment Instructions
Clone the repository:
```bash
git clone https://github.com/SK1028846/fantasy-football-pipeline.git
cd fantasy-football-pipeline
```

### Applying Manifests
All YAML manifests for Deployments, Services, CronJobs, and Persistent Volumes are stored in the manifests/ folder. To deploy the full stack in your Kubernetes cluster:

```bash
kubectl apply -f manifests/volumes/mongo-pv-pvc.yaml
kubectl apply -f manifests/deployments/mongo-deployment.yaml
kubectl apply -f manifests/deployments/backend-deployment.yaml
kubectl apply -f manifests/deployments/frontend-deployment.yaml
kubectl apply -f manifests/cronjobs/data-intake-cronjob.yaml
```
### Accessing Services
- Frontend: Exposed via NodePort. Access it using the node IP and port 30080:

```bash
http://<CloudLab-node-IP>:30080
```

- Backend: Internal ClusterIP service. Test connectivity from the frontend pod:

```bash
sudo kubectl exec -it <frontend-pod> -- curl http://backend-service:3000
```
Expected response: `Hello from backend`

### Scaling & Self-Healing
To demonstrate scaling, increase the number of backend replicas:

```bash
kubectl scale deploy backend-development --replicas=3
kubectl get pods -w
```

- You should see 3 running backend pods.
- To show self-healing, manually delete a pod:

```bash
kubectl delete pod <backend-pod-name>
kubectl get pods -w
```

- Kubernetes automatically recreates the deleted pod, proving self-healing.

### Sidecar Rationale
The backend pod includes a Fluent Bit sidecar:
- Captures logs from the main backend container using a shared emptyDir volume ( ```/var/log/app``` ).
- Demonstrates pod extensibility without modifying main container code.
- Can be adapted for metrics, monitoring, or authentication in production.

## Persistence Plan
MongoDB uses a Persistent Volume Claim (PVC) mounted at ```/data/db```:
- Stores player statistics and trade evaluation data.
- Data persists across pod restarts and backend scaling.
- Logs from Fluent Bit are ephemeral (```emptyDir```) but captured in stdout for testing.

## Testing

| Test Case | Expected Result |
|---|---|
| Backend Pod Logs | Log entries appear in Fluent Bit output |
| CronJob Execution | MongoDB updated with new player data |
| PVC Persistence | Data retained after MongoDB pod restart |
| Scaling Backend | Multiple backend pods run simultaneously |
| Auth0 Login | User authenticated successfully |
| Self-Healing | Deleted pod automatically recreated |

Note: Trade evaluation UI is not functional at this time; backend/frontend integration remains a future step.


## Team Members (Group 5)

- Michael Davis - Database & Scheduled Processing
- Stephen Kain - Documentation & Kubernetes Deployments
- Vance Keesler - Backend Development
- Matthew Sheehan - Frontend Development
