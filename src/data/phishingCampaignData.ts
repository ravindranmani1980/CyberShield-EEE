import { PhishingCampaign, PhishingTemplate } from '../types';

export const PHISHING_TEMPLATES: PhishingTemplate[] = [
  {
    id: 'tmpl-m365-pwd',
    name: 'Microsoft 365 Password Expiration Alert',
    category: 'Credential Harvest',
    subject: 'URGENT: Your Corporate Password Expires in 2 Hours',
    senderName: 'Microsoft Online Support',
    senderAddress: 'notification@account-micros0ft-security.com',
    targetLandingBait: 'https://login.micros0ft-portal.auth-sync.xyz/login',
    bodyHtml: `<p>Dear User,</p>
<p>Your corporate enterprise single-sign-on password is scheduled to expire in <strong>120 minutes</strong> due to quarterly security policy enforcement.</p>
<p>To retain uninterrupted access to your Outlook inbox, OneDrive, and corporate VPN, you must validate your current credentials immediately.</p>
<p style="margin: 20px 0;">
  <a href="https://login.micros0ft-portal.auth-sync.xyz/login" style="background:#0078d4; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px; font-weight:bold; display:inline-block;">
    Keep Existing Password
  </a>
</p>
<p style="color:#777; font-size:12px;">This is an automated system notification. Replies to this address are unmonitored.</p>`,
    telltaleIndicators: [
      'Typosquatted domain: "micros0ft" (with number zero instead of letter o)',
      'High-risk top level domain: .xyz',
      'Artificial urgency ("expires in 2 hours") designed to bypass rational skepticism',
      'Generic greeting: "Dear User" instead of your actual corporate name',
      'Real IT password expirations never ask you to "keep existing password" via an external link',
    ],
  },
  {
    id: 'tmpl-hr-bonus',
    name: 'HR Open Enrollment & Compensation Adjustment',
    category: 'Credential Harvest',
    subject: 'Confidential: 2026 Annual Performance Bonus & Stock Allotment',
    senderName: 'Corporate HR Benefits Dept',
    senderAddress: 'benefits@internal-company-hr-portal.net',
    targetLandingBait: 'https://docusign.document-review-portal.net/auth',
    bodyHtml: `<p>Hi Team Member,</p>
<p>The Compensation Committee has finalized the Q3 performance bonus allocations and stock grant schedules. Your individualized statement is attached for confidential review.</p>
<p>Please review and sign the acknowledgement form before the payroll cutoff at 5:00 PM EST today.</p>
<p style="margin: 20px 0;">
  <a href="https://docusign.document-review-portal.net/auth" style="background:#ff5200; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px; font-weight:bold; display:inline-block;">
    Review Compensation Document
  </a>
</p>
<p style="color:#888; font-size:12px;">Human Resources Department &bull; Confidential &bull; Internal Only</p>`,
    telltaleIndicators: [
      'High emotional hook: Financial curiosity and fear of missing bonus',
      'Sender domain "internal-company-hr-portal.net" is not your real corporate domain',
      'Unrealistic deadline ("by 5:00 PM EST today") intended to rush the victim',
      'Target link redirects to an external credential harvesting phishing landing page',
    ],
  },
  {
    id: 'tmpl-cfo-wire',
    name: 'Executive Wire Transfer Request (Business Email Compromise)',
    category: 'Executive Wire Fraud',
    subject: 'Urgent Wire Settlement - Acquisition Partner Escrow',
    senderName: 'Michael Sterling (Chief Financial Officer)',
    senderAddress: 'm.sterling.cfo@corp-finance-mgmt.com',
    targetLandingBait: 'mailto:m.sterling.cfo@corp-finance-mgmt.com',
    bodyHtml: `<p>Are you at your desk right now?</p>
<p>We are closing an urgent escrow deposit for our secondary cloud infrastructure supplier to avoid SLA termination. I am currently in a closed-door board meeting and cannot take voice calls.</p>
<p>Please process an immediate domestic wire for $48,500 using the invoice attached in the link below. Reply with transaction reference as soon as initiated.</p>
<p style="margin: 20px 0;">
  <a href="https://chase.secure-wire-instructions.biz/escrow" style="background:#111; color:#00ff66; padding:10px 20px; text-decoration:none; border-radius:4px; font-weight:bold; display:inline-block;">
    View Escrow Wire Instructions ($48,500)
  </a>
</p>
<p>Sent from my iPad</p>`,
    telltaleIndicators: [
      'Classic CEO/CFO impersonation (Executive pretexting)',
      'Excuse for not taking phone calls ("in a closed-door board meeting")',
      'Circumvention of standard multi-person financial authorization controls',
      'Domain mismatch: "corp-finance-mgmt.com" rather than the enterprise official domain',
    ],
  },
  {
    id: 'tmpl-it-vpn',
    name: 'IT Emergency Security Patch: VPN & CrowdStrike',
    category: 'Urgent IT Alert',
    subject: 'ACTION REQUIRED: Zero-Day Hotfix for Enterprise VPN Client',
    senderName: 'Enterprise Global IT Helpdesk',
    senderAddress: 'helpdesk-security@it-support-tickets.org',
    targetLandingBait: 'https://vpn-patch-update.it-support-tickets.org/agent.exe',
    bodyHtml: `<p>All Staff,</p>
<p>A critical zero-day remote code execution vulnerability (CVE-2026-9812) is actively targeting unpatched workstation VPN clients.</p>
<p>Per Cyber Operations command, all workstations not updated by 18:00 will be quarantined from the corporate network.</p>
<p style="margin: 20px 0;">
  <a href="https://vpn-patch-update.it-support-tickets.org/agent.exe" style="background:#d93025; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px; font-weight:bold; display:inline-block;">
    Download Emergency Security Hotfix (.exe)
  </a>
</p>
<p style="color:#666; font-size:11px;">Ticket Ref: #SEC-98412-CRITICAL &bull; Global Operations Security</p>`,
    telltaleIndicators: [
      'Direct link urging employee to download an executable (.exe) file',
      'Threat of disciplinary / technical punishment (quarantine from corporate network)',
      'Legitimate corporate IT updates push silently via MDM (Intune, Jamf), never asking users to run manual .exe files from email links',
      'Sender address is an unverified third-party .org domain',
    ],
  },
];

