import React, { useState } from 'react';
import {
  Target,
  Plus,
  AlertOctagon,
  CheckCircle,
  Eye,
  Flag,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhishingCampaign, PhishingTemplate } from '../types';
import { INITIAL_CAMPAIGNS, PHISHING_TEMPLATES } from '../data/phishingCampaignData';

export const PhishingCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<PhishingCampaign[]>(INITIAL_CAMPAIGNS);
  const [templates] = useState<PhishingTemplate[]>(PHISHING_TEMPLATES);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(INITIAL_CAMPAIGNS[0].id);

  // New Campaign Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [targetDept, setTargetDept] = useState<
    'Finance' | 'Executive' | 'Engineering' | 'HR' | 'Sales' | 'All Staff'
  >('Finance');
  const [difficulty, setDifficulty] = useState<
    'Novice' | 'Intermediate' | 'Advanced' | 'Zero-Day Pretext'
  >('Intermediate');
  const [selectedTemplateId, setSelectedTemplateId] = useState(PHISHING_TEMPLATES[0].id);

  // Simulation Inbox Mode (Step into employee shoes)
  const [activeTab, setActiveTab] = useState<'manager' | 'inbox_simulator'>('manager');
  const [showLearningBaitModal, setShowLearningBaitModal] = useState(false);
  const [reportedSuccess, setReportedSuccess] = useState(false);

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];
  const activeTemplate = templates.find((t) => t.id === activeCampaign?.templateId) || templates[0];

  // Calculate interaction rates
  const calculateRates = (metrics: PhishingCampaign['metrics']) => {
    const total = metrics.emailsSent || 1;
    return {
      openRate: Math.round((metrics.opened / total) * 100),
      clickRate: Math.round((metrics.clickedLink / total) * 100),
      compromiseRate: Math.round((metrics.submittedCredentials / total) * 100),
      reportRate: Math.round((metrics.reportedPhish / total) * 100),
    };
  };

  const rates = calculateRates(activeCampaign.metrics);

  // Create Campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) return;

    const newCamp: PhishingCampaign = {
      id: `camp-${Date.now()}`,
      name: campaignName.trim(),
      targetDepartment: targetDept,
      difficulty,
      templateId: selectedTemplateId,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      metrics: {
        emailsSent: targetDept === 'All Staff' ? 250 : 45,
        opened: 0,
        clickedLink: 0,
        submittedCredentials: 0,
        reportedPhish: 0,
      },
    };

    setCampaigns([newCamp, ...campaigns]);
    setSelectedCampaignId(newCamp.id);
    setCampaignName('');
    setShowCreateModal(false);
  };

  // Employee clicks simulated phishing link
  const handleSimulatedLinkClick = () => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === activeCampaign.id) {
          return {
            ...c,
            metrics: {
              ...c.metrics,
              clickedLink: c.metrics.clickedLink + 1,
            },
          };
        }
        return c;
      })
    );
    setShowLearningBaitModal(true);
  };

  // Employee clicks "Report Phishing" button
  const handleReportPhishing = () => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === activeCampaign.id) {
          return {
            ...c,
            metrics: {
              ...c.metrics,
              reportedPhish: c.metrics.reportedPhish + 1,
            },
          };
        }
        return c;
      })
    );
    setReportedSuccess(true);
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Postrix Command Header & Telemetry */}
      <section className="xh-panel">
        <div className="xh-kicker">
          <span className="k">Social Engineering Readiness &amp; Phishing Telemetry</span>
          <span className="tag">Authorized Security Awareness Drill</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-[#C9D3D9]/12">
          <div>
            <h2 className="text-lg font-semibold text-[#EEF3F1] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#EBC385]" />
              Social Phishing Campaign Simulation Engine
            </h2>
            <p className="text-xs text-[#A9B7BF] mt-0.5">
              Launch controlled social engineering campaigns to train employees and track interaction telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('manager');
                setShowLearningBaitModal(false);
                setReportedSuccess(false);
              }}
              className={`xh-btn ${
                activeTab === 'manager'
                  ? '!border-[#5FD3BF] !bg-[#5FD3BF]/15 !text-[#5FD3BF]'
                  : ''
              }`}
            >
              Campaign Analytics
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('inbox_simulator');
                setShowLearningBaitModal(false);
                setReportedSuccess(false);
              }}
              className={`xh-btn ${
                activeTab === 'inbox_simulator'
                  ? '!border-[#5FD3BF] !bg-[#5FD3BF]/15 !text-[#5FD3BF]'
                  : ''
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Employee Inbox View</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="xh-btn primary"
            >
              <Plus className="w-4 h-4" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {/* 5 Telemetry Metric Cards inside xh-panel */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          <div className="xh-metric">
            <div className="lbl">
              <span>01 · Dispatched</span>
            </div>
            <div className="num">{activeCampaign.metrics.emailsSent}</div>
            <p>{activeCampaign.targetDepartment} Dept</p>
          </div>

          <div className="xh-metric">
            <div className="lbl">
              <span>02 · Open Rate</span>
            </div>
            <div className="num hi">{rates.openRate}%</div>
            <p>{activeCampaign.metrics.opened} opened</p>
          </div>

          <div className="xh-metric">
            <div className="lbl">
              <span>03 · Click Rate</span>
            </div>
            <div className={`num ${rates.clickRate > 20 ? '!text-[#EBC385]' : ''}`}>
              {rates.clickRate}%
            </div>
            <p>{activeCampaign.metrics.clickedLink} clicked link</p>
          </div>

          <div className="xh-metric">
            <div className="lbl">
              <span>04 · Compromised</span>
            </div>
            <div className="num !text-red-400">{rates.compromiseRate}%</div>
            <p>{activeCampaign.metrics.submittedCredentials} creds entered</p>
          </div>

          <div className="xh-metric">
            <div className="lbl">
              <span>05 · Reported</span>
            </div>
            <div className="num hi">{rates.reportRate}%</div>
            <p>{activeCampaign.metrics.reportedPhish} caught &amp; reported</p>
          </div>
        </div>
      </section>

      {activeTab === 'manager' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Campaign List (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-[#D9DDD3] rounded-xl p-5 space-y-3 shadow-xs">
            <div>
              <span className="rm-kicker">01 / Active Drills</span>
              <h3 className="text-sm font-semibold text-[#16232F]">Simulated Campaigns</h3>
            </div>
            <div className="space-y-2">
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCampaignId(c.id)}
                  className={`p-3.5 rounded-lg border transition cursor-pointer ${
                    selectedCampaignId === c.id
                      ? 'bg-[#0E2238] text-[#EEF3F1] border-[#0E2238]'
                      : 'bg-[#F3F5F1] hover:bg-[#E9ECE6] text-[#16232F] border-[#D9DDD3]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs">{c.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border font-semibold ${
                        selectedCampaignId === c.id
                          ? 'bg-[#2BB5A0]/20 text-[#5FD3BF] border-[#5FD3BF]/40'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div
                    className={`mt-2 flex items-center justify-between text-[11px] font-mono ${
                      selectedCampaignId === c.id ? 'text-[#A9B7BF]' : 'text-[#4B5A66]'
                    }`}
                  >
                    <span>Target: {c.targetDepartment}</span>
                    <span>Difficulty: {c.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Selected Campaign Inspection & Template Preview (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-[#D9DDD3] rounded-xl p-6 text-xs space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <span className="rm-kicker">02 / Template &amp; Lure Configuration</span>
                  <h3 className="text-base font-semibold text-[#16232F]">
                    {activeCampaign.name}
                  </h3>
                  <p className="text-[#4B5A66] text-xs mt-0.5">
                    Dispatched to {activeCampaign.targetDepartment} · Created{' '}
                    {activeCampaign.createdAt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('inbox_simulator')}
                  className="px-3.5 py-2 rounded-lg bg-[#0E2238] hover:bg-[#16232F] text-[#F3F5F1] font-medium flex items-center gap-1.5 transition text-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#5FD3BF]" />
                  <span>Test In Employee Inbox</span>
                </button>
              </div>

              {/* Template Info Card */}
              <div className="p-4 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] space-y-2">
                <div className="flex justify-between items-center text-[#4B5A66]">
                  <span className="font-mono text-[11px]">Template:</span>
                  <span className="text-[#0E2238] font-semibold">
                    {activeTemplate.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#4B5A66]">
                  <span className="font-mono text-[11px]">Sender:</span>
                  <span className="text-[#16232F] font-mono text-[11px]">
                    {activeTemplate.senderName} &lt;{activeTemplate.senderAddress}&gt;
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#4B5A66]">
                  <span className="font-mono text-[11px]">Subject:</span>
                  <span className="text-[#16232F] font-medium">{activeTemplate.subject}</span>
                </div>
                <div className="flex justify-between items-center text-[#4B5A66]">
                  <span className="font-mono text-[11px]">Simulated Bait URL:</span>
                  <span className="text-red-700 font-mono text-[11px] truncate max-w-xs font-semibold">
                    {activeTemplate.targetLandingBait}
                  </span>
                </div>
              </div>

              {/* Educational Telltale Flags */}
              <div>
                <h4 className="font-semibold text-[#16232F] font-mono uppercase text-[11px] mb-2 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#D79A45]" /> Telltale Indicators Employees Must Catch
                </h4>
                <ul className="space-y-1.5">
                  {activeTemplate.telltaleIndicators.map((ind, i) => (
                    <li
                      key={i}
                      className="p-2.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] flex items-start gap-2 text-[#16232F]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D79A45] mt-1.5 shrink-0" />
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Employee Inbox Simulation Mode */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-[#D9DDD3] text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#16232F]">
              <Eye className="w-4 h-4 text-[#0E2238] shrink-0" />
              <span>
                <strong>Employee Simulation View:</strong> Experience how employees see the simulated campaign in their corporate Outlook/Webmail client.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('manager')}
              className="px-3 py-1.5 rounded-lg bg-[#F3F5F1] hover:bg-[#E9ECE6] text-[#16232F] border border-[#C7CDC0] text-xs font-medium cursor-pointer"
            >
              Back to Analytics
            </button>
          </div>

          {/* Simulated Email Client UI */}
          <div className="bg-white border border-[#C7CDC0] rounded-xl overflow-hidden shadow-md">
            {/* Client Top Bar */}
            <div className="p-3.5 bg-[#081420] border-b border-[#3E6E86]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-3 font-mono text-xs text-[#C6D1D6]">
                  Inbox — Corporate Webmail Client
                </span>
              </div>

              {/* Phish Alert Button */}
              <button
                type="button"
                onClick={handleReportPhishing}
                className="xh-btn primary"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report Phishing Attempt</span>
              </button>
            </div>

            {reportedSuccess && (
              <div className="m-4 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <strong>Threat Neutralized!</strong> You correctly identified this as a simulated phishing attack and used the &ldquo;Report Phishing&rdquo; corporate button. Telemetry logged and +50 Security XP awarded!
                </div>
              </div>
            )}

            {/* Email Headers View */}
            <div className="p-4 border-b border-slate-200 bg-[#F3F5F1] text-xs space-y-1.5 font-sans">
              <div className="flex items-baseline gap-2">
                <span className="text-[#4B5A66] font-mono text-[11px] w-14">From:</span>
                <span className="text-[#16232F] font-semibold">{activeTemplate.senderName}</span>
                <span className="text-[#4B5A66] font-mono text-[11px]">
                  &lt;{activeTemplate.senderAddress}&gt;
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[#4B5A66] font-mono text-[11px] w-14">Subject:</span>
                <span className="text-[#16232F] font-bold">{activeTemplate.subject}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[#4B5A66] font-mono text-[11px] w-14">To:</span>
                <span className="text-[#4B5A66]">employee@enterprise-corp.internal</span>
              </div>
            </div>

            {/* Email Body with click interceptor */}
            <div className="p-6 bg-[#081420] text-[#EEF3F1] text-sm leading-relaxed font-sans">
              <div
                dangerouslySetInnerHTML={{ __html: activeTemplate.bodyHtml }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'A' || target.closest('a')) {
                    e.preventDefault();
                    handleSimulatedLinkClick();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Simulated Learning Moment Modal (Triggered on clicking link) */}
      {showLearningBaitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081420]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-[#C7CDC0] rounded-xl p-6 text-[#16232F] shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16232F]">
                  Caught! This Was a Phishing Simulation
                </h3>
                <p className="text-xs text-[#4B5A66]">
                  No harm done — this was a scheduled corporate security drill.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#4B5A66] mb-4 leading-relaxed">
              In a real-world breach, clicking that link would have directed you to a credential harvesting portal or executed drive-by malware.
            </p>

            <div className="p-3.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] mb-4 space-y-2 text-xs">
              <h4 className="font-bold text-[#0E2238] uppercase font-mono text-[11px]">
                Red Flags You Missed:
              </h4>
              <ul className="space-y-1.5 text-[#16232F]">
                {activeTemplate.telltaleIndicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-700 font-bold">·</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowLearningBaitModal(false)}
                className="px-4 py-2 rounded-lg bg-[#0E2238] hover:bg-[#16232F] text-[#F3F5F1] font-medium text-xs cursor-pointer"
              >
                I Understand — Return to Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081420]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-[#C7CDC0] rounded-xl p-6 text-[#16232F] shadow-2xl">
            <span className="rm-kicker">New Phishing Simulation</span>
            <h3 className="text-base font-bold text-[#16232F] mb-1">
              Design Simulated Phishing Campaign
            </h3>
            <p className="text-xs text-[#4B5A66] mb-4">
              Configure target audience, difficulty level, and scenario lure.
            </p>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#16232F] font-medium mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Q4 Executive Wire Transfer Drill"
                  className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg px-3 py-2 text-[#16232F] outline-none focus:border-[#0E2238]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#16232F] font-medium mb-1">
                    Target Department
                  </label>
                  <select
                    value={targetDept}
                    onChange={(e: any) => setTargetDept(e.target.value)}
                    className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg px-2.5 py-2 text-[#16232F] outline-none focus:border-[#0E2238]"
                  >
                    <option value="All Staff">All Staff</option>
                    <option value="Finance">Finance</option>
                    <option value="Executive">Executive</option>
                    <option value="HR">HR</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#16232F] font-medium mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg px-2.5 py-2 text-[#16232F] outline-none focus:border-[#0E2238]"
                  >
                    <option value="Novice">Novice</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Zero-Day Pretext">Zero-Day Pretext</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#16232F] font-medium mb-1">
                  Phishing Template Lure
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg px-2.5 py-2 text-[#16232F] outline-none focus:border-[#0E2238]"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-[#F3F5F1] hover:bg-[#E9ECE6] text-[#16232F] border border-[#C7CDC0] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0E2238] hover:bg-[#16232F] text-[#F3F5F1] font-medium cursor-pointer"
                >
                  Deploy Simulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
