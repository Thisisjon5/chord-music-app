# Deployment Guide for chord.jonalstott.com

This guide explains how to deploy the Chord Music App to your VPS using Docker and Caddy.

## Prerequisites

- DNS record for `chord.jonalstott.com` pointing to your VPS IP address
- Docker and Docker Compose installed on your VPS
- The infrastructure repository set up at `/root/projects/infrastructure`

## Deployment Steps

### 1. Build and start the container

From the infrastructure directory:

```bash
cd /root/projects/infrastructure
docker-compose up -d --build chord-app
```

This will:
- Build the Vite app (TypeScript compilation + production build)
- Create a Docker image with nginx serving the static files
- Start the container and connect it to the shared network

### 2. Reload Caddy to apply the new configuration

```bash
docker-compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

Or restart the Caddy container:

```bash
docker-compose restart caddy
```

### 3. Verify the deployment

Check that the container is running:

```bash
docker ps | grep chord-app
```

Check the logs:

```bash
docker-compose logs chord-app
```

### 4. Access the app

Once Caddy has obtained an SSL certificate (happens automatically), you can access the app at:

**https://chord.jonalstott.com**

## Updating the App

To deploy updates:

1. Make your changes to the code
2. Rebuild and restart the container:

```bash
cd /root/projects/infrastructure
docker-compose up -d --build chord-app
```

## Troubleshooting

### Check container status
```bash
docker-compose ps chord-app
```

### View logs
```bash
docker-compose logs -f chord-app
```

### Check Caddy logs
```bash
docker-compose logs -f caddy
```

### Rebuild from scratch
```bash
docker-compose down chord-app
docker-compose up -d --build chord-app
```

### Test nginx configuration
```bash
docker-compose exec chord-app nginx -t
```

## Architecture

- **Frontend**: Vite + React + TypeScript
- **Web Server**: nginx (serves static files)
- **Reverse Proxy**: Caddy (handles SSL, routing)
- **Network**: Connected to `shared-network` for inter-container communication
