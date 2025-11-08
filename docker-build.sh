#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Docker build process...${NC}\n"

# Step 1: Clean previous build
echo -e "${YELLOW}📦 Step 1: Cleaning previous builds...${NC}"
docker-compose down 2>/dev/null
docker rmi chat-app-frontend:latest 2>/dev/null
rm -rf dist
echo -e "${GREEN}✅ Clean completed${NC}\n"

# Step 2: Build Docker image
echo -e "${YELLOW}🏗️  Step 2: Building Docker image...${NC}"
docker build -t chat-app-frontend:latest . || {
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Docker image built successfully${NC}\n"

# Step 3: Check image size
echo -e "${YELLOW}📊 Step 3: Image size analysis...${NC}"
docker images chat-app-frontend:latest
echo ""

# Step 4: Start container
echo -e "${YELLOW}🚀 Step 4: Starting container...${NC}"
docker-compose up -d || {
    echo -e "${RED}❌ Failed to start container!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Container started${NC}\n"

# Step 5: Wait for container to be healthy
echo -e "${YELLOW}⏳ Step 5: Waiting for container to be ready...${NC}"
sleep 5

# Step 6: Health check
echo -e "${YELLOW}🏥 Step 6: Running health check...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ Health check passed (HTTP $HTTP_STATUS)${NC}\n"
else
    echo -e "${RED}❌ Health check failed (HTTP $HTTP_STATUS)${NC}\n"
    docker logs chat-frontend
    exit 1
fi

# Step 7: Show container info
echo -e "${YELLOW}📝 Step 7: Container information...${NC}"
docker ps | grep chat-frontend
echo ""

# Step 8: Show logs
echo -e "${YELLOW}📋 Step 8: Recent logs...${NC}"
docker logs --tail 20 chat-frontend
echo ""

# Success message
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✨ Build and deployment successful! ✨${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "Access the app at: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "Useful commands:"
echo -e "  ${YELLOW}docker logs -f chat-frontend${NC}     - View live logs"
echo -e "  ${YELLOW}docker stats chat-frontend${NC}       - View resource usage"
echo -e "  ${YELLOW}docker-compose down${NC}              - Stop and remove container"
echo ""
