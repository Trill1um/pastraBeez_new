import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export const client = new Redis(process.env.REDIS_URL);

// // Enable keyspace notifications programmatically
// const setupKeyspaceNotifications = async () => {
//   try {
//     await client.config('SET', 'notify-keyspace-events', 'KEgx');
//     console.log('Keyspace notifications enabled');
//   } catch (error) {
//     console.error('Failed to enable keyspace notifications:', error);
//   }
// };

// // Debug and test function for Upstash
// export const testUpstashNotifications = async () => {
//   console.log('🧪 Testing Upstash keyspace notifications...');
  
//   // Check current config
//   try {
//     const currentConfig = await client.config('GET', 'notify-keyspace-events');
//     console.log('Current keyspace config:', currentConfig);
//   } catch (error) {
//     console.log('Could not get config:', error.message);
//   }
  
//   // Enable notifications
//   try {
//     await client.config('SET', 'notify-keyspace-events', 'Ex');
//     console.log('✅ Keyspace notifications enabled');
//   } catch (error) {
//     console.error('❌ Failed to set notifications:', error.message);
//     return false;
//   }
  
//   // Create a separate subscriber
//   const sub = client.duplicate();
  
//   // Set up listener
//   const messageHandler = (pattern, channel, message) => {
//     console.log('🎉 NOTIFICATION RECEIVED:');
//     console.log('  Pattern:', pattern);
//     console.log('  Channel:', channel);
//     console.log('  Message:', message);
//   };
  
//   sub.on('pmessage', messageHandler);
  
//   // Subscribe to all keyevent notifications
//   await sub.psubscribe('__keyevent@*__:*');
//   console.log('📡 Subscribed to keyevent notifications');
  
//   // Test with a short-lived key
//   setTimeout(async () => {
//     console.log('⏰ Creating test key that expires in 3 seconds...');
//     await client.setex('upstash-test-key', 3, 'test-value');
//   }, 1000);
  
//   // Clean up after 10 seconds
//   setTimeout(async () => {
//     sub.removeListener('pmessage', messageHandler);
//     await sub.quit();
//     console.log('🧹 Test cleanup completed');
//   }, 10000);
  
//   return true;
// };

// // Email verification key listener
// export async function listenForEmailVerification(email, callbacks = {}) {
//   try {
//     const key = `verifying:${email}`;
//     console.log("Creating email verification listener for:", email);

//     // Enable notifications if not already done
//     await setupKeyspaceNotifications();

//     // Create subscriber instance
//     const sub = client.duplicate();
//     console.log("Email verification subscriber connected.");

//     // Subscribe to expired and deleted key events
//     sub.psubscribe(`__keyevent@*__:*`);

//     const handler = (pattern, channel, msg) => {
//       console.log("Email verification event:", { pattern, channel, msg });
      
//       // Only handle our specific verification key
//       if (msg !== key) return;
//       console.log("Check channel contents:", channel);
      
//       if (channel.endsWith(":expired")) {
//         if (callbacks.onExpire) {
//           console.log(`Email verification expired for: ${email}`);
//           callbacks.onExpire(email, key);
//         } else {
//           console.log(`Email verification expired: ${email}`);
//         }
//       } else if (channel.endsWith(":del")) {
//         if (callbacks.onDelete) {
//           console.log(`Email verification completed for: ${email}`);
//           callbacks.onDelete(email, key);
//         } else {
//           console.log(`Email verification key deleted: ${email}`);
//         }
//       }
//     };

//     sub.on("pmessage", handler);
//     console.log(`Email verification listener active for: ${email}`);

//     // Return cleanup function
//     return async () => {
//       sub.removeListener("pmessage", handler);
//       await sub.quit();
//       console.log(`Email verification listener cleaned up for: ${email}`);
//     };
//   } catch (error) {
//     console.error("Error setting up email verification listener:", error);
//     return async () => {};
//   }
// }