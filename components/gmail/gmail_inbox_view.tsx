'use client';

import React, { useState } from 'react';
import {
  RotateCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Star,
  Inbox,
  Tag,
  Users,
  Info,
  Archive,
  Trash2,
  MailOpen,
  Clock,
  CheckSquare,
  Square,
} from 'lucide-react';

interface EmailItem {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
  isUnread: boolean;
  isStarred?: boolean;
}

const INITIAL_EMAILS: EmailItem[] = [
  {
    id: '1',
    sender: 'Datadog HQ',
    subject: 'Your Datadog Verification Code',
    snippet:
      'Finish signing up for Datadog by entering the code below. Do not share this verification code with anyone else. 8bb58142...',
    date: '6:56 PM',
    isUnread: true,
  },
  {
    id: '2',
    sender: 'Google',
    subject: 'You shared some Google Account data with datadoghq.com',
    snippet:
      "Keep track of your Google Account data hemantrillion@gmail.com You're receiving this email because you used...",
    date: '6:55 PM',
    isUnread: true,
  },
  {
    id: '3',
    sender: 'anomalydetection',
    subject:
      'Getting started with AWS Cost Anomaly Detection - Hemant Kumar (857481121632)',
    snippet:
      'AWS Account: Hemant Kumar (857481121632) Hello, As part of your enablement of AWS...',
    date: '6:51 PM',
    isUnread: true,
  },
  {
    id: '4',
    sender: 'no-reply',
    subject: 'Verify your identity',
    snippet:
      "Verify your identity Hello, We identified unusual activity in a recent sign in attempt from your AWS account's root user...",
    date: '6:50 PM',
    isUnread: true,
  },
  {
    id: '5',
    sender: 'no-reply',
    subject: 'Sign up for AWS - Email Verification',
    snippet:
      'The email specified is already associated with an AWS account We received a request to create a new AWS account using this e-mail...',
    date: '6:48 PM',
    isUnread: true,
  },
  {
    id: '6',
    sender: 'noreply',
    subject: 'Login from new location or browser',
    snippet:
      'Login from new device or location We have noticed that you recently logged in to Dynatrace from a different browser or location than...',
    date: '6:40 PM',
    isUnread: true,
  },
  {
    id: '7',
    sender: 'noreply',
    subject: 'Welcome to Dynatrace!',
    snippet:
      "Welcome to your Dynatrace trial! Hi, We've included some helpful resources below to get you started on your journey to delivering...",
    date: '6:39 PM',
    isUnread: true,
  },
  {
    id: '8',
    sender: 'Udemy',
    subject: 'Learning AI alone? (Udemy has a fix)',
    snippet:
      'Plus: the instructor who says the real AI skill is asking better questions.',
    date: '11:28 AM',
    isUnread: true,
  },
  {
    id: '9',
    sender: 'DigiLocker',
    subject: 'Your OTP to access DigiLocker account',
    snippet:
      'Dear DigiLocker User, You are attempting to sign in to your DigiLocker account using the registered mobile number ******4364. Your O...',
    date: 'Oct 15',
    isUnread: false,
  },
  {
    id: '10',
    sender: 'no-reply@amazonaw...',
    subject: 'Customer verification successfully completed',
    snippet:
      'AWS logo Greetings from Amazon Web Services, We were able to complete customer verification based on the information you...',
    date: 'Oct 15',
    isUnread: false,
  },
  {
    id: '11',
    sender: 'no-reply',
    subject: 'Verify your email address',
    snippet:
      'Verification code 679650 (This code will expire 10 minutes after it was sent.) Amazon Web Services will never email you and ask...',
    date: 'Oct 15',
    isUnread: false,
  },
  {
    id: '12',
    sender: 'billing-subscr...@aws.c...',
    subject: 'Your AWS project has been closed',
    snippet:
      'Account Closure Confirmation Your AWS project has been closed This e-mail confirms that your project has been closed. Here is what to...',
    date: 'Oct 15',
    isUnread: false,
  },
  {
    id: '13',
    sender: 'billing-subscr...@aws.c...',
    subject: 'Your AWS account plan has been upgraded',
    snippet:
      'Free Tier Self Initiated Upgrade Your AWS account plan has been upgraded Your AWS account has been successfully upgraded to...',
    date: 'Oct 15',
    isUnread: false,
  },
  {
    id: '14',
    sender: 'DevOps Jobs via Lin...',
    subject: '42 New DevOps Jobs',
    snippet: 'DevOps Jobs - Recommended positions matched to your profile...',
    date: 'Oct 15',
    isUnread: false,
  },
  {
    id: '15',
    sender: 'billing-subscr...@aws.c...',
    subject: 'Welcome to AWS - Your Account with Free Plan is Ready',
    snippet:
      'Free Tier Trial Welcome Welcome to AWS - Your Account with Free Plan is Ready Your AWS free plan is active. Here is what to know...',
    date: 'Oct 15',
    isUnread: false,
  },
  {
    id: '16',
    sender: 'Google',
    subject: 'You shared some Google Account data with Amazon Web Services',
    snippet:
      "Keep track of your Google Account data hemantrillion@gmail.com You're receiving this email because you signed in...",
    date: 'Oct 15',
    isUnread: false,
  },
  {
    id: '17',
    sender: 'Dharani HR',
    subject: 'Registration Open: IBM-Associated Training & Internship Program 2026',
    snippet:
      'PROGRAM INVITATION 2026 IBM-Associated Training & Internship Program Dear Student, Greetings from...',
    date: 'Oct 15',
    isUnread: false,
  },
  {
    id: '18',
    sender: 'Namecheap',
    subject: 'Quick! Not long left to get up to 79% off domains',
    snippet:
      'Save big on domain registrations and transfers as we celebrate our 26th birthday.',
    date: 'Oct 14',
    isUnread: false,
  },
];

