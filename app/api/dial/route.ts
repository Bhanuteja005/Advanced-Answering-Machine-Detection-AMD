/**
 * POST /api/dial
 * Initiates an outbound call with AMD detection
 * Supports multiple AMD strategies: twilio, huggingface, gemini, jambonz
 */
import { NextRequest, NextResponse } from 'next/server';
import { twilioClient, TWILIO_FROM_NUMBER } from '@/lib/twilioClient';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth.helpers';
import { dialRequestSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';
import { detectWithGemini } from '@/lib/geminiAMD';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = dialRequestSchema.parse(body);

    if (!twilioClient || !TWILIO_FROM_NUMBER) {
      return NextResponse.json(
        { error: 'Twilio is not configured' },
        { status: 503 }
      );
    }

    // Create initial call log
    const callLog = await prisma.callLog.create({
      data: {
        userId: user.id,
        phone: validatedData.phone,
        strategy: validatedData.strategy,
        status: 'pending',
      },
    });

    logger.info('Creating call', {
      callLogId: callLog.id,
      userId: user.id,
      phone: validatedData.phone,
      strategy: validatedData.strategy,
    });

    // Get base URL for webhook callbacks
    const hostHeader = request.headers.get('x-forwarded-host') || 
                       request.headers.get('host') || 
                       'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    // Determine if we're using a public URL or localhost
    const isLocalhost = hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1');
    
    // Strategy-specific handling
    switch (validatedData.strategy) {
      case 'twilio-stream': {
        // Strategy #1A: Twilio with Real-time Media Streams
        logger.info('Using Twilio Media Streams for real-time AMD');
        
        // For Media Streams, we MUST have a public URL
        if (!process.env.TWILIO_CALLBACK_BASE_URL || isLocalhost) {
          return NextResponse.json(
            { error: 'Media Streams requires a public URL. Please deploy or use ngrok/cloudflared.' },
            { status: 400 }
          );
        }

        const baseUrl = process.env.TWILIO_CALLBACK_BASE_URL.replace(/^https?:\/\//, '');
        const streamUrl = `wss://${baseUrl}/api/media-stream`;
        const twimlUrl = `${protocol}://${baseUrl}/api/twiml/stream-call`;
        
        const callParams: any = {
          to: validatedData.phone,
          from: TWILIO_FROM_NUMBER,
          url: twimlUrl,
          statusCallback: `${protocol}://${baseUrl}/api/webhooks/twilio/status`,
          statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
          statusCallbackMethod: 'POST',
        };

        const call = await twilioClient.calls.create(callParams);

        await prisma.callLog.update({
          where: { id: callLog.id },
          data: {
            twilioSid: call.sid,
            status: 'initiated',
          },
        });

        logger.info('Media Stream call created', { 
          callLogId: callLog.id, 
          twilioSid: call.sid,
          streamUrl,
        });

        return NextResponse.json({
          success: true,
          callLogId: callLog.id,
          twilioSid: call.sid,
          strategy: 'twilio-stream',
          streamEnabled: true,
        });
      }

      case 'twilio': {
        // Strategy #1B: Twilio Native AMD (without streaming)
        logger.info('Using Twilio Native AMD strategy');
        
        let callParams: any = {
          to: validatedData.phone,
          from: TWILIO_FROM_NUMBER,
          machineDetection: 'DetectMessageEnd',
          machineDetectionTimeout: 30,
        };

        // If using ngrok or production, use URL callback
        if (process.env.TWILIO_CALLBACK_BASE_URL && !isLocalhost) {
          const baseUrl = process.env.TWILIO_CALLBACK_BASE_URL.replace(/^https?:\/\//, '');
          const webhookUrl = `${protocol}://${baseUrl}/api/webhooks/twilio/status`;
          const twimlUrl = `${protocol}://${baseUrl}/api/twiml/handle-call`;
          
          callParams.statusCallback = webhookUrl;
          callParams.statusCallbackEvent = ['initiated', 'ringing', 'answered', 'completed'];
          callParams.statusCallbackMethod = 'POST';
          callParams.url = twimlUrl;
          
          logger.info('Using public URLs', { webhookUrl, twimlUrl });
        } else {
          // For localhost, use inline TwiML with longer audio for better AMD detection
          callParams.twiml = `<Response>
<Say>Hello, this is a test call from our answering machine detection system.</Say>
<Pause length="2"/>
<Say>We are testing voice detection capabilities to determine if this call is answered by a human or a machine.</Say>
<Pause length="1"/>
<Say>Please press any key to continue, or simply stay on the line for a few more seconds.</Say>
<Pause length="3"/>
<Say>Thank you for your patience. This test call will now end. Goodbye and have a great day.</Say>
</Response>`;
          logger.info('Using inline TwiML for localhost development', { isLocalhost });
        }

        // Initiate Twilio call
        const call = await twilioClient.calls.create(callParams);

        // Update call log with Twilio SID
        await prisma.callLog.update({
          where: { id: callLog.id },
          data: {
            twilioSid: call.sid,
            status: 'initiated',
          },
        });

        logger.info('Twilio call created successfully', {
          callLogId: callLog.id,
          twilioSid: call.sid,
        });

        // If using localhost (no webhooks), start polling for status updates
        if (isLocalhost) {
          logger.info('Starting background polling for localhost call', { twilioSid: call.sid });
          // Dynamic import to avoid circular dependencies
          import('@/lib/callPoller').then(({ startPolling }) => {
            startPolling(call.sid, callLog.id);
          });
        }

        return NextResponse.json({
          success: true,
          callLogId: callLog.id,
          twilioSid: call.sid,
          strategy: 'twilio',
          pollingEnabled: isLocalhost,
        });
      }

      case 'huggingface': {
        // Strategy #2: Hugging Face (Python Service)
        logger.info('Using Hugging Face AMD strategy');
        
        const hfServiceUrl = process.env.HUGGINGFACE_SERVICE_URL || 'http://localhost:8000';
        
        // Check if service is available
        try {
          const healthCheck = await fetch(`${hfServiceUrl}/health`, { 
            signal: AbortSignal.timeout(2000) 
          });
          if (!healthCheck.ok) {
            throw new Error('Hugging Face service not available');
          }
        } catch (error) {
          logger.error('Hugging Face service health check failed', { error });
          return NextResponse.json(
            { 
              error: 'Hugging Face service not available',
              message: 'Please ensure the Python AMD service is running on port 8000',
              command: 'python amd-service/main_simple.py'
            },
            { status: 503 }
          );
        }

        // Create call with longer audio for better analysis
        let callParams: any = {
          to: validatedData.phone,
          from: TWILIO_FROM_NUMBER,
          record: true, // Enable recording for analysis
        };

        if (process.env.TWILIO_CALLBACK_BASE_URL && !isLocalhost) {
          const baseUrl = process.env.TWILIO_CALLBACK_BASE_URL.replace(/^https?:\/\//, '');
          const webhookUrl = `${protocol}://${baseUrl}/api/webhooks/twilio/status`;
          const recordingUrl = `${protocol}://${baseUrl}/api/webhooks/twilio/recording`;
          const twimlUrl = `${protocol}://${baseUrl}/api/twiml/handle-call`;
          
          callParams.statusCallback = webhookUrl;
          callParams.statusCallbackEvent = ['initiated', 'ringing', 'answered', 'completed'];
          callParams.statusCallbackMethod = 'POST';
          callParams.recordingStatusCallback = recordingUrl;
          callParams.url = twimlUrl;
        } else {
          // Longer audio for better Hugging Face analysis
          callParams.twiml = `<Response>
<Say>Hello, this is a test call from our answering machine detection system using Hugging Face technology.</Say>
<Pause length="2"/>
<Say>We are recording this conversation to analyze voice patterns and determine if this is a human or automated response.</Say>
<Pause length="1"/>
<Say>Please feel free to respond, or simply stay on the line.</Say>
<Pause length="3"/>
<Say>Thank you for your time. This recording will now be analyzed. Goodbye.</Say>
</Response>`;
        }

        const call = await twilioClient.calls.create(callParams);

        await prisma.callLog.update({
          where: { id: callLog.id },
          data: {
            twilioSid: call.sid,
            status: 'initiated',
          },
        });

        logger.info('Hugging Face AMD call created', {
          callLogId: callLog.id,
          twilioSid: call.sid,
        });

        // Start polling for status updates (like Twilio strategy)
        if (isLocalhost) {
          logger.info('Starting background polling for Hugging Face call', { twilioSid: call.sid });
          import('@/lib/callPoller').then(({ startPolling }) => {
            startPolling(call.sid, callLog.id);
          });
        }

        return NextResponse.json({
          success: true,
          callLogId: callLog.id,
          twilioSid: call.sid,
          strategy: 'huggingface',
          pollingEnabled: isLocalhost,
          message: 'Call initiated. Recording will be analyzed by Hugging Face service.',
        });
      }

      case 'gemini': {
        // Strategy #3: Google Gemini Flash
        logger.info('Using Gemini Flash AMD strategy');
        
        if (!process.env.GEMINI_API_KEY) {
          return NextResponse.json(
            { 
              error: 'Gemini API not configured',
              message: 'Please add GEMINI_API_KEY to your .env file'
            },
            { status: 503 }
          );
        }

        // Create call with recording for Gemini analysis
        let callParams: any = {
          to: validatedData.phone,
          from: TWILIO_FROM_NUMBER,
          record: true, // Enable recording for Gemini analysis
        };

        if (process.env.TWILIO_CALLBACK_BASE_URL && !isLocalhost) {
          const baseUrl = process.env.TWILIO_CALLBACK_BASE_URL.replace(/^https?:\/\//, '');
          const webhookUrl = `${protocol}://${baseUrl}/api/webhooks/twilio/status`;
          const recordingUrl = `${protocol}://${baseUrl}/api/webhooks/twilio/recording`;
          const twimlUrl = `${protocol}://${baseUrl}/api/twiml/handle-call`;
          
          callParams.statusCallback = webhookUrl;
          callParams.statusCallbackEvent = ['initiated', 'ringing', 'answered', 'completed'];
          callParams.statusCallbackMethod = 'POST';
          callParams.recordingStatusCallback = recordingUrl;
          callParams.url = twimlUrl;
        } else {
          // Longer audio for better Gemini analysis
          callParams.twiml = `<Response>
<Say>Hello, this is a test call from our answering machine detection system powered by Google Gemini artificial intelligence.</Say>
<Pause length="2"/>
<Say>We are analyzing this conversation using advanced AI to determine the nature of this call and whether it has been answered by a person or an automated system.</Say>
<Pause length="1"/>
<Say>You may respond if you wish, or simply remain on the line for a moment.</Say>
<Pause length="3"/>
<Say>Thank you for participating in this test. The recording will now be processed by our AI system. Have a wonderful day, goodbye.</Say>
</Response>`;
        }

        const call = await twilioClient.calls.create(callParams);

        await prisma.callLog.update({
          where: { id: callLog.id },
          data: {
            twilioSid: call.sid,
            status: 'initiated',
          },
        });

        logger.info('Gemini AMD call created', {
          callLogId: callLog.id,
          twilioSid: call.sid,
        });

        // Start polling for status updates and trigger analysis after completion
        if (isLocalhost) {
          logger.info('Starting background polling for Gemini call', { twilioSid: call.sid });
          import('@/lib/callPoller').then(({ startPolling }) => {
            startPolling(call.sid, callLog.id);
          });
        }

        return NextResponse.json({
          success: true,
          callLogId: callLog.id,
          twilioSid: call.sid,
          strategy: 'gemini',
          pollingEnabled: isLocalhost,
          message: 'Call initiated. Recording will be analyzed by Gemini Flash AI.',
        });
      }

      case 'jambonz': {
        // Strategy #4: Jambonz SIP AMD
        logger.info('Using Jambonz SIP AMD strategy');
        
        const jambonzAccountSid = process.env.JAMBONZ_ACCOUNT_SID;
        const jambonzApiKey = process.env.JAMBONZ_API_KEY;
        const jambonzRestApiUrl = process.env.JAMBONZ_REST_API_URL;
        const jambonzSipDomain = process.env.JAMBONZ_SIP_DOMAIN;
        
        if (!jambonzAccountSid || !jambonzApiKey || !jambonzRestApiUrl || !jambonzSipDomain) {
          return NextResponse.json(
            { 
              error: 'Jambonz not configured',
              message: 'Missing Jambonz credentials. Check JAMBONZ_ACCOUNT_SID, JAMBONZ_API_KEY, JAMBONZ_REST_API_URL, and JAMBONZ_SIP_DOMAIN environment variables.',
              required: {
                JAMBONZ_ACCOUNT_SID: !!jambonzAccountSid,
                JAMBONZ_API_KEY: !!jambonzApiKey,
                JAMBONZ_REST_API_URL: !!jambonzRestApiUrl,
                JAMBONZ_SIP_DOMAIN: !!jambonzSipDomain,
              }
            },
            { status: 503 }
          );
        }

        try {
          // Check if Application SID is configured
          const jambonzApplicationSid = process.env.JAMBONZ_APPLICATION_SID;
          
          if (!jambonzApplicationSid) {
            return NextResponse.json(
              { 
                error: 'Jambonz Application not configured',
                message: 'You need to create an Application in Jambonz Console and set JAMBONZ_APPLICATION_SID in your .env file.',
                steps: [
                  '1. Go to https://portal.jambonz.cloud/applications',
                  '2. Create a new Application',
                  '3. Copy the Application SID',
                  '4. Add JAMBONZ_APPLICATION_SID=your-app-sid to .env',
                  '5. Restart your server'
                ]
              },
              { status: 503 }
            );
          }
          
          // Determine webhook URL
          const baseUrl = process.env.TWILIO_CALLBACK_BASE_URL || `${protocol}://${hostHeader}`;
          const webhookUrl = `${baseUrl}/api/webhooks/jambonz/call`;
          
          // Create Jambonz call using REST API
          // Using the correct Jambonz API format
          const jambonzCallData = {
            application_sid: jambonzApplicationSid,
            from: TWILIO_FROM_NUMBER, // Your DID number
            to: {
              type: 'phone',
              number: validatedData.phone
            },
            call_hook: {
              url: webhookUrl,
              method: 'POST'
            },
            tag: {
              callLogId: callLog.id,
              userId: user.id,
              strategy: 'jambonz'
            }
          };

          logger.info('Creating Jambonz call', { 
            url: `${jambonzRestApiUrl}/v1/Accounts/${jambonzAccountSid}/Calls`,
            webhookUrl,
            phone: validatedData.phone,
            applicationSid: jambonzApplicationSid
          });

          const jambonzResponse = await fetch(
            `${jambonzRestApiUrl}/v1/Accounts/${jambonzAccountSid}/Calls`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${jambonzApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(jambonzCallData),
            }
          );

          if (!jambonzResponse.ok) {
            const errorData = await jambonzResponse.text();
            logger.error('Jambonz API error', { 
              status: jambonzResponse.status, 
              error: errorData 
            });
            return NextResponse.json(
              { 
                error: 'Jambonz call failed',
                message: `Failed to create Jambonz call: ${jambonzResponse.statusText}`,
                details: errorData
              },
              { status: jambonzResponse.status }
            );
          }

          const callData = await jambonzResponse.json();
          const callSid = callData.sid || callData.call_sid;

          // Update call log
          await prisma.callLog.update({
            where: { id: callLog.id },
            data: {
              twilioSid: callSid,
              status: 'initiated',
            },
          });

          logger.info('Jambonz call created successfully', {
            callLogId: callLog.id,
            callSid,
          });

          return NextResponse.json({
            success: true,
            callLogId: callLog.id,
            callSid,
            strategy: 'jambonz',
            message: 'Call initiated via Jambonz SIP. AMD detection will be performed by Jambonz.',
          });

        } catch (error) {
          logger.error('Jambonz error', { error });
          return NextResponse.json(
            { 
              error: 'Jambonz error',
              message: error instanceof Error ? error.message : 'Unknown error creating Jambonz call'
            },
            { status: 500 }
          );
        }
      }

      default: {
        return NextResponse.json(
          { error: 'Invalid AMD strategy' },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn('Validation error', { errors: error.issues });
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle Twilio-specific errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error creating call', { error: errorMessage });

    // Check for trial account verification error
    if (errorMessage.includes('unverified') || errorMessage.includes('Trial accounts')) {
      return NextResponse.json(
        { 
          error: 'Phone number not verified',
          message: 'This phone number must be verified in your Twilio account. Visit https://console.twilio.com/us1/develop/phone-numbers/manage/verified to add it.',
          twilioError: errorMessage
        },
        { status: 400 }
      );
    }

    // Check for invalid phone number
    if (errorMessage.includes('not a valid phone number') || errorMessage.includes('Invalid parameter')) {
      return NextResponse.json(
        { 
          error: 'Invalid phone number',
          message: 'Phone number must be in E.164 format (e.g., +917386836602)',
          twilioError: errorMessage
        },
        { status: 400 }
      );
    }

    // Generic Twilio error
    if (errorMessage.includes('Twilio')) {
      return NextResponse.json(
        { 
          error: 'Twilio error',
          message: errorMessage
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}
