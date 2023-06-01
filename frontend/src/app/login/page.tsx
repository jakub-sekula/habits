"use client";
import Link from "next/link";
import styles from "./page.module.css";
import clsx from "clsx";

import { synchronizeWithBackend } from "@/lib/utils";

import { useAuth, AuthContextType } from "@/components/AuthContext";
import { useState, useRef, useEffect } from "react";
import auth from "@/lib/auth";

import * as Form from "@radix-ui/react-form";
import * as Tabs from "@radix-ui/react-tabs";
import * as Toast from "@radix-ui/react-toast";

import { BsGoogle, BsGithub, BsFacebook } from "react-icons/bs";

import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";

import { useRouter } from "next/navigation";
export default function Page() {
  const router = useRouter();
  const { currentUser, login, logout } = useAuth() as AuthContextType;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => {
    const ref = timerRef.current;
    return () => clearTimeout(ref);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      synchronizeWithBackend(auth);
      router.push("/profile");
    } catch (e) {
      console.log(e);
      setError(e);
      setOpen(true);
    }

    setLoading(false);
  }

  return (
    <>
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <h2 className="mt-4 text-3xl text-center tracking-tight font-light :">
            Sign in to your account
          </h2>

          <Tabs.Root className={styles.loginBox} defaultValue="passwordSignIn">
            <Tabs.List className={styles.tabBar}>
              <Tabs.Trigger className={styles.tab} value="passwordSignIn">
                Password sign in
              </Tabs.Trigger>
              <Tabs.Trigger className={styles.tab} value="socialSignIn">
                Social sign in
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content
              value="passwordSignIn"
              className={styles.tabContainer}
            >
              {error ? <pre>{JSON.stringify(error, null, 2)}</pre> : null}
              <Form.Root onSubmit={handleFormSubmit}>
                <Form.Field className="relative" name="email">
                  <div className="flex items-baseline justify-between">
                    <Form.Label className={clsx(styles.formlabel)}>
                      Email
                    </Form.Label>
                    <Form.Message className={styles.error} match="valueMissing">
                      Please enter your email
                    </Form.Message>
                    <Form.Message className={styles.error} match="typeMismatch">
                      Please provide a valid email
                    </Form.Message>
                  </div>
                  <Form.Control asChild>
                    <input
                      className={styles.formField}
                      type="email"
                      required
                      name="email"
                      autoComplete="email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Control>
                </Form.Field>
                <Form.Field className="grid mb-[10px]" name="question">
                  <div className="flex items-baseline justify-between">
                    <Form.Label className={clsx(styles.formlabel)}>
                      Password
                    </Form.Label>
                    <Form.Message className={styles.error} match="valueMissing">
                      Please enter a password
                    </Form.Message>
                  </div>
                  <Form.Control asChild>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.formField}
                    />
                  </Form.Control>
                </Form.Field>
                <Form.Submit asChild>
                  <button type="submit" className={styles.button}>
                    Log in
                  </button>
                </Form.Submit>
              </Form.Root>
              <button
                onClick={async () => {
                  await signInAnonymously(auth);
                  synchronizeWithBackend(auth);
                  router.push("/profile");
                }}
                className={styles.button}
              >
                Log in as guest
              </button>
             
            </Tabs.Content>
            <Tabs.Content value="socialSignIn" className={styles.tabContainer}>
              <button
                onClick={async () => {
                  await signInWithPopup(auth, new GoogleAuthProvider());
                  synchronizeWithBackend(auth);
                }}
                className={styles.button}
              >
                <BsGoogle size={24} /> Sign in with Google
              </button>
              <button
                onClick={async () => {
                  await signInWithPopup(auth, new GithubAuthProvider());
                  synchronizeWithBackend(auth);
                }}
                className={styles.button}
              >
                <BsGithub size={24} /> Sign in with Github
              </button>
              <button
                onClick={async () => {
                  await signInWithPopup(auth, new GoogleAuthProvider());
                  synchronizeWithBackend(auth);
                }}
                className={styles.button}
              >
                <BsFacebook size={24} /> Sign in with Facebook
              </button>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
      {!!error ? (
        <Toast.Provider swipeDirection="right">
          <Toast.Root
            className="bg-red-100 rounded-md shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] p-[15px] grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-[15px] items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
            open={open}
            onOpenChange={setOpen}
          >
            <Toast.Title className="[grid-area:_title] mb-[5px] font-medium text-slate12 text-[15px]">
              {error.name}
            </Toast.Title>
            <Toast.Description asChild>
              <p>{error.code}</p>
            </Toast.Description>
            <Toast.Action
              className="[grid-area:_action]"
              asChild
              altText="Goto schedule to undo"
            >
              <button className="inline-flex items-center justify-center rounded font-medium text-xs px-[10px] leading-[25px] h-[25px] bg-green2 text-green11 shadow-[inset_0_0_0_1px] shadow-green7 hover:shadow-[inset_0_0_0_1px] hover:shadow-red-500 focus:shadow-[0_0_0_2px] focus:shadow-green8">
                Dismiss
              </button>
            </Toast.Action>
          </Toast.Root>
          <Toast.Viewport className="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
        </Toast.Provider>
      ) : null}
    </>
  );
}

