import { Link } from "@remix-run/react";

import { LinkButton } from "./LinkButton";
// building off tailwind ui "With stacked flyout menu" header design
// https://tailwindui.com/components/marketing/elements/headers#component-27e5f71ced91b88e3f6b59ca69033a83
export function GlobalNav() {
  return (
    <header className="p-6 shadow-sm ">
      <nav className="flex justify-between">
        <div>
          {/* pretend this div is a logo */}
          <Link to="/">
            <div className="w-20 h-8 bg-slate-500"></div>
          </Link>
        </div>
        {/* mobile, tablet hamburger nav */}
        <HamburgerMenu />
        {/* desktop nav items */}
        <div className="hidden lg:flex gap-x-10 items-center">
          <LinkButton type="text" toHref="/register">
            Register
          </LinkButton>
          <LinkButton type="text" toHref="/login">
            Log In
          </LinkButton>
          {/* 
            using this link button as a baseline:
            https://flowbite.com/docs/typography/links/#button
          */}
          <LinkButton type="text" toHref="/">
            Read more
          </LinkButton>
        </div>
      </nav>
    </header>
  );
}
// implementation taken from https://tailwindui.com/components/marketing/elements/headers#component-27e5f71ced91b88e3f6b59ca69033a83
// TODO: make hamburger menu functional, at the moment it can't be interacted with
function HamburgerMenu() {
  return (
    <div className="flex lg:hidden">
      <button
        type="button"
        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
      >
        <span className="sr-only">Open main menu</span>
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
    </div>
  );
}
