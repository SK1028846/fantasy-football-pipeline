#!/bin/bash

echo "Applying Kubernetes manifests..."

kubectl apply -f manifests/volumes/mongo-pv-pvc.yaml
kubectl apply -f manifests/deployments/mongo-deployment.yaml
kubectl apply -f manifests/deployments/backend-deployment.yaml
kubectl apply -f manifests/deployments/frontend-deployment.yaml
kubectl apply -f manifests/cronjobs/data-intake-cronjob.yaml
kubectl apply -f manifests/cronjobs/nfl-data-ingestion-cronjob.yaml

echo "Done! Checking status..."

kubectl get pods -o wide
