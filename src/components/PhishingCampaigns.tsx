import React, { useState } from 'react';
import {
  Send,
  Users,
  Target,
  BarChart3,
  Plus,
  AlertOctagon,
  CheckCircle,
  Eye,
  MousePointer,
  Lock,
  Flag,
  Sparkles,
  Info,
  Shield,
  Download,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhishingCampaign, PhishingTemplate } from '../types';
import { INITIAL_CAMPAIGNS, PHISHING_TEMPLATES } from '../data/phishingCampaignData';

export const PhishingCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<PhishingCampaign[]>(INITIAL_CAMPAIGNS);
  const [templates, setTemplates] = useState<PhishingTemplate[]>(PHISHING_TEMPLATES);
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
    // Increment clickedLink count
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
      {/* Top Banner and Tabs */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-rose-400" />
            Social Phishing Campaign Simulation Engine
          </h2>
          <p className="text-xs text-slate-400">
            Launch controlled social engineering campaigns to train employees and track interaction telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => {
                setActiveTab('manager');
                setShowLearningBaitModal(false);
                setReportedSuccess(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                activeTab === 'manager'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Campaign Analytics
            </button>
            <button
              onClick={() => {
                setActiveTab('inbox_simulator');
                setShowLearningBaitModal(false);
                setReportedSuccess(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                activeTab === 'inbox_simulator'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Employee Inbox View
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-rose-950"
          >
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </div>

      {activeTab === 'manager' ? (
        <>
          {/* Telemetry Metrics for Selected Campaign */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
              <span className="text-slate-500 font-mono uppercase block text-[10px]">
                Total Dispatched
              </span>
              <div className="text-2xl font-bold text-white mt-1">
                {activeCampaign.metrics.emailsSent}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeCampaign.targetDepartment} Dept
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
              <span className="text-slate-500 font-mono uppercase block text-[10px]">
                Open Rate
              </span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {rates.openRate}%
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeCampaign.metrics.opened} opened
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
              <span className="text-slate-500 font-mono uppercase block text-[10px]">
                Click Rate
              </span>
              <div
                className={`text-2xl font-bold mt-1 ${
                  rates.clickRate > 20 ? 'text-rose-400' : 'text-amber-400'
                }`}
              >
                {rates.clickRate}%
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeCampaign.metrics.clickedLink} clicked link
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
              <span className="text-slate-500 font-mono uppercase block text-[10px]">
                Compromised (Entered Creds)
              </span>
              <div className="text-2xl font-bold text-rose-500 mt-1">
                {rates.compromiseRate}%
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeCampaign.metrics.submittedCredentials} credentials entered
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
              <span className="text-slate-500 font-mono uppercase block text-[10px]">
                Reported by Staff
              </span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {rates.reportRate}%
              </div>
              <span className="text-[11px] text-emerald-300 font-mono">
                {activeCampaign.metrics.reportedPhish} caught & reported
              </span>
            </div>
          </div>

          {/* Campaign Selector & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Campaign List (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Simulated Campaigns
              </h3>
              <div className="space-y-2">
                {campaigns.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCampaignId(c.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      selectedCampaignId === c.id
                        ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                        : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">
                        {c.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase border ${
                          c.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Target: {c.targetDepartment}</span>
                      <span>Difficulty: {c.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Selected Campaign Inspection & Template Preview (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {activeCampaign.name}
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Dispatched to {activeCampaign.targetDepartment} &bull; Created{' '}
                      {activeCampaign.createdAt}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('inbox_simulator')}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-1.5 transition text-xs shadow-md shadow-cyan-950"
                  >
                    <Eye className="w-3.5 h-3.5" /> Test In Employee Inbox
                  </button>
                </div>

                {/* Template Info Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-mono text-[11px]">Template:</span>
                    <span className="text-cyan-400 font-medium">
                      {activeTemplate.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-mono text-[11px]">Sender:</span>
                    <span className="text-slate-200 font-mono text-[11px]">
                      {activeTemplate.senderName} &lt;{activeTemplate.senderAddress}&gt;
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-mono text-[11px]">Subject:</span>
                    <span className="text-slate-200">{activeTemplate.subject}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-mono text-[11px]">Simulated Bait URL:</span>
                    <span className="text-rose-400 font-mono text-[11px] truncate max-w-xs">
                      {activeTemplate.targetLandingBait}
                    </span>
                  </div>
                </div>

                {/* Educational Telltale Flags */}
                <div>
                  <h4 className="font-bold text-slate-300 font-mono uppercase text-[11px] mb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-400" /> Telltale Indicators Employees Must Catch
                  </h4>
                  <ul className="space-y-1.5">
                    {activeTemplate.telltaleIndicators.map((ind, i) => (
                      <li
                        key={i}
                        className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-2 text-slate-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Employee Inbox Simulation Mode */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300">
              <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Employee Simulation View:</strong> Experience how employees see the simulated campaign in their corporate Outlook/Webmail client.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('manager')}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
            >
              Back to Analytics
            </button>
          </div>

          {/* Simulated Email Client UI */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Client Top Bar */}
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-3 font-mono text-xs text-slate-400">
                  Inbox - Corporate Webmail
                </span>
              </div>

              {/* Phish Alert Button */}
              <button
                onClick={handleReportPhishing}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-md shadow-rose-950"
              >
                <Flag className="w-3.5 h-3.5" /> Report Phishing Attempt
              </button>
            </div>

            {reportedSuccess && (
              <div className="m-4 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong>Threat Neutralized!</strong> You correctly identified this as a simulated phishing attack and used the "Report Phishing" corporate button. Telemetry logged and +50 Security XP awarded!
                </div>
              </div>
            )}

            {/* Email Headers View */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 text-xs space-y-1.5 font-sans">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 font-mono text-[11px] w-14">From:</span>
                <span className="text-white font-semibold">{activeTemplate.senderName}</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  &lt;{activeTemplate.senderAddress}&gt;
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 font-mono text-[11px] w-14">Subject:</span>
                <span className="text-slate-100 font-bold">{activeTemplate.subject}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 font-mono text-[11px] w-14">To:</span>
                <span className="text-slate-300">employee@enterprise-corp.internal</span>
              </div>
            </div>

            {/* Email Body with click interceptor */}
            <div className="p-6 bg-slate-950 text-slate-200 text-sm leading-relaxed font-sans">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-rose-500/50 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-500/40">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Caught! This Was a Phishing Simulation
                </h3>
                <p className="text-xs text-slate-400">
                  No harm done — this was a scheduled corporate security drill.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              In a real-world breach, clicking that link would have directed you to a credential harvesting portal or executed drive-by malware.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 mb-4 space-y-2 text-xs">
              <h4 className="font-bold text-amber-400 uppercase font-mono text-[11px]">
                Red Flags You Missed:
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                {activeTemplate.telltaleIndicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">&bull;</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowLearningBaitModal(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-medium text-xs shadow-md shadow-rose-950"
              >
                I Understand &mdash; Return to Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Design Simulated Phishing Campaign
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure target audience, difficulty level, and scenario lure.
            </p>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Q4 Executive Wire Transfer Drill"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-rose-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Target Department
                  </label>
                  <select
                    value={targetDept}
                    onChange={(e: any) => setTargetDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 outline-none focus:border-rose-500"
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
                  <label className="block text-slate-300 font-medium mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 outline-none focus:border-rose-500"
                  >
                    <option value="Novice">Novice</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Zero-Day Pretext">Zero-Day Pretext</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Phishing Template Lure
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 outline-none focus:border-rose-500"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-md shadow-rose-950"
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
