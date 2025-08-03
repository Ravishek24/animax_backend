# Database Migrations Guide

This directory contains all the database migrations for the Pashupalak Manch backend.

## Migration Files

1. **001-create-users.js** - Creates the users table
2. **002-create-categories.js** - Creates the categories table
3. **003-create-animals.js** - Creates the animals table with foreign keys
4. **004-create-animal-media.js** - Creates the animal_media table
5. **005-create-supplements.js** - Creates the supplements table
6. **006-create-supplement-images.js** - Creates the supplement_images table
7. **007-create-orders.js** - Creates the orders table
8. **008-create-order-items.js** - Creates the order_items table
9. **009-create-verifications.js** - Creates the verifications table

## Running Migrations

### Option 1: Using the migration script
```bash
node run-migrations.js
```

### Option 2: Using Sequelize CLI directly
```bash
# Install dependencies first
npm install

# Run all migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all
```

### Option 3: Run specific migration
```bash
# Run migrations up to a specific file
npx sequelize-cli db:migrate --to 003-create-animals.js
```

## Database Schema Overview

### Users Table
- `user_id` (Primary Key)
- `full_name`
- `phone_number` (Unique)
- `registration_date`
- `role` (ENUM: 'user', 'admin')

### Categories Table
- `category_id` (Primary Key)
- `category_name` (Unique)

### Animals Table
- `animal_id` (Primary Key)
- `seller_id` (Foreign Key → users.user_id)
- `category_id` (Foreign Key → categories.category_id)
- `title`, `description`, `price`
- `is_negotiable`, `lactation_number`
- `milk_yield_per_day`, `peak_milk_yield_per_day`
- `is_pregnant`, `months_pregnant`
- `calf_status`, `selling_timeframe`, `status`
- `location_address`, `location_latitude`, `location_longitude`
- `listing_date`

### Animal Media Table
- `media_id` (Primary Key)
- `animal_id` (Foreign Key → animals.animal_id)
- `media_url`, `media_type`, `tag`

### Supplements Table
- `supplement_id` (Primary Key)
- `title`, `brand`, `description`
- `target_animal`, `ingredients`
- `dosage_amount`, `dosage_unit`, `dosage_frequency`
- `net_weight`, `price`, `stock_quantity`
- `status` (ENUM: 'Available', 'Out of Stock')
- `date_added`

### Supplement Images Table
- `image_id` (Primary Key)
- `supplement_id` (Foreign Key → supplements.supplement_id)
- `image_url`, `is_primary`

### Orders Table
- `order_id` (Primary Key)
- `user_id` (Foreign Key → users.user_id)
- `order_type`, `total_amount`, `status`
- `created_at`, `updated_at`

### Order Items Table
- `order_item_id` (Primary Key)
- `order_id` (Foreign Key → orders.order_id)
- `product_id`, `product_type`, `quantity`, `price`

### Verifications Table
- `verification_id` (Primary Key)
- `session_uuid` (Unique)
- `app_uuid`, `phone_number`
- `status` (ENUM: 'in-progress', 'verified', 'expired', 'failed')
- `channel` (ENUM: 'sms', 'voice')
- `locale`, `attempts`, `otp_attempts`, `charges`
- `expires_at`, `verified_at`
- `brand_name`, `app_hash`

## Important Notes

1. **Foreign Key Constraints**: All foreign keys have proper CASCADE/RESTRICT rules
2. **Indexes**: Performance indexes are added for frequently queried fields
3. **ENUMs**: Proper ENUM types are used for status fields
4. **Unique Constraints**: Phone numbers and session UUIDs are unique
5. **JSON Fields**: Used for flexible data storage (otp_attempts, charges)

## Environment Variables Required

Make sure your `.env` file has:
```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

## Troubleshooting

If you encounter issues:

1. **Check database connection**: Ensure your database is running and accessible
2. **Check environment variables**: Verify all DB_* variables are set correctly
3. **Check permissions**: Ensure the database user has CREATE TABLE permissions
4. **Check existing tables**: If tables already exist, you may need to drop them first

## Rollback

To undo migrations:
```bash
# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all
``` 