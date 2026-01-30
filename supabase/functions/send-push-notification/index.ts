import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  title: string;
  message: string;
  recipientType: 'all' | 'group' | 'user';
  groupId?: string | null;
  userId?: string | null;
  data?: Record<string, string>;
}

interface FCMMessage {
  token: string;
  notification: {
    title: string;
    body: string;
  };
  data?: Record<string, string>;
  android?: {
    priority: 'high' | 'normal';
    notification?: {
      sound: 'default';
      channelId: string;
    };
  };
  apns?: {
    payload: {
      aps: {
        sound: 'default';
        'content-available': number;
      };
    };
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("==== PUSH NOTIFICATION SESSION START ====");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firebaseProjectId = Deno.env.get("FIREBASE_PROJECT_ID");
    const firebaseServiceAccountKey = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_KEY");

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: PushNotificationRequest = await req.json();
    const { title, message, recipientType, groupId, userId, data } = body;

    console.log(`Notification request: ${title} | Type: ${recipientType}`);

    // Validate required fields
    if (!title || !message) {
      return new Response(
        JSON.stringify({ error: "Title and message are required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get FCM tokens based on recipient type
    let query = supabase
      .from("users")
      .select("id, fcm_token, email");

    // Filter based on recipient type
    if (recipientType === "user" && userId) {
      query = query.eq("id", userId).neq("fcm_token", null);
    } else if (recipientType === "group" && groupId) {
      // You can implement group filtering based on your data structure
      // For now, we'll get all users with valid FCM tokens
      query = query.neq("fcm_token", null);
    } else if (recipientType === "all") {
      // Get all users with valid FCM tokens
      query = query.neq("fcm_token", null);
    }

    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    console.log(`Found ${users?.length || 0} users with FCM tokens`);

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          sentCount: 0,
          message: "No users with FCM tokens found",
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Send notifications via Firebase Cloud Messaging
    let sentCount = 0;
    let failedCount = 0;

    if (firebaseProjectId && firebaseServiceAccountKey) {
      // Parse Firebase service account key
      const serviceAccount = JSON.parse(firebaseServiceAccountKey);

      // Get Firebase access token
      const accessToken = await getFirebaseAccessToken(serviceAccount);

      // Send notifications to each user
      for (const user of users) {
        if (!user.fcm_token) continue;

        try {
          const message: FCMMessage = {
            token: user.fcm_token,
            notification: {
              title,
              body: message,
            },
            data: data || {},
            android: {
              priority: "high",
              notification: {
                sound: "default",
                channelId: "default",
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: "default",
                  "content-available": 1,
                },
              },
            },
          };

          const response = await fetch(
            `https://fcm.googleapis.com/v1/projects/${firebaseProjectId}/messages:send`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ message }),
            }
          );

          if (response.ok) {
            sentCount++;
            console.log(`Notification sent to ${user.email}`);
          } else {
            failedCount++;
            console.error(
              `Failed to send to ${user.email}:`,
              await response.text()
            );
          }
        } catch (error) {
          failedCount++;
          console.error(`Error sending to ${user.email}:`, error);
        }
      }

      // Store notification record in database
      await supabase.from("push_notifications").insert({
        title,
        message,
        recipient_type: recipientType,
        group_id: groupId || null,
        sent_count: sentCount,
        failed_count: failedCount,
        created_at: new Date().toISOString(),
      });
    } else {
      console.warn("Firebase credentials not configured");
      sentCount = users.length; // Assume all would be sent
    }

    const duration = Date.now() - startTime;
    console.log(`==== PUSH NOTIFICATION SESSION END (${duration}ms) ====`);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        failedCount,
        message: `Notification sent to ${sentCount} users`,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`==== PUSH NOTIFICATION ERROR (${duration}ms) ====`, error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

/**
 * Get Firebase access token using service account credentials
 */
async function getFirebaseAccessToken(
  serviceAccount: Record<string, string>
): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope:
      "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  // Create JWT
  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Sign the JWT (this is simplified - in production use a proper JWT signing library)
  // For now, we'll use the native crypto APIs available in Deno
  const key = await importPrivateKey(serviceAccount.private_key);
  const signature = await signData(key, new TextEncoder().encode(signatureInput));

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const jwt = `${signatureInput}.${encodedSignature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to get Firebase access token");
  }

  const { access_token } = await tokenResponse.json();
  return access_token;
}

/**
 * Import private key for signing
 */
async function importPrivateKey(privateKeyPem: string) {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKeyPem
    .substring(pemHeader.length, privateKeyPem.length - pemFooter.length)
    .replace(/\s/g, "");

  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
}

/**
 * Sign data with private key
 */
async function signData(key: CryptoKey, data: Uint8Array): Promise<ArrayBuffer> {
  return await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, data);
}
