# Trade Helper - Fantasy Football Trade Analyzer

## Overview
Trade Helper is a cloud-native fantasy football trade analyzer designed to help users assess the fairness of potential trades between teams.
The project focuses on Kubernetes-based deployment, highlighting scalability, modularity, persistence, and real-world DevOps practices rather than complex fantasy logic.

## Project Overview

## Goals
- Deploy a multi-pod, full-stack application using Kubernetes.
- Demonstrate infrastructure as code with YAML manifests for Deployments and Services.
- Integrate user authentication, persistent data storage, and automated updates with a CronJob.
- Showcase scalable microservice architecture using React, Flask, and MongoDB.

## System Components
| Component | Description |
|---|---|
| Frontend Pod (React + NGINX) | Hosts the user interface where users log in, enter trade details, and view results. Exposed via a NodePort service for external access. |
| Backend Pod (Flask Evaluator + Auth0 Sidecar) | Multi-container pod that handles trade logic and authentication. Communicates with MongoDB for reading/writing player stats. |
| MongoDB Pod (Persistent Volume) | Stores player data, trade evaluations, and cached API responses. Uses PVC for durability across restarts. |
| CronJob | Periodically updates player statistics from an external API. |
| External API | Provides real-world player statistics used to calculate trade fairness. |

## Features
- User authentication via Auth0
- Trade fairness scoring via Flask evaluator
- Player stats stored in MongoDB
- Automated data refresh CronJob
- Modular pods for easy scalability

## Kubernetes Deployment Instructions
Clone the repository:
```bash
git clone https://github.com/SK1028846/fantasy-football-pipeline.git
cd fantasy-football-pipeline
```

### Applying Manifests
All YAML manifests for Deployments, Services, CronJobs, and Persistent Volumes are stored in the manifests/ folder. To deploy the full stack in your Kubernetes cluster:

```bash
sudo kubectl apply -f manifests/volumes/mongo-pv-pvc.yaml
sudo kubectl apply -f manifests/deployments/mongo-deployment.yaml
sudo kubectl apply -f manifests/deployments/backend-deployment.yaml
sudo kubectl apply -f manifests/deployments/frontend-deployment.yaml
sudo kubectl apply -f manifests/cronjobs/data-intake-cronjob.yaml
```
### Accessing Services
- Frontend: Exposed via NodePort. Access it using the node IP and port 30080:

```bash
http://<CloudLab-node-IP>:30080
```

- Backend: Internal ClusterIP service. Test connectivity from the frontend pod:

```bash
sudo kubectl exec -it <frontend-pod> -- curl http://backend-service:80
```
Expected response: `Hello from backend`

### Scaling & Self-Healing
To demonstrate scaling, increase the number of backend replicas:

```bash
sudo kubectl scale deploy backend-development --replicas=3
sudo kubectl get pods -w
```

- You should see 3 running backend pods.
- To show self-healing, manually delete a pod:

```bash
sudo kubectl delete pod <backend-pod-name>
sudo kubectl get pods -w
```

- Kubernetes automatically recreates the deleted pod, proving self-healing.

### Sidecar Rationale
The backend pod contains a sidecar container (Auth0 placeholder) to simulate authentication or logging.
- Sidecars allow one to extend pod functionality without modifying the main container.
- In production, this could be a metrics exporter, logger, or authentication agent.

## Persistence Plan
MongoDB uses a Persistent Volume Claim (PVC) to store:
- Player statistics (from external API)
- Trade evaluation data (cached results)

PVC ensures that data persists across pod restarts

## Testing

| Test Case | Expected Result |
|---|---|
| Valid Trade Input | Returns fairness score |
| Missing Players | Returns error message |
| CronJob Runs | Updates MongoDB |
| Pod Restart | MongoDB retains data |
| Auth0 Login | User authenticated successfully |


## Team Members (Group 5)

- Michael Davis - Backend developer
- Stephen Kain - QA / Documentation
- Vance Keesler - DevOps / Frontend Developer
- Matthew Sheehan - Project Lead / PM
