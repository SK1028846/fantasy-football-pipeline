# Trade Helper - Fantasy Football Trade Analyzer

# Overview
Trade Helper is a minimalist fantasy football trade analyzer designed to help users assess the fairness of potential trades between teams.
The project demonstrates cloud-native application deployment using Kubernetes, focusing on scalability, modularity, and persistence rather than the complexity of a full fantasy platform.

# Project Overview

# Goals
- Implement a multi-pod, full-stack pipeline on Kubernetes.
- Demonstrate infrastructure as code using YAML manifests for Deployments and Services.
- Integrate authentication, data persistence, and periodic data updates via a CronJob.
- Emphasize modularity and scalability for real-world cloud architectures.

# Features
- User authentication via Auth0
- Trade fairness scoring via Flask evaluator
- Player stats stored in MongoDB
- Automated data refresh CronJob
- Modular pods for easy scalability

# Deployment Instructions
Coming Soon

# Persistence Plan
MongoDB uses a Persistent Volume Claim (PVC) to store:
- Player statistics (from external API)
- Trade evaluation data (cached results)

PVC ensures that data persists across pod restarts

# Testing

| Test Case | Expected Result |
|---|---|
| Valid Trade Input | Returns fairness score |
| Missing Players | Returns error message |
| CronJob Runs | Updates MongoDB |
| Pod Restart | MongoDB retains data |
| Auth0 Login | User authenticated successfully |


# Team Members

- Michael Davis
- Stephen Kain
- Vance Keesler
- Matthew Sheehan
