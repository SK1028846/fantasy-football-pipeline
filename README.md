# Trade Helper - Fantasy Football Trade Analyzer

# Overview
Trade Helper is a cloud-native fantasy football trade analyzer designed to help users assess the fairness of potential trades between teams.
The project focuses on Kubernetes-based deployment, highlighting scalability, modularity, persistence, and real-world DevOps practices rather than complex fantasy logic.

# Project Overview

# Goals
- Deploy a multi-pod, full-stack application using Kubernetes.
- Demonstrate infrastructure as code with YAML manifests for Deployments and Services.
- Integrate user authentication, persistent data storage, and automated updates with a CronJob.
- Showcase scalable microservice architecture using React, Flask, and MongoDB.

# System Components
| Component | Description |
|---|---|
| Frontend Pod (React + NGINX) | Hosts the user interface where users log in, enter trade details, and view results. Exposed via a NodePort service for external access. |
| Backend Pod (Flask Evaluator + Auth0 Sidecar) | Multi-container pod that handles trade logic and authentication. Communicates with MongoDB for reading/writing player stats. |
| MongoDB Pod (Persistent Volume) | Stores player data, trade evaluations, and cached API responses. Uses PVC for durability across restarts. |
| CronJob | Periodically updates player statistics from an external API. |
| External API | Provides real-world player statistics used to calculate trade fairness. |

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


# Team Members (Group 5)

- Michael Davis - Backend developer
- Stephen Kain - QA / Documentation
- Vance Keesler - DevOps / Frontend Developer
- Matthew Sheehan - Project Lead / PM
