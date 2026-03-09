"use client";

import * as React from "react";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import { useProfile } from "@/src/hooks/useProfile";
import { EditProfileModal } from "./EditProfileModal";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  avatar?: string;
  displayName?: string;
}

export function ProfileModal({ open, onClose, avatar, displayName }: ProfileModalProps) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { profile, update } = useProfile(address);
  const [copied, setCopied] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  if (!open || !address) return null;

  const nickname = profile?.nickname || null;
  const profilePic = profile?.profilePic || null;

  const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const balanceStr = balance
    ? `${parseFloat(balance.formatted).toFixed(3)} ${balance.symbol}`
    : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const handleProfileSave = (data: { nickname: string; profilePic: string | null }) => {
    update({ nickname: data.nickname, profilePic: data.profilePic });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div
          className="relative w-[360px] rounded-3xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-black/50 hover:bg-black/10 hover:text-black"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-pink-100">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
              ) : avatar ? (
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl">🤯</span>
              )}
            </div>

            {/* Name & balance */}
            <div className="mt-3 text-lg font-bold text-black">
              {nickname || displayName || shortAddr}
            </div>
            {balanceStr && (
              <div className="mt-0.5 text-sm text-black/40">{balanceStr}</div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="flex flex-col items-center gap-2 rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-4 text-sm font-medium text-black hover:bg-black/5 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="6" y="6" width="11" height="11" rx="2" />
                <path d="M3 14V4a2 2 0 012-2h10" strokeLinecap="round" />
              </svg>
              {copied ? "Copied!" : "Copy Address"}
            </button>

            <button
              onClick={handleDisconnect}
              className="flex flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50/60 px-4 py-4 text-sm font-medium text-red-600 hover:bg-red-100/80 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 6V4a2 2 0 012-2h7a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2v-2" strokeLinecap="round" />
                <path d="M12 10H1m0 0l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Disconnect
            </button>
          </div>

          {/* Edit Profile button */}
          <button
            disabled
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-black/6 bg-black/[0.03] px-4 py-3.5 text-sm font-medium text-black/30 cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" strokeLinejoin="round" />
              <path d="M9.5 3.5l3 3" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        address={address}
        currentNickname={nickname || ""}
        currentPic={profilePic}
        onSave={handleProfileSave}
      />
    </>
  );
}
