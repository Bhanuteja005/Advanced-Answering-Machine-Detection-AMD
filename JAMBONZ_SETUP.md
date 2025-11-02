# 🎯 Jambonz SIP AMD Setup Guide

## What is Jambonz?

Jambonz is an open-source CPaaS (Communications Platform as a Service) that provides SIP-based communications with built-in AMD capabilities. It offers real-time answering machine detection through SIP protocols.

## Why Use Jambonz?

- ✅ **Real-time AMD** via SIP signaling
- ✅ **Lower cost** than Twilio for high volume
- ✅ **Self-hosted option** available
- ✅ **Built-in AMD** without additional processing
- ✅ **WebRTC support** for browser-based calls

## Prerequisites

Before using the Jambonz strategy, you need:

1. **Jambonz Account** (Cloud or Self-hosted)
2. **SIP Credentials** from Jambonz
3. **API Key** for making calls
4. **SIP Trunk** configured for outbound calls

## Option 1: Jambonz Cloud (Easiest)

### Step 1: Sign Up
1. Go to: https://jambonz.cloud (if available) or https://jambonz.org
2. Create account
3. Verify email

### Step 2: Get Credentials
1. Navigate to **Settings** → **API Keys**
2. Create new API key
3. Copy:
   - API Key
   - Account SID
   - Application SID

### Step 3: Configure SIP Trunk
1. Go to **Carriers** → **Add Carrier**
2. Configure outbound trunk
3. Get SIP credentials:
   - SIP Domain
   - Username
   - Password

### Step 4: Add to .env
```env
# Jambonz Configuration
JAMBONZ_API_KEY=your_api_key_here
JAMBONZ_ACCOUNT_SID=your_account_sid
JAMBONZ_APPLICATION_SID=your_app_sid
JAMBONZ_REST_API_URL=https://api.jambonz.cloud
JAMBONZ_SIP_DOMAIN=sip.jambonz.cloud
```

## Option 2: Self-Hosted Jambonz

### Requirements
- **Linux Server** (Ubuntu 20.04+ recommended)
- **4GB RAM** minimum
- **2 CPU cores** minimum
- **Public IP** address
- **Domain name** with DNS configured

### Quick Install
```bash
# Install Jambonz
curl -O https://raw.githubusercontent.com/jambonz/jambonz-infrastructure/main/install.sh
chmod +x install.sh
./install.sh

# Configure
sudo jambonz-config

# Start services
sudo systemctl start jambonz
```

### Get Credentials
```bash
# Get API credentials
sudo jambonz-cli show-credentials

# Add to your .env
```

## Implementation in Code

### Current Implementation
The Jambonz strategy is currently a **placeholder** in `app/api/dial/route.ts`:

```typescript
case 'jambonz': {
  return NextResponse.json(
    { 
      error: 'Jambonz SIP AMD requires account setup',
      message: 'See documentation for Jambonz setup details',
    },
    { status: 400 }
  );
}
```

### To Enable Jambonz:

1. **Install Jambonz SDK**
```bash
npm install @jambonz/node-client
```

2. **Create Jambonz Client** (`lib/jambonzClient.ts`)
```typescript
import { RestClient } from '@jambonz/node-client';

export const jambonzClient = process.env.JAMBONZ_API_KEY
  ? new RestClient({
      account_sid: process.env.JAMBONZ_ACCOUNT_SID!,
      api_key: process.env.JAMBONZ_API_KEY!,
      base_url: process.env.JAMBONZ_REST_API_URL || 'https://api.jambonz.cloud',
    })
  : null;
```

3. **Implement in dial route**
```typescript
case 'jambonz': {
  if (!jambonzClient) {
    return NextResponse.json(
      { error: 'Jambonz not configured' },
      { status: 503 }
    );
  }

  // Create Jambonz call with AMD
  const call = await jambonzClient.calls.create({
    to: validatedData.phone,
    from: process.env.JAMBONZ_FROM_NUMBER,
    application_sid: process.env.JAMBONZ_APPLICATION_SID,
    call_hook: {
      url: `${baseUrl}/api/webhooks/jambonz/call`,
      method: 'POST',
    },
    amd: {
      enable: true,
      actionHook: `${baseUrl}/api/webhooks/jambonz/amd`,
    },
  });

  // Create call log
  await prisma.callLog.create({
    data: {
      userId: user.id,
      phone: validatedData.phone,
      strategy: 'jambonz',
      twilioSid: call.sid, // Store Jambonz call SID
      status: 'initiated',
    },
  });

  return NextResponse.json({
    success: true,
    callSid: call.sid,
    strategy: 'jambonz',
  });
}
```