export const INITIAL_CAMPAIGNS: PhishingCampaign[] = [
  {
    id: 'camp-1',
    name: 'Q3 Enterprise Credential Harvest Readiness',
    targetDepartment: 'All Staff',
    difficulty: 'Intermediate',
    templateId: 'tmpl-m365-pwd',
    status: 'Active',
    createdAt: '2026-10-15',
    metrics: {
      emailsSent: 240,
      opened: 188,
      clickedLink: 38,
      submittedCredentials: 14,
      reportedPhish: 122,
    },
  },
  {
    id: 'camp-2',
    name: 'Finance Dept Business Email Compromise (BEC) Drill',
    targetDepartment: 'Finance',
    difficulty: 'Advanced',
    templateId: 'tmpl-cfo-wire',
    status: 'Active',
    createdAt: '2026-10-18',
    metrics: {
      emailsSent: 35,
      opened: 32,
      clickedLink: 4,
      submittedCredentials: 0,
      reportedPhish: 28,
    },
  },
  {
    id: 'camp-3',
    name: 'Executive & HR Open Enrollment Phish Test',
    targetDepartment: 'HR',
    difficulty: 'Novice',
    templateId: 'tmpl-hr-bonus',
    status: 'Completed',
    createdAt: '2026-09-28',
    metrics: {
      emailsSent: 80,
      opened: 74,
      clickedLink: 18,
      submittedCredentials: 6,
      reportedPhish: 52,
    },
  },
];
