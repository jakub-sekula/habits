"use client";
import React from "react";
import { useAuth, AuthContextType } from "./AuthContext";
import Link from "next/link";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as Avatar from "@radix-ui/react-avatar";
import styles from "./Header.module.css";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { getInitials } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";
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
      className={clsx(styles.navItem, "mr-auto w-fit")}
    >
      <Link passHref href={href}>
        {children}
      </Link>
    </NavigationMenu.Link>
  );
}

export default function Header() {
  const { currentUser, logout } = useAuth() as AuthContextType;

  return (
    <header className={styles.header}>
      <NavigationMenu.Root className="w-full h-min relative">
        <NavigationMenu.List className="flex w-full h-16">
          <NavigationMenu.Item className="flex-grow w-full text-xl font-bold items-center flex px-3">
            <Link aria-label="homepage" href="/">
              Habiti.co
            </Link>
          </NavigationMenu.Item>
          <div className="flex justify-center gap-4 ">
            <NavigationMenu.Item>
              <NavLink href="/habits">Habits</NavLink>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavLink href="/trackers">Trackers</NavLink>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavLink href="/statistics">Statistics</NavLink>
            </NavigationMenu.Item>
          </div>

          {currentUser ? (
            <NavigationMenu.Item className={"flex-grow w-full"}>
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
              className={"flex-grow w-full flex justify-end"}
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
