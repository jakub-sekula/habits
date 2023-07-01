"use client";
import React, { useEffect, useState } from "react";
import { useAuth, AuthContextType } from "./AuthContext";
import Link from "next/link";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as Avatar from "@radix-ui/react-avatar";
import styles from "./Header.module.css";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { getInitials } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";
import {MdOutlineMenu} from 'react-icons/md'
import { BsX } from "react-icons/bs";
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  return (
    <NavigationMenu.Link
      asChild
      active={path === href}
      className={clsx(styles.navItem, "mr-auto w-full md:w-fit h-full")}
    >
      <Link passHref href={href}>
        {children}
      </Link>
    </NavigationMenu.Link>
  );
}

export default function Header() {
  const { currentUser, logout } = useAuth() as AuthContextType;
  const [mobileOpen, setMobileOpen] = useState<Boolean>(false);
  const path = usePathname();

  useEffect(()=>{
    setMobileOpen(false)
  },[path])

  return (
    <header className={styles.header}>
      <NavigationMenu.Root className="w-full h-min relative px-3 md:pr-0">
        <NavigationMenu.List className="flex w-full h-16">
          <NavigationMenu.Item className="flex-grow w-full text-xl font-bold items-center flex">
            <Link aria-label="homepage" href="/">
              Habiti.co
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item className="md:hidden flex items-center justify-center ml-auto">
            <button
            onClick={()=>{
              setMobileOpen(prev => !prev)
            }}>
              {mobileOpen ? <BsX size={20} /> : <MdOutlineMenu size={20} />}
            </button>
          </NavigationMenu.Item>
          <div className="md:flex justify-center gap-4 hidden">
            <NavigationMenu.Item >
              <NavLink href="/habits">Habits</NavLink>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavLink href="/trackers">Trackers</NavLink>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavLink href="/statistics">Statistics</NavLink>
            </NavigationMenu.Item>
          </div>

          <div className={clsx("fixed top-16 left-0 w-full bottom-0 z-50 bg-neutral-50 flex flex-col items-center text-xl gap-8 py-8", mobileOpen ? " " : "hidden")}>
          <NavigationMenu.Item className="w-full">
              <NavLink href="/habits">Habits</NavLink>
            </NavigationMenu.Item>
            <NavigationMenu.Item className="w-full">
              <NavLink href="/trackers">Trackers</NavLink>
            </NavigationMenu.Item>
            <NavigationMenu.Item className="w-full">
              <NavLink href="/statistics">Statistics</NavLink>
            </NavigationMenu.Item>
            {currentUser ? (
            <NavigationMenu.Item className={"w-full mt-auto"}>
              <div className="relative">
                <NavigationMenu.Trigger
                  className={clsx(
                    // styles.navItem,
                    "flex flex-row-reverse gap-2 items-center w-full justify-center"
                  )}
                >
                  <Avatar.Root className="inline-flex h-8 w-8 text-xs select-none items-center justify-center overflow-hidden rounded-full align-middle">
                    <Avatar.Image
                      className="h-full w-full object-cover"
                      src={currentUser?.photoURL as string}
                      alt={currentUser?.displayName || "Profile image"}
                    />
                    <Avatar.Fallback
                      delayMs={200}
                      className="leading-none flex h-full w-full items-center justify-center bg-white font-medium"
                    >
                      {getInitials(currentUser?.displayName)}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <span>
                    {`${
                      currentUser.displayName === null
                        ? "Anonymous"
                        : currentUser.displayName
                    }`}
                  </span>
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className={styles.navItemDropdown}>
                  <ul>
                    <li className="w-full">
                      <Link
                        href="/profile"
                        className=" w-full block py-2 px-3 hover:bg-sky-50"
                      >
                        Profile
                      </Link>
                    </li>
                    <Separator className="w-full h-px bg-slate-200" />
                    <li className="w-full hover:bg-sky-50">
                      <button
                        className="w-full h-full text-left py-2 px-3"
                        onClick={() => {
                          logout();
                        }}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </NavigationMenu.Content>
              </div>
            </NavigationMenu.Item>
          ) : (
            <NavigationMenu.Item
              className={"flex-grow w-full justify-end hidden md:flex"}
            >
              <NavigationMenu.Link className={styles.navItem} asChild>
                <Link href="/login">Log in</Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          )}
          </div>


          {currentUser ? (
            <NavigationMenu.Item className={"flex-grow w-full hidden md:block"}>
              <div className="z-50 w-fit h-full ml-auto relative">
                <NavigationMenu.Trigger
                  className={clsx(
                    styles.navItem,
                    "flex flex-row-reverse gap-2 items-center"
                  )}
                >
                  <Avatar.Root className="inline-flex h-8 w-8 text-xs select-none items-center justify-center overflow-hidden rounded-full align-middle">
                    <Avatar.Image
                      className="h-full w-full object-cover"
                      src={currentUser?.photoURL as string}
                      alt={currentUser?.displayName || "Profile image"}
                    />
                    <Avatar.Fallback
                      delayMs={200}
                      className="leading-none flex h-full w-full items-center justify-center bg-white font-medium"
                    >
                      {getInitials(currentUser?.displayName)}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <span>
                    {`${
                      currentUser.displayName === null
                        ? "Anonymous"
                        : currentUser.displayName
                    }`}
                  </span>
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className={styles.navItemDropdown}>
                  <ul>
                    <li className="w-full">
                      <Link
                        href="/profile"
                        className=" w-full block py-2 px-3 hover:bg-sky-50"
                      >
                        Profile
                      </Link>
                    </li>
                    <Separator className="w-full h-px bg-slate-200" />
                    <li className="w-full hover:bg-sky-50">
                      <button
                        className="w-full h-full text-left py-2 px-3"
                        onClick={() => {
                          logout();
                        }}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </NavigationMenu.Content>
              </div>
            </NavigationMenu.Item>
          ) : (
            <NavigationMenu.Item
              className={"flex-grow w-full justify-end hidden md:flex"}
            >
              <NavigationMenu.Link className={styles.navItem} asChild>
                <Link href="/login">Log in</Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          )}
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </header>
  );
}
