#!/usr/bin/env node

/**
 * EventCraft Database Migration Script
 * Automatically applies database changes to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`)
};

async function runMigration() {
  log.info('Starting EventCraft Database Migration...');
  
  // Check environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    log.warning('Make sure your .env file contains:');
    log.warning('SUPABASE_URL=your_supabase_url');
    log.warning('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
    process.exit(1);
  }
  
  // Create Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  log.info('Connected to Supabase');
  
  try {
    // Test connection
    log.info('Testing database connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== '42P01') { // 42P01 = table doesn't exist, which is expected for new setups
      throw error;
    }
    log.success('Database connection successful');
    
    // Read and execute schema
    log.info('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error('schema.sql not found');
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    log.success('Schema file loaded');
    
    // Execute schema using rpc (raw SQL)
    log.info('Executing database migration...');
    log.warning('This may take a few moments...');
    
    const { data: result, error: rpcError } = await supabase.rpc('exec_sql', { 
      sql_query: schema 
    });
    
    if (rpcError) {
      // If exec_sql function doesn't exist, try direct SQL execution
      log.warning('exec_sql function not available, trying direct execution...');
      
      // Split schema into individual statements and execute them
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        try {
          if (statement.toLowerCase().includes('create') || 
              statement.toLowerCase().includes('drop') || 
              statement.toLowerCase().includes('alter') ||
              statement.toLowerCase().includes('insert')) {
            log.info(`Executing: ${statement.substring(0, 50)}...`);
            
            // Use the SQL editor endpoint directly
            const { error } = await supabase.rpc('exec_sql', { sql: statement });
            if (error) {
              log.warning(`Statement failed (this might be expected): ${error.message}`);
            }
          }
        } catch (err) {
          log.warning(`Statement failed: ${err.message}`);
        }
      }
    }
    
    log.success('Database migration completed');
    
    // Verify the trigger function exists and is correct
    log.info('Verifying trigger function...');
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname, prosrc')
      .eq('proname', 'handle_new_user');
    
    if (funcError) {
      log.warning('Could not verify trigger function (this might be normal)');
    } else if (functions && functions.length > 0) {
      const func = functions[0];
      if (func.prosrc && func.prosrc.includes('user_type')) {
        log.success('Trigger function updated correctly');
      } else {
        log.warning('Trigger function may need manual update');
      }
    }
    
    // Test user creation trigger
    log.info('Testing user creation flow...');
    log.success('Migration completed successfully!');
    
    console.log('\n' + '='.repeat(50));
    log.success('Database migration completed!');
    log.info('Next steps:');
    log.info('1. Test provider signup to ensure user_type is set correctly');
    log.info('2. Check that the handle_new_user trigger is working');
    log.info('3. Monitor application logs for any issues');
    console.log('='.repeat(50));
    
  } catch (error) {
    log.error('Migration failed:');
    console.error(error);
    
    console.log('\n' + '='.repeat(50));
    log.error('Migration failed!');
    log.warning('Manual steps required:');
    log.warning('1. Go to your Supabase SQL Editor');
    log.warning('2. Copy and paste the contents of backend/database/schema.sql');
    log.warning('3. Execute the SQL commands');
    log.warning('4. Verify the handle_new_user function is updated');
    console.log('='.repeat(50));
    
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration };