#!/bin/bash
echo "Cleaning old build…"
rm -rf backend/client-service/user-authentication
rm -rf backend/client-service/server.js
rm -rf backend/client-service/*.js

echo "Re-copying fresh repo…"
ls -R .
