#!/bin/sh

echo "Pulling from GitHub"
git pull

echo "Building"
npm run-script build

echo "Deploying"
npm run-script deploy

echo "Restarting PM2"
pm2 restart lcsocket