// MongoDB initialization script
// This script runs when the MongoDB container is first created

// Switch to the application database
db = db.getSiblingDB('yourapp');

// Create application user with read/write permissions
db.createUser({
  user: 'appuser',
  pwd: 'apppassword', // Change this in production
  roles: [
    {
      role: 'readWrite',
      db: 'yourapp'
    }
  ]
});

// Create initial collections with indexes
db.createCollection('users');
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "stripe_customer_id": 1 });

db.createCollection('documents');
db.documents.createIndex({ "user_id": 1, "created_at": -1 });

db.createCollection('subscriptions');
db.subscriptions.createIndex({ "user_id": 1 });
db.subscriptions.createIndex({ "stripe_customer_id": 1 });
db.subscriptions.createIndex({ "stripe_subscription_id": 1 });

db.createCollection('payments');
db.payments.createIndex({ "user_id": 1 });
db.payments.createIndex({ "stripe_payment_intent_id": 1 });

db.createCollection('sessions');
db.sessions.createIndex({ "session_token": 1 });
db.sessions.createIndex({ "expires": 1 });

db.createCollection('accounts');
db.accounts.createIndex({ "user_id": 1 });
db.accounts.createIndex({ "provider": 1, "provider_account_id": 1 }, { unique: true });

db.createCollection('verification_tokens');
db.verification_tokens.createIndex({ "identifier": 1, "token": 1 }, { unique: true });
db.verification_tokens.createIndex({ "expires": 1 });

db.createCollection('activity_logs');
db.activity_logs.createIndex({ "user_id": 1, "created_at": -1 });

print('Database initialized successfully');