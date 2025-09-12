import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68ac5f6d4517893a52afddec", 
  requiresAuth: false // Ensure authentication is required for all operations
});
