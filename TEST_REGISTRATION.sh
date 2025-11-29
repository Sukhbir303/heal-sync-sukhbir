#!/bin/bash

# 🧪 HealSync Registration System Test Script
# This script tests the complete registration flow for all 5 agent types

echo "🧪 =========================================="
echo "   HealSync Registration System Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
API_URL="http://localhost:4000"
TIMESTAMP=$(date +%s)

# Function to test registration
test_registration() {
    local AGENT_TYPE=$1
    local AGENT_NAME=$2
    local AGENT_EMOJI=$3
    
    echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${AGENT_EMOJI}  Testing ${AGENT_NAME} Registration..."
    echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Prepare test data based on agent type
    case $AGENT_TYPE in
        "hospital")
            ENTITY_EMAIL="test.hospital.${TIMESTAMP}@example.com"
            ADMIN_EMAIL="admin.hospital.${TIMESTAMP}@example.com"
            ENTITY_DATA='{
                "entityType":"hospital",
                "name":"Test Hospital '${TIMESTAMP}'",
                "email":"'${ENTITY_EMAIL}'",
                "phone":"+1234567890",
                "zone":"Zone-1",
                "address":"123 Test St",
                "coordinates":{"lat":19.0,"lng":72.0},
                "profile":{"beds":{"total":100}},
                "currentState":{"beds":{"general":{"total":80,"used":20},"icu":{"total":20,"used":5}}}
            }'
            ;;
        "lab")
            ENTITY_EMAIL="test.lab.${TIMESTAMP}@example.com"
            ADMIN_EMAIL="admin.lab.${TIMESTAMP}@example.com"
            ENTITY_DATA='{
                "entityType":"lab",
                "name":"Test Lab '${TIMESTAMP}'",
                "email":"'${ENTITY_EMAIL}'",
                "phone":"+1234567890",
                "zone":"Zone-1",
                "address":"123 Test St",
                "coordinates":{"lat":19.0,"lng":72.0},
                "profile":{"capacity":1000},
                "currentState":{"testResults":{"dengue":50,"malaria":30}}
            }'
            ;;
        "pharmacy")
            ENTITY_EMAIL="test.pharmacy.${TIMESTAMP}@example.com"
            ADMIN_EMAIL="admin.pharmacy.${TIMESTAMP}@example.com"
            ENTITY_DATA='{
                "entityType":"pharmacy",
                "name":"Test Pharmacy '${TIMESTAMP}'",
                "email":"'${ENTITY_EMAIL}'",
                "phone":"+1234567890",
                "zone":"Zone-1",
                "address":"123 Test St",
                "coordinates":{"lat":19.0,"lng":72.0},
                "profile":{},
                "currentState":{"medicines":{"paracetamol":{"stock":500,"reorderLevel":100}}}
            }'
            ;;
        "supplier")
            ENTITY_EMAIL="test.supplier.${TIMESTAMP}@example.com"
            ADMIN_EMAIL="admin.supplier.${TIMESTAMP}@example.com"
            ENTITY_DATA='{
                "entityType":"supplier",
                "name":"Test Supplier '${TIMESTAMP}'",
                "email":"'${ENTITY_EMAIL}'",
                "phone":"+1234567890",
                "address":"123 Test St",
                "coordinates":{"lat":19.0,"lng":72.0},
                "profile":{"serviceZones":["Zone-1","Zone-2"]},
                "currentState":{"inventory":{"medicines":{"stock":10000}}}
            }'
            ;;
        "cityadmin")
            ENTITY_EMAIL="test.cityadmin.${TIMESTAMP}@example.com"
            ADMIN_EMAIL="admin.cityadmin.${TIMESTAMP}@example.com"
            ENTITY_DATA='{
                "entityType":"cityadmin",
                "name":"Test City Admin '${TIMESTAMP}'",
                "email":"'${ENTITY_EMAIL}'",
                "phone":"+1234567890",
                "address":"City Hall",
                "coordinates":{"lat":19.0,"lng":72.0},
                "profile":{"department":"Health"},
                "currentState":{}
            }'
            ;;
    esac
    
    USER_DATA='{
        "email":"'${ADMIN_EMAIL}'",
        "password":"test123",
        "name":"Test Admin"
    }'
    
    # Send registration request
    echo "📤 Sending registration request..."
    RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "entityData": '${ENTITY_DATA}',
            "userData": '${USER_DATA}'
        }')
    
    # Parse response
    SUCCESS=$(echo $RESPONSE | jq -r '.success')
    
    if [ "$SUCCESS" == "true" ]; then
        ENTITY_ID=$(echo $RESPONSE | jq -r '.data.entity.id')
        USER_ID=$(echo $RESPONSE | jq -r '.data.user.id')
        TOKEN=$(echo $RESPONSE | jq -r '.data.token')
        
        echo "${GREEN}✅ Registration SUCCESSFUL!${NC}"
        echo "   Entity ID: ${ENTITY_ID}"
        echo "   User ID: ${USER_ID}"
        echo "   Token: ${TOKEN:0:20}..."
        echo ""
        
        # Test entity retrieval
        echo "📥 Testing entity retrieval..."
        ENTITY_RESPONSE=$(curl -s "${API_URL}/api/entities/${ENTITY_ID}")
        ENTITY_SUCCESS=$(echo $ENTITY_RESPONSE | jq -r '.success')
        
        if [ "$ENTITY_SUCCESS" == "true" ]; then
            ENTITY_NAME=$(echo $ENTITY_RESPONSE | jq -r '.data.name')
            echo "${GREEN}✅ Entity retrieval SUCCESSFUL!${NC}"
            echo "   Name: ${ENTITY_NAME}"
        else
            ERROR_MSG=$(echo $ENTITY_RESPONSE | jq -r '.message')
            echo "${RED}❌ Entity retrieval FAILED: ${ERROR_MSG}${NC}"
        fi
        
        return 0
    else
        ERROR_MSG=$(echo $RESPONSE | jq -r '.message')
        echo "${RED}❌ Registration FAILED: ${ERROR_MSG}${NC}"
        return 1
    fi
    
    echo ""
}

# Check if backend is running
echo "🔍 Checking backend status..."
if curl -s "${API_URL}/health" > /dev/null 2>&1; then
    echo "${GREEN}✅ Backend is running${NC}"
else
    echo "${RED}❌ Backend is not running!${NC}"
    echo "   Please start the backend first:"
    echo "   cd backend && npm run dev"
    exit 1
fi
echo ""

# Test all agent types
PASSED=0
FAILED=0

test_registration "hospital" "Hospital" "🏥" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
echo ""

test_registration "lab" "Lab" "🔬" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
echo ""

test_registration "pharmacy" "Pharmacy" "💊" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
echo ""

test_registration "supplier" "Supplier" "📦" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
echo ""

test_registration "cityadmin" "City Admin" "🏙️" && PASSED=$((PASSED+1)) || FAILED=$((FAILED+1))
echo ""

# Summary
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "📊 Test Summary"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}✅ Passed: ${PASSED}${NC}"
if [ $FAILED -gt 0 ]; then
    echo "${RED}❌ Failed: ${FAILED}${NC}"
fi
echo ""

if [ $FAILED -eq 0 ]; then
    echo "${GREEN}🎉 ALL TESTS PASSED! Registration system is working perfectly!${NC}"
    exit 0
else
    echo "${RED}❌ Some tests failed. Please check the errors above.${NC}"
    exit 1
fi

