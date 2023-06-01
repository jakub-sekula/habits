"use client";
import React from "react";
import { useAuth, AuthContextType } from "./AuthContext";
import Link from "next/link";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import styles from "./Header.module.css";
import clsx from "clsx";
import { usePathname } from "next/navigation";

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
    <header>
      <NavigationMenu.Root className="w-screen h-min bg-sky-50 relative">
        <NavigationMenu.List className="flex w-full">
          <NavigationMenu.Item className="flex-grow w-full">
            <NavLink href="/">Home</NavLink>
          </NavigationMenu.Item>
          <div className="flex-grow flex w-full bg-yellow-600 justify-center">
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
            <NavigationMenu.Item className={"flex-grow w-full bg-blue-200"}>
              <div className="bg-red-400 z-50 w-fit ml-auto relative">

              <NavigationMenu.Trigger className={clsx(styles.navItem)}>
                {`Logged in as ${currentUser.displayName}`}
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className=" bg-orange-400 absolute w-full">
                <ul>
                  <li className=" w-full">
                    <Link href="/profile" className=" w-full block py-2 px-3 bg-slate-400 hover:bg-slate-500">Profile</Link>
                  </li>
                  <li className="w-full block bg-slate-400 hover:bg-slate-500">
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
            <NavigationMenu.Item className={"flex-grow w-full bg-blue-200 flex justify-end"}>
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