4. **Create Webhook Handler** (`app/api/webhooks/jambonz/amd/route.ts`)
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Jambonz AMD result format
  const { call_sid, amd_result, confidence } = body;
  
  // Update database
  await prisma.callLog.updateMany({
    where: { twilioSid: call_sid },
    data: {
      amdResult: amd_result, // 'human' or 'machine'
      confidence: confidence / 100, // Convert to 0-1 range
      status: 'completed',
    },
  });
  
  return NextResponse.json({ ok: true });
}
```

## AMD Detection with Jambonz

### AMD Configuration Options
```typescript
amd: {
  enable: true,
  timeout: 5000,              // Max wait time (ms)
  threshold: 2400,            // Machine detection threshold
  silenceTimeout: 5000,       // Silence detection
  machineWords: 10,           // Min words for machine
  machineWordsThreshold: 0.8, // Confidence threshold
  actionHook: webhook_url,    // Results callback
}
```

### AMD Results Format
Jambonz returns:
```json
{
  "call_sid": "abc123",
  "amd_result": "human",  // or "machine", "unknown"
  "confidence": 85,        // 0-100
  "speech_detected": true,
  "silence_duration": 1200,
  "words_detected": 5
}
```

## Cost Comparison

| Provider | AMD Detection | Cost per Minute | Setup |
|----------|--------------|-----------------|--------|
| **Twilio Native** | ✅ Built-in | $0.0130 | ✅ Easy |
| **Twilio Streams** | ✅ Real-time | $0.0140 | ✅ Easy |
| **Jambonz Cloud** | ✅ Built-in | $0.0050-0.0080 | ⚠️ Medium |
| **Jambonz Self-hosted** | ✅ Built-in | Server cost only | ❌ Complex |

## Pros & Cons

### Pros
- ✅ **Lower cost** for high volume (60% cheaper than Twilio)
- ✅ **Real-time AMD** via SIP
- ✅ **Self-hosted option** for complete control
- ✅ **No AI processing needed** (built-in)
- ✅ **WebRTC support**

### Cons
- ❌ **Requires SIP knowledge**
- ❌ **More complex setup**
- ❌ **Less documentation** than Twilio
- ❌ **Self-hosting requires DevOps**
- ❌ **Smaller community**

## When to Use Jambonz

**Use Jambonz if:**
- 📞 Making **high volume** calls (10,000+/month)
- 💰 Need **lower costs** than Twilio
- 🏗️ Want **self-hosted** solution
- 🔧 Have **DevOps resources**
- 🌐 Need **international calling** at lower rates

**Stick with Twilio if:**
- 📱 Low to medium volume (< 10,000/month)
- ⚡ Need quick setup
- 🎯 Want proven reliability
- 📚 Prefer extensive documentation

## Alternative: Skip Jambonz

If you don't need Jambonz, you can **remove it from the UI**:

### Remove from DialForm Component
Edit `components/DialForm.tsx`:

```typescript
// Remove Jambonz option
const strategies = [
  { value: 'twilio-stream', label: '🌊 Twilio + Media Streams' },
  { value: 'twilio', label: '1️⃣ Twilio Native AMD' },
  { value: 'huggingface', label: '2️⃣ Hugging Face' },
  { value: 'gemini', label: '3️⃣ Google Gemini Flash' },
  // { value: 'jambonz', label: '4️⃣ Jambonz SIP AMD' }, // Removed
];
```

## Resources

- **Jambonz Docs**: https://docs.jambonz.org
- **GitHub**: https://github.com/jambonz/jambonz
- **Community**: https://jambonz.discourse.group
- **API Reference**: https://api.jambonz.org

## Summary

**Jambonz is optional** for this project. It's best suited for:
- High volume operations
- Cost-sensitive deployments
- Self-hosting requirements

**For most users**, the existing strategies are sufficient:
- ✅ **Twilio Native** - Simple, reliable (30s)
- ✅ **Media Streams** - Real-time (3-5s) ⚡
- ✅ **Gemini** - AI-powered (50s)
- ✅ **HuggingFace** - ML-based (45s)

**You can safely ignore Jambonz unless you need it!**
