"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useProfile } from "@/src/hooks/useProfile";
import { useResolvedName } from "@/src/hooks/useResolvedName";
import { ProfileModal } from "@/src/components/profile/ProfileModal";

export function Navbar() {
  const [profileOpen, setProfileOpen] = React.useState(false);
  const { address } = useAccount();
  const { profile } = useProfile(address);
  const { resolvedName } = useResolvedName(address);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[color:var(--border)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-[color:var(--border)]">
              <Image
                src="https://pbs.twimg.com/profile_images/2024770639400251392/dTwUzCaT_400x400.jpg"
                alt="Zentrfi logo"
                fill
                className="object-cover"
                sizes="36px"
                priority
              />
            </div>
            <div className="leading-tight">
              <div className="font-[family-name:var(--font-kanit)] text-sm tracking-wide text-black">
                Zentrfi
              </div>
              <div className="text-xs text-black/60">Zentra Finance</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-black/70 md:flex">
            <a href="#how" className="hover:text-black">
              How it works
            </a>
            <a href="#agents" className="hover:text-black">
              Agents
            </a>
            <a href="#web4" className="hover:text-black">
              Web4
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-black hover:bg-black/5 sm:inline-flex"
            >
              Launch Dashboard
            </Link>
            <div className="[&_*]:!font-[family-name:var(--font-inter)]">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openChainModal,
                  openConnectModal,
                  mounted,
                }) => {
                  const connected = mounted && account && chain;

                  return (
                    <div
                      {...(!mounted && {
                        "aria-hidden": true,
                        style: {
                          opacity: 0,
                          pointerEvents: "none" as const,
                          userSelect: "none" as const,
                        },
                      })}
                    >
                      {!connected ? (
                        <button
                          onClick={openConnectModal}
                          className="rounded-full bg-[color:var(--z-blue)] px-5 py-2 text-sm font-semibold text-white hover:brightness-110 transition-all"
                        >
                          Connect Wallet
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={openChainModal}
                            className="flex items-center gap-1.5 rounded-full border border-[color:var(--border)] px-3 py-2 hover:bg-black/5 transition-colors"
                          >
                            {chain.hasIcon && chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain"}
                                src={chain.iconUrl}
                                className="h-5 w-5 rounded-full"
                              />
                            )}
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>

                          <button
                            onClick={() => setProfileOpen(true)}
                            className="flex items-center gap-2 rounded-full border border-[color:var(--border)] px-3 py-2 text-sm font-medium text-black hover:bg-black/5 transition-colors"
                          >
                            {profile?.profilePic ? (
                              <img
                                src={profile.profilePic}
                                alt=""
                                className="h-5 w-5 rounded-full object-cover"
                              />
                            ) : account.ensAvatar ? (
                              <img
                                src={account.ensAvatar}
                                alt=""
                                className="h-5 w-5 rounded-full"
                              />
                            ) : (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 text-[10px]">
                                🤯
                              </div>
                            )}
                            {resolvedName || account.displayName}
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
      </header>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}
