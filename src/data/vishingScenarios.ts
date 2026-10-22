import { VishingScenario } from '../types';

export const VISHING_SCENARIOS: VishingScenario[] = [
  {
    id: 'vish-otp-fraud',
    title: 'Bank Fraud Alert: Urgent OTP Request to "Block Wire"',
    callerName: 'Chase Fraud Prevention Dept (Spoofed)',
    spoofedCallerId: '+1 (800) 935-9935',
    callerRole: 'Senior Fraud Investigator "David Miller"',
    attackVector: 'OTP Theft',
    scenarioContext:
      'Your phone rings displaying your bank\'s actual 1-800 toll-free customer service number (caller ID spoofed). The caller sounds polite, professional, and urgent, with simulated call-center background chatter.',
    goldenTakeaway:
      'RULE OF THUMB: Banks and legitimate services NEVER ask for your One-Time Password (OTP) or authentication codes over the phone. The SMS itself states: "DO NOT SHARE THIS CODE WITH ANYONE, INCLUDING BANK EMPLOYEES."',
    rootNodeId: 'node-1',
    dialogueTree: {
      'node-1': {
        id: 'node-1',
        callerStatement:
          '"Hello, this is David from Chase Fraud Protection. We detected an urgent unauthorized wire attempt for $3,850 to an offshore account in Eastern Europe from your checking account. Did you authorize this transaction?"',
        psychologicalTrigger: 'Fear',
        options: [
          {
            text: '"No! Absolutely not! Please block that immediately!"',
            isSafeResponse: true,
            feedback: 'Natural reaction, but stay alert: attackers exploit panic to bypass critical reasoning.',
            scoreDelta: 0,
            nextNodeId: 'node-2',
          },
          {
            text: '"Wait, who are you? I will hang up and call the number printed on my debit card."',
            isSafeResponse: true,
            feedback: 'Flawless instinct! Never trust inbound caller ID as numbers can be effortlessly spoofed.',
            scoreDelta: 50,
            nextNodeId: 'node-hangup-win',
          },
        ],
      },
      'node-2': {
        id: 'node-2',
        callerStatement:
          '"Understood. I am initiating an emergency transaction cancellation right now. To verify your identity and authorize the refund hold, our automated system has just texted a 6-digit security passkey to your mobile phone. Please read those 6 digits to me immediately before the wire clears the federal clearinghouse."',
        psychologicalTrigger: 'Urgency',
        options: [
          {
            text: '"Sure, let me read you the code from my screen: 8 4 9 2 0 1."',
            isSafeResponse: false,
            feedback:
              'CRITICAL MISTAKE: You just gave the attacker the OTP they needed to authorize the fraudulent transfer or reset your banking password! The text explicitly warned: "Chase will NEVER call to ask for this code."',
            scoreDelta: -100,
            nextNodeId: 'node-fail-compromised',
          },
          {
            text: '"The text message says: "DO NOT SHARE THIS CODE WITH ANYONE, NOT EVEN A REPRESENTATIVE". Why do you need it?"',
            isSafeResponse: true,
            feedback:
              'Excellent vigilance! Pointing out the warning in the SMS puts the fraudster on defense.',
            scoreDelta: 30,
            nextNodeId: 'node-3',
          },
          {
            text: '"I will not share any verification codes. I am hanging up now to call the fraud department directly."',
            isSafeResponse: true,
            feedback:
              'Perfect defensive response. Ending the call immediately severs the social engineering vector.',
            scoreDelta: 50,
            nextNodeId: 'node-hangup-win',
          },
        ],
      },
      'node-3': {
        id: 'node-3',
        callerStatement:
          '"Sir/Ma\'am, that warning is for public scams! Because I am an internal tier-3 security officer processing the active block, my terminal requires the secondary verification token. If you do not provide it within the next 45 seconds, the wire will finalize and you will lose liability protection!"',
        psychologicalTrigger: 'Authority',
        options: [
          {
            text: '"Okay, okay, don\'t cancel my protection! The code is 849201."',
            isSafeResponse: false,
            feedback:
              'FAILED: High-pressure intimidation and false authority were used to break your boundary. The fraudster stole your funds.',
            scoreDelta: -100,
            nextNodeId: 'node-fail-compromised',
          },
          {
            text: '"No legitimate bank representative threatens customers with loss of liability for following security instructions. Goodbye."',
            isSafeResponse: true,
            feedback:
              'OUTSTANDING! You successfully identified high-pressure coercion, refused to surrender the OTP, and terminated the threat.',
            scoreDelta: 60,
            nextNodeId: 'node-hangup-win',
          },
        ],
      },
      'node-fail-compromised': {
        id: 'node-fail-compromised',
        callerStatement:
          '"[Call Disconnected immediately]... You check your banking app: $3,850 was just debited. The attacker logged in using your phone number and the OTP you read to them."',
        psychologicalTrigger: 'Fear',
        options: [],
      },
      'node-hangup-win': {
        id: 'node-hangup-win',
        callerStatement:
          '"You hung up and called Chase directly via the official phone number on your card. The genuine representative confirms: there was NO pending wire, and your account is secure. The previous caller was a vishing scammer attempting to steal your 2FA token!"',
        psychologicalTrigger: 'Scarcity',
        options: [],
      },
    },
  },
  {
    id: 'vish-it-atm-pin',
    title: 'Enterprise IT Helpdesk: Requesting ATM PIN / Master Smartcard Token',
    callerName: 'Corporate Tech Support Desk',
    spoofedCallerId: '+1 (415) 555-0199 (Internal Ext. 4040)',
    callerRole: 'Helpdesk Tier-2 "Alex Reed"',
    attackVector: 'ATM PIN & Wire Fraud',
    scenarioContext:
      'You receive a morning call from an internal PBX extension. The caller claims to be from corporate IT deploying a security patch to all employee corporate credit/debit smartcards and hardware tokens.',
    goldenTakeaway:
      'RULE OF THUMB: Your PIN (Personal Identification Number) is known ONLY to you. No IT department, bank teller, or executive ever has a legitimate operational need to know your PIN.',
    rootNodeId: 'node-pin-1',
    dialogueTree: {
      'node-pin-1': {
        id: 'node-pin-1',
        callerStatement:
          '"Hey there! This is Alex from Global IT Operations. We are pushing the mandatory firmware update to all corporate banking cards and physical BitLocker tokens. I have your hardware profile on my screen, but to sync the cryptographic chip, I need you to confirm your 4-digit card PIN."',
        psychologicalTrigger: 'Authority',
        options: [
          {
            text: '"Wait, why would IT ever need my card PIN? That is strictly confidential."',
            isSafeResponse: true,
            feedback: 'Rock solid security hygiene! PINs should never be disclosed under any pretext.',
            scoreDelta: 40,
            nextNodeId: 'node-pin-2',
          },
          {
            text: '"Oh sure, the PIN for my corporate card is 4912."',
            isSafeResponse: false,
            feedback: 'FATAL: You shared your secret PIN. The attacker can now clone your chip or withdraw cash.',
            scoreDelta: -100,
            nextNodeId: 'node-pin-fail',
          },
          {
            text: '"What is your ServiceNow IT change ticket number? I will verify this with the CISO office."',
            isSafeResponse: true,
            feedback: 'Excellent corporate verification procedure! Scammers crumble under audit questions.',
            scoreDelta: 50,
            nextNodeId: 'node-pin-win',
          },
        ],
      },
      'node-pin-2': {
        id: 'node-pin-2',
        callerStatement:
          '"Look, I know security policy seems strict, but the new chip reader uses hashed key verification. If I don\'t finish this batch before 11:00 AM, your card will be flagged as delinquent and frozen by accounting during your next expense submission."',
        psychologicalTrigger: 'Urgency',
        options: [
          {
            text: '"I am not comfortable sharing that. I will come down to the physical IT helpdesk in person."',
            isSafeResponse: true,
            feedback: 'In-person verification or known-channel verification completely neutralizes remote impersonation.',
            scoreDelta: 50,
            nextNodeId: 'node-pin-win',
          },
          {
            text: '"I can\'t afford to have my card frozen. Fine, the PIN is 4912, but please make it quick."',
            isSafeResponse: false,
            feedback: 'Compromised! Fear of inconvenience is a premier social engineering tactic.',
            scoreDelta: -100,
            nextNodeId: 'node-pin-fail',
          },
        ],
      },
      'node-pin-fail': {
        id: 'node-pin-fail',
        callerStatement:
          '"[Call Terminated] You notice an unauthorized ATM cash withdrawal of $1,000 against your corporate expense card. IT confirms no employee named Alex Reed works in support."',
        psychologicalTrigger: 'Fear',
        options: [],
      },
      'node-pin-win': {
        id: 'node-pin-win',
        callerStatement:
          '"The caller abruptly hangs up when you demand a ticket number. You report the incident to the SOC: threat blocked and security incident ticket logged!"',
        psychologicalTrigger: 'Authority',
        options: [],
      },
    },
  },
  {
    id: 'vish-cfo-wire-urgent',
    title: 'Executive Emergency: Demanding Immediate Supplier Wire',
    callerName: 'C-Suite Executive Voice',
    spoofedCallerId: '+1 (212) 555-8821 (CEO Mobile)',
    callerRole: 'Chief Executive Officer (AI Cloned Voice)',
    attackVector: 'ATM PIN & Wire Fraud',
    scenarioContext:
      'A voice sounding eerily like your CEO calls you directly on your cell. They sound rushed, agitated, and claim to be at an airport gate boarding a flight.',
    goldenTakeaway:
      'RULE OF THUMB: Out-of-band dual-authorization is mandatory for all funds transfers. Never execute financial transactions or purchase prepaid gift cards based solely on an unsolicited voice call.',
    rootNodeId: 'node-cfo-1',
    dialogueTree: {
      'node-cfo-1': {
        id: 'node-cfo-1',
        callerStatement:
          '"Hey! I need your help right now. I am stepping onto a plane to Zurich and our legal retainer was declined because of an expired corporate card. I need you to execute an immediate $15,000 emergency wire to this account right now. Can I count on you to get this done in the next 10 minutes?"',
        psychologicalTrigger: 'Authority',
        options: [
          {
            text: '"Of course! Let me get the account details and I will process it immediately."',
            isSafeResponse: false,
            feedback:
              'FAILED: You bypassed company dual-control finance policy. Deepfake audio and CEO impersonation are responsible for hundreds of millions in BEC losses.',
            scoreDelta: -100,
            nextNodeId: 'node-cfo-fail',
          },
          {
            text: '"Under our corporate treasury controls, all wire requests require secondary dual-signoff via our encrypted Slack channel or ERP system. I cannot wire funds over a phone call."',
            isSafeResponse: true,
            feedback:
              'MASTERCLASS: Upholding policy regardless of perceived executive pressure is the golden hallmark of operational security.',
            scoreDelta: 60,
            nextNodeId: 'node-cfo-win',
          },
        ],
      },
      'node-cfo-fail': {
        id: 'node-cfo-fail',
        callerStatement:
          '"$15,000 was wired to an unrecoverable mule account. Later that afternoon, the real CEO steps out of their office down the hall—they were never in Zurich."',
        psychologicalTrigger: 'Fear',
        options: [],
      },
      'node-cfo-win': {
        id: 'node-cfo-win',
        callerStatement:
          '"The caller curses and hangs up. You alert the CFO and Security Director, who issue a company-wide BEC / Voice Cloning advisory. You are commended for stopping financial theft!"',
        psychologicalTrigger: 'Authority',
        options: [],
      },
    },
  },
];
