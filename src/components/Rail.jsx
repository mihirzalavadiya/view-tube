import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiMoon, FiSun } from 'react-icons/fi';
import { MdOutlineSmartDisplay } from 'react-icons/md';
import useTheme from '@/hooks/useTheme';

// The design specifies six rail destinations (Home, Shorts, Subs, Library,
// Courses, Trends). Only the two below exist as routes in this app, and the
// brief says not to show controls that do nothing — so the other four stay out
// until their pages are built. Add them here as they land.
const ITEMS = [
  { label: 'Home', href: '/', Icon: FiHome },
  { label: 'Shorts', href: '/shorts', Icon: MdOutlineSmartDisplay },
];

const isActiveHref = (pathname, href) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);

const Rail = () => {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const ThemeIcon = theme === 'dark' ? FiSun : FiMoon;

  return (
    <>
      {/* Desktop: 84px sticky icon rail */}
      <nav
        aria-label="Primary"
        className="sticky top-0 z-20 hidden h-screen w-[84px] flex-[0_0_84px] flex-col items-center gap-1.5 border-r border-line bg-bg px-0 pb-4 pt-[18px] md:flex"
      >
        <Link
          href="/"
          aria-label="ViewTube home"
          className="mb-[14px] grid h-11 w-11 place-items-center rounded-[14px] bg-accent font-display text-[20px] font-extrabold tracking-[-0.04em] text-accent-ink hover:text-accent-ink"
        >
          V
        </Link>

        {ITEMS.map(({ label, href, Icon }) => {
          const active = isActiveHref(router.pathname, href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? 'page' : undefined}
              className={`flex w-14 flex-col items-center gap-[5px] rounded-[14px] py-[9px] transition-colors duration-200 hover:bg-surface2 hover:text-ink ${
                active ? 'text-ink' : 'text-muted'
              }`}
            >
              <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em]">
                {label}
              </span>
              <span
                aria-hidden="true"
                className={`h-0.5 w-4 rounded-sm ${
                  active ? 'bg-accent' : 'bg-transparent'
                }`}
              />
            </Link>
          );
        })}

        <div className="flex-1" />

        <button
          type="button"
          onClick={toggle}
          title="Toggle theme"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          className="grid h-14 w-14 place-items-center rounded-2xl border border-line text-ink transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-accent-ink"
        >
          <ThemeIcon size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </nav>

      {/* Mobile: bottom tab bar, per the <768px spec */}
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-stretch border-t border-line bg-bg md:hidden"
      >
        {ITEMS.map(({ label, href, Icon }) => {
          const active = isActiveHref(router.pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 ${
                active ? 'text-ink' : 'text-muted'
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-x-6 top-0 h-0.5 rounded-b-sm ${
                  active ? 'bg-accent' : 'bg-transparent'
                }`}
              />
              <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em]">
                {label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={toggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          className="flex flex-1 flex-col items-center justify-center gap-1 text-muted"
        >
          <ThemeIcon size={22} strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em]">
            Theme
          </span>
        </button>
      </nav>
    </>
  );
};

export default Rail;
