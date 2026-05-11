#!/bin/bash

# Test script to verify fraud-alerts endpoint

API_URL="http://localhost:5000/api/v1"
ADMIN_EMAIL="gibubett@gmail.com"
ADMIN_PASSWORD="Admin@123"

echo "=========================================="
echo "Testing Fraud Alerts Endpoint"
echo "=========================================="
echo ""

# Step 1: Login to get auth token
echo "Step 1: Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -c /tmp/cookies.txt -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Step 2: Get fraud alerts using the stored cookies
echo "Step 2: Fetching fraud alerts..."
FRAUD_ALERTS=$(curl -s -b /tmp/cookies.txt "$API_URL/notifications/fraud-alerts?page=1&limit=8")

echo "Fraud Alerts Response:"
echo "$FRAUD_ALERTS" | jq . 2>/dev/null || echo "$FRAUD_ALERTS"
echo ""

echo "=========================================="
echo "Test Complete"
echo "=========================================="