type CategoryTab = 'primary' | 'promotions' | 'social' | 'updates';

export function GmailInboxView() {
  const [emails, setEmails] = useState<EmailItem[]>(INITIAL_EMAILS);
  const [activeTab, setActiveTab] = useState<CategoryTab>('primary');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectAll = () => {
    if (selectedIds.size === emails.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(emails.map((e) => e.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleStar = (id: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isStarred: !e.isStarred } : e))
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-12 border-b border-[#e0e2ec] px-4 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Select all checkbox */}
          <button
            onClick={toggleSelectAll}
            className="p-2 rounded hover:bg-black/5 text-[#444746]"
          >
            {selectedIds.size > 0 ? (
              <CheckSquare className="w-4 h-4 text-[#0b57d0]" />
            ) : (
              <Square className="w-4 h-4 text-[#747775]" />
            )}
          </button>

          {/* Refresh button */}
          <button
            title="Refresh"
            className="p-2 rounded-full hover:bg-black/5 text-[#444746] transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* More options */}
          <button
            title="More"
            className="p-2 rounded-full hover:bg-black/5 text-[#444746] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-3 text-xs text-[#444746] font-medium">
          <span>1–{emails.length} of 531</span>
          <div className="flex items-center">
            <button
              disabled
              className="p-1.5 rounded-full text-[#c4c7c5] cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-black/5 text-[#444746]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Row (Primary, Promotions, Social, Updates) */}
      <div className="flex border-b border-[#e0e2ec] shrink-0 bg-white">
        {/* Primary */}
        <button
          onClick={() => setActiveTab('primary')}
          className={`flex items-center gap-3 px-6 py-3.5 text-sm font-semibold relative transition-colors ${
            activeTab === 'primary'
              ? 'text-[#0b57d0]'
              : 'text-[#444746] hover:bg-black/5'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Primary</span>
          {activeTab === 'primary' && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0b57d0] rounded-t-sm" />
          )}
        </button>

        {/* Promotions */}
        <button
          onClick={() => setActiveTab('promotions')}
          className={`flex items-center gap-3 px-6 py-3.5 text-sm font-semibold relative transition-colors ${
            activeTab === 'promotions'
              ? 'text-[#0b57d0]'
              : 'text-[#444746] hover:bg-black/5'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Promotions</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-emerald-600 text-white font-bold rounded-full">
            49 new
          </span>
          {activeTab === 'promotions' && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0b57d0] rounded-t-sm" />
          )}
        </button>

        {/* Social */}
        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-3 px-6 py-3.5 text-sm font-semibold relative transition-colors ${
            activeTab === 'social'
              ? 'text-[#0b57d0]'
              : 'text-[#444746] hover:bg-black/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Social</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-[#0b57d0] text-white font-bold rounded-full">
            50 new
          </span>
          {activeTab === 'social' && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0b57d0] rounded-t-sm" />
          )}
        </button>

        {/* Updates */}
        <button
          onClick={() => setActiveTab('updates')}
          className={`flex items-center gap-3 px-6 py-3.5 text-sm font-semibold relative transition-colors ${
            activeTab === 'updates'
              ? 'text-[#0b57d0]'
              : 'text-[#444746] hover:bg-black/5'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Updates</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-amber-600 text-white font-bold rounded-full">
            50 new
          </span>
          {activeTab === 'updates' && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0b57d0] rounded-t-sm" />
          )}
        </button>
      </div>

      {/* Email Thread Rows List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#f2f4f8]">
        {emails.map((email) => {
          const isSelected = selectedIds.has(email.id);

          return (
            <div
              key={email.id}
              className={`group flex items-center px-4 py-2 hover:shadow-xs transition-colors cursor-pointer text-sm ${
                isSelected
                  ? 'bg-[#c2e7ff]/40'
                  : email.isUnread
                  ? 'bg-white hover:bg-[#f6f8fc]'
                  : 'bg-[#f7f9fc] hover:bg-[#f1f3f7]'
              }`}
            >
              {/* Select Checkbox */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelectOne(email.id);
                }}
                className="p-1 text-[#747775] hover:text-[#1f1f1f] mr-1.5"
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-[#0b57d0]" />
                ) : (
                  <Square className="w-4 h-4 text-[#747775]" />
                )}
              </div>

              {/* Star */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(email.id);
                }}
                className="p-1 mr-3 text-[#747775] hover:text-[#1f1f1f]"
              >
                <Star
                  className={`w-4 h-4 ${
                    email.isStarred
                      ? 'fill-[#fbbc04] text-[#fbbc04]'
                      : 'text-[#747775]'
                  }`}
                />
              </button>

              {/* Sender Name */}
              <div
                className={`w-48 truncate pr-3 shrink-0 ${
                  email.isUnread ? 'font-bold text-[#1f1f1f]' : 'text-[#444746]'
                }`}
              >
                {email.sender}
              </div>

              {/* Subject & Preview Snippet */}
              <div className="flex-1 min-w-0 truncate pr-4">
                <span
                  className={
                    email.isUnread
                      ? 'font-bold text-[#1f1f1f]'
                      : 'text-[#1f1f1f]'
                  }
                >
                  {email.subject}
                </span>
                <span className="text-[#5e5e5e] mx-1.5">-</span>
                <span className="text-[#5e5e5e] font-normal">
                  {email.snippet}
                </span>
              </div>

              {/* Timestamp / Hover Action Icons */}
              <div className="w-24 text-right shrink-0 flex items-center justify-end">
                {/* Regular Date Display (hidden on hover) */}
                <span
                  className={`text-xs group-hover:hidden ${
                    email.isUnread
                      ? 'font-bold text-[#1f1f1f]'
                      : 'text-[#5e5e5e]'
                  }`}
                >
                  {email.date}
                </span>

                {/* Quick Action Icons on Row Hover */}
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    title="Archive"
                    className="p-1.5 rounded-full hover:bg-black/10 text-[#444746]"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    title="Delete"
                    className="p-1.5 rounded-full hover:bg-black/10 text-[#444746]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    title="Mark as read"
                    className="p-1.5 rounded-full hover:bg-black/10 text-[#444746]"
                  >
                    <MailOpen className="w-4 h-4" />
                  </button>
                  <button
                    title="Snooze"
                    className="p-1.5 rounded-full hover:bg-black/10 text-[#444746]"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
