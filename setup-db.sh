#!/bin/bash

echo "Journey Game - Database Setup Script"
echo "====================================="
echo ""

read -p "MySQL username (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -sp "MySQL password: " DB_PASSWORD
echo ""

read -p "MySQL host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

echo ""
echo "Creating database and tables..."

mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" < database/schema.sql

if [ $? -eq 0 ]; then
    echo "✓ Database setup completed successfully!"
    echo ""
    echo "Updating .env.local file..."
    
    cat > .env.local << EOF
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=journey_game
JWT_SECRET=$(openssl rand -base64 32)
EOF
    
    echo "✓ Environment configuration updated!"
    echo ""
    echo "Setup complete! Run 'npm run dev' to start the game."
else
    echo "✗ Database setup failed. Please check your MySQL credentials."
    exit 1
fi
