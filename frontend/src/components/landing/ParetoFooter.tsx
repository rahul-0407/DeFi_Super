"use client";

import React from "react";
import Link from "next/link";

const ParetoFooter = () => {
  return (
    <footer className="bg-on-background text-white pt-32 pb-12 px-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between mb-32 gap-16">
          {/* Logo & Newsletter */}
          <div className="lg:w-1/3">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 4L28 10V22L16 28L4 22V10L16 4Z"
                stroke="white"
                strokeWidth="2"
              />
              <circle cx="16" cy="16" r="6" fill="#77b8a2" />
            </svg>
            <span className="text-3xl font-bold tracking-tight">Pareto</span>

            <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
              Subscribe to our newsletter
            </p>
            <div className="flex items-center border-b border-neutral-700 pb-4 max-w-sm">
              <input
                type="email"
                placeholder="Email"
                className="bg-transparent border-none outline-none focus:ring-0 text-xl font-serif text-white placeholder:text-neutral-700 w-full"
              />
              <button className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 hover:text-secondary-fixed transition-colors ml-4">
                Subscribe
              </button>
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-12">
            <div>
              <h5 className="text-neutral-600 text-[11px] font-bold uppercase tracking-[0.2em] mb-10">
                Resources
              </h5>
              <ul className="space-y-6 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                <li>
                  <Link
                    href="/coming-soon"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/coming-soon"
                    className="hover:text-white transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/coming-soon"
                    className="hover:text-white transition-colors"
                  >
                    Brand Kit
                  </Link>
                </li>
                <li>
                  <Link
                    href="/coming-soon"
                    className="hover:text-white transition-colors"
                  >
                    Governance
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-neutral-600 text-[11px] font-bold uppercase tracking-[0.2em] mb-10">
                Products
              </h5>
              <ul className="space-y-6 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                <li>
                  <Link
                    href="/lending"
                    className="hover:text-white transition-colors"
                  >
                    Lending Markets
                  </Link>
                </li>
                <li>
                  <Link
                    href="/swap"
                    className="hover:text-white transition-colors"
                  >
                    Pareto Swap
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analytics"
                    className="hover:text-white transition-colors"
                  >
                    Protocol Analytics
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Middle Line & Icons */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-neutral-800 gap-8 mb-20">
          <div className="flex gap-4">
            {[
              {
                id: "X",
                svg: (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ),
              },
              {
                id: "Discord",
                svg: (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.053-.102.001-.225-.11-.267a13.042 13.042 0 0 1-1.879-.893.077.077 0 0 1-.003-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.291a.077.077 0 0 1-.003.128 12.933 12.933 0 0 1-1.878.893.077.077 0 0 0-.11.266c.353.699.765 1.362 1.226 1.994a.078.078 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
                  </svg>
                ),
              },
              {
                id: "Telegram",
                svg: (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                ),
              },
              {
                id: "LinkedIn",
                svg: (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                ),
              },
              {
                id: "OpenSea",
                svg: (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2.38 12.91L5.9 15.3l.03.02 3.52 2.39c.28.19.64.24.96.14l.11-.04c.14-.05.28-.15.38-.28l.19-.24c.05-.07.13-.13.23-.16l.24-.09c.35-.13.75-.05 1.02.2l.06.05c.18.17.43.27.69.27h.03c.26 0 .5-.1.69-.27l4.37-4.14c1.17-1.11 1.72-2.73 1.46-4.32-.37-2.27-2.47-3.83-4.71-3.48-1.55.24-2.82 1.25-3.38 2.65l-.04.09c-.19.46-.71.69-1.18.5-.09-.04-.18-.08-.26-.14L10.8 7.3c-.63-.48-1.46-.6-2.2-.33l-.13.05c-.32.12-.58.36-.71.68l-.1.25c-.17.41-.6.67-1.04.66s-.85-.3-1.01-.71l-.09-.24c-.11-.27-.29-.5-.54-.64L2.83 5.4c-1.12-.66-2.58-.28-3.24.84-.36.61-.43 1.34-.19 2.01L2.38 12.91zM11.66 11.23c-.1 0-.21-.05-.28-.13l-.53-.66c-.14-.18-.11-.43.07-.57.18-.14.43-.11.57.07l.53.66c.14.18.11.43-.07.57-.08.06-.18.06-.29.06z" />
                  </svg>
                ),
              },
              {
                id: "Warpcast",
                svg: (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.2 4.3c-.3-.5-.9-.7-1.4-.4l-2.4 1.4-1.3-1.3c-.4-.4-1-.4-1.4 0l-1.3 1.3-1.3-1.3c-.4-.4-1-.4-1.4 0l-1.3 1.3-1.3-1.3c-.4-.4-1-.4-1.4 0L8 5.6 5.6 4.3V2c0-.6-.4-1-1-1s-1 .4-1 1v2.3L1.2 5.6c-.5.3-.7.9-.4 1.4l1.3 2.1c.2.3.5.5.8.5.2 0 .3 0 .5-.1L12 6.4l8.6 3.1c.2.1.3.1.5.1.3 0 .6-.2.8-.5l1.3-2.1zM12 12c-4.4 0-8 3.6-8 8v3c0 .6.4 1 1 1h14c.6 0 1-.4 1-1v-3c0-4.4-3.6-8-8-8z" />
                  </svg>
                ),
              },
            ].map((social, i) => (
              <div
                key={i}
                title={social.id}
                className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-500 hover:border-neutral-600 hover:text-white transition-all cursor-pointer"
              >
                {social.svg}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-[11px] font-bold uppercase tracking-widest text-neutral-500">
            <Link
              href="/coming-soon"
              className="hover:text-white transition-colors"
            >
              IPFS app
            </Link>
            <Link
              href="/coming-soon"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/coming-soon"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/coming-soon"
              className="hover:text-white transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="text-neutral-600 text-[10px] font-medium leading-relaxed max-w-7xl font-mono-inter uppercase tracking-tight opacity-60">
          All content available on this Website is general in nature, not
          directed or tailored to any particular person, and is for
          informational purposes only. Neither the Website nor any of its
          content is offered as investment advice and should not be deemed as
          investment advice or a recommendation to purchase or sell any specific
          security. The information contained herein reflects the opinions and
          projections of Pareto as of the date hereof, which are subject to
          change without notice at any time. Pareto does not represent that any
          opinion or projection will be realized. Neither Pareto nor any of its
          advisers, officers, directors, or affiliates represents that the
          information presented on this Website is accurate, current, or
          complete, and such information is subject to change without notice.
          Any performance information must be considered in conjunction with
          applicable disclosures. Past performance is not a guarantee of future
          results. Neither this Website nor its contents should be construed as
          legal, tax, or other advice. Individuals are urged to consult with
          their own tax or legal advisers before entering into any advisory
          contract.
        </div>
      </div>
    </footer>
  );
};

export default ParetoFooter;
