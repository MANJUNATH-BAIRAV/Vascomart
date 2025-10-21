
# Vascomart

Vascomart is a microservices-based e-commerce platform built with Spring Boot and React. Each service is containerized using Docker, orchestrated with Kubernetes, and registered with a Eureka discovery server. The platform is designed to provide modularity, scalability, and independent deployment of each service.

## Overview

Vascomart simulates a production-grade e-commerce system where multiple backend services communicate through an API Gateway. The architecture ensures fault isolation, scalability, and clear separation of responsibilities.

## Microservices

| Service              | Description                                                           | Port (External → Internal) |
| -------------------- | --------------------------------------------------------------------- | -------------------------- |
| auth-service         | Handles user authentication and JWT-based authorization.              | 8081 → 8080                |
| user-service         | Manages user profiles and account information.                        | 8082 → 8080                |
| inventory-service    | Manages product and inventory-related operations.                     | 8083 → 8080                |
| order-service        | Handles order placement, tracking, and coordination with inventory.   | 8085 → 8080                |
| notification-service | Sends email or system notifications related to user and order events. | 8086 → 8080                |
| gateway-service      | Routes all client requests to respective microservices.               | 8087 → 8080                |

## Tech Stack

Backend: Java, Spring Boot, Spring Cloud (Eureka, Gateway)
Frontend: React.js
Databases: MySQL / MongoDB (per service)
Containerization: Docker
Orchestration: Kubernetes
API Testing: Postman, Swagger

## Architecture Highlights

* Each service runs independently and communicates through REST APIs.
* All services are registered with the Eureka Discovery Server.
* The API Gateway handles routing and request filtering.
* Every microservice maintains its own database schema for isolation.
* The frontend interacts only through the Gateway endpoint.

## Docker Setup

Each microservice includes its own Dockerfile. To build and run all services locally:

docker-compose build
docker-compose up -d

Ensure that required environment variables (database credentials, JWT secrets, etc.) are defined in `.env` or passed at runtime.

## Kubernetes Deployment

Kubernetes manifests are located under the `k8s/` directory. To deploy Vascomart on a Kubernetes cluster:

kubectl create namespace vascomart
kubectl apply -f k8s/ -n vascomart
kubectl get pods -n vascomart
kubectl get svc -n vascomart

Each service has its own Deployment and Service YAML file for easy scaling and management.

## Frontend

The React frontend is located in the `frontend/` directory. It connects to the backend through the Gateway service (for example, `http://localhost:8087`).

To run locally:

cd frontend
npm install
npm start

## Testing

* Use Postman or Swagger to test API endpoints for each service.
* Verify service registration in Eureka at `http://localhost:8761`.
* Check inter-service communication through the API Gateway.
* Validate database consistency for each independent service.

## Project Structure

vascomart/
├── auth-service/
├── user-service/
├── inventory-service/
├── order-service/
├── notification-service/
├── gateway-service/
├── eureka-server/
├── frontend/
├── docker-compose.yml
└── k8s/
  ├── auth-deployment.yml
  ├── order-deployment.yml
  ├── inventory-deployment.yml
  └── ...

## Future Improvements

* Add centralized monitoring using Prometheus and Grafana.
* Introduce distributed tracing with Zipkin.
* Add Resilience4j for fault tolerance and circuit breaking.
* Extend notification channels (SMS, WebSocket updates).

## Author

Manjunath Bairav
LinkedIn: [https://www.linkedin.com/in/manjunathbairav1/](https://www.linkedin.com/in/manjunathbairav1/)

