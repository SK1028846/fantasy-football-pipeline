# Fantasy Football Application

# Overview
This project is a cloud-native Fantasy Football application designed to demonstrate scalability, modularity, and fault tolerance using Kubernetes. The system is built using a microservices architecture with independent services for authentication, league management, team services, and player statistics.

The primary goal is to ensure high availability and real-time updates for users during peak usage.

# System Architecture

Our system follows a microservices-based approach deployed on Kubernetes:
- Ingress Controller - Routes user requests into the cluster.
- React Frontend Pod - Provides the user interface for fantasy league management.
- Backend/API Pod - Coordinates between services, handles user actions, and communicates with databases.
- Authentication Service + Auth Database - Manages secure login and session data.
- User Service + User Database - Stores user profiles and preferences.
- League Service + Leage Database - Handles league creation, membership, and rules.
- Team Services - Manages team rosters, trades, and matchups.
- External Player API Integration - Provides real-time player statistics and updates.

# Features

- User registration and authentication
- League and team creation/management
- Real-time scoring updates from an external player API
- Secure and scalable design using Kubernetes
- Modular microservices architecture for flexibility and evolution

# Team Members

- Michael Davis
- Stephen Kain
- Vance Keesler
- Matthew Sheehan
