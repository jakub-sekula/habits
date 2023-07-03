"use client";
import { useAuth, AuthContextType } from "@/components/AuthContext";
import clsx from "clsx";
import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  linkWithPopup,
  reauthenticateWithCredential,
  unlink,
  updatePassword,
} from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as Form from "@radix-ui/react-form";
import * as Toast from "@radix-ui/react-toast";

import { useForm } from "react-hook-form";
import styles from "./page.module.css";
import slugify from "slugify";
import { BsFacebook, BsGithub, BsGoogle } from "react-icons/bs";
import PasswordInput from "@/components/PasswordInput";
import { checkProviderIdExists } from "@/lib/utils";

type userDetailsFormData = {
  firstName?: string;
  lastName?: string;
  image?: string;
  email?: string;
  username?: string;
  timezone?: string;
};

type changePasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  });

  const { auth, currentUser } = useAuth() as AuthContextType;
  const [error, setError] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const timerRef = useRef(0);
  useEffect(() => {
    const ref = timerRef.current;
    return () => clearTimeout(ref);
  }, []);

  const { register: registerDetails, handleSubmit: handleSubmitDetails } =
    useForm<userDetailsFormData>({
      defaultValues: {
        firstName: currentUser?.displayName?.split(" ")[0] || "",
        lastName: currentUser?.displayName?.split(" ")[1] || "",
        image: currentUser?.photoURL || "",
        email: currentUser?.email || "",
        username: slugify(currentUser?.displayName || "").toLowerCase(),
        timezone: "London",
      },
    });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    getValues: getValuesPassword,
    watch: watchPassword,
    formState: { errors: errorsPassword },
    reset: resetPasswordForm,
  } = useForm<changePasswordFormData>({});

  const userDetailsSubmit = handleSubmitDetails(async (data) => {
    try {
      console.log(data);
      // const token = currentUser && (await currentUser.getIdToken());
      // if (!token) throw Error("Not authorized");
      // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/habits`, {
      //   method: "POST",
      //   headers: new Headers({
      //     Authorization: `Bearer ${token}`,
      //     "Content-type": "application/json",
      //   }),
      //   body: JSON.stringify(data),
      // });
      // console.log(data);
      // const habit = await res.json();
    } catch (e) {
      console.log(e);
      setError(e);
      setOpen(true);
    }
  });

  const changePasswordSubmit = handleSubmitPassword(async (data) => {
    try {
      if (!currentUser) return;
      console.log(data);
      const credential = await EmailAuthProvider.credential(
        currentUser.email as string,
        getValuesPassword("currentPassword")
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, getValuesPassword("newPassword"));
      resetPasswordForm();
      setMessage("Password changed successfully!");
      setOpen(true);

      console.log("Password changed successfully");
    } catch (e) {
      console.log(e);
      setError(e);
      setOpen(true);
    }
  });

  useEffect(() => {
    console.log(currentUser);
  }, [currentUser]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = currentUser && (await currentUser.getIdToken());
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
          headers: new Headers({
            Authorization: `Bearer ${token}`,
          }),
        });
        console.log(await res.json());
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <>
      {currentUser?.isAnonymous ? (
        <button
          onClick={() => {
            linkWithPopup(currentUser, new GoogleAuthProvider());
          }}
          className={clsx("button")}
        >
          Link accounts
        </button>
      ) : null}
      {/* Profile */}
      <section className={clsx(styles.sectionContainer)}>
        <h2 className={clsx(styles.sectionHeading)}>Profile</h2>

        <h3 className="input-label mb-2">Profile image</h3>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentUser?.photoURL ?? ""}
          alt="Profile image"
          width={100}
          height={100}
          className={clsx("w-32 h-32 rounded-full shadow-inner mb-4")}
        />
        <Form.Root
          onSubmit={userDetailsSubmit}
          className="grid md:grid-cols-2 gap-4"
        >
          <Form.Field className="flex flex-col gap-1 w-full " name="name">
            <Form.Label className={clsx("input-label")}>First name</Form.Label>
            <Form.Control asChild>
              <input
                {...registerDetails("firstName")}
                placeholder="First name"
                defaultValue={currentUser.displayName?.split(" ")[0]}
                className={clsx("input-field")}
              />
            </Form.Control>
          </Form.Field>
          <Form.Field className="flex flex-col gap-1 w-full " name="name">
            <Form.Label className={clsx("input-label")}>Last name</Form.Label>
            <Form.Control asChild>
              <input
                {...registerDetails("lastName")}
                placeholder="Last name"
                defaultValue={currentUser.displayName?.split(" ")[1]}
                className={clsx("input-field")}
              />
            </Form.Control>
          </Form.Field>
          <Form.Field className="flex flex-col gap-1 w-full " name="name">
            <Form.Label className={clsx("input-label")}>Email</Form.Label>
            <Form.Control asChild>
              <input
                {...registerDetails("email")}
                disabled
                placeholder="Email"
                defaultValue={currentUser?.email ?? ""}
                className={clsx("input-field")}
              />
            </Form.Control>
          </Form.Field>
          <Form.Field className="flex flex-col gap-1 w-full " name="name">
            <Form.Label className={clsx("input-label")}>Username</Form.Label>
            <Form.Control asChild>
              <input
                {...registerDetails("username")}
                placeholder="Last name"
                defaultValue={slugify(
                  currentUser?.displayName ?? ""
                ).toLowerCase()}
                className={clsx("input-field")}
              />
            </Form.Control>
          </Form.Field>
          <div>
            <span className={clsx("input-label")}>Account ID</span>
            <div className={clsx("input-field disabled")}>
              {currentUser.uid}
            </div>
          </div>
          <div>
            <span className={clsx("input-label")}>Role</span>
            <div className={clsx("input-field disabled")}>User</div>
          </div>
          <Form.Field className="flex flex-col gap-1 w-full " name="name">
            <Form.Label className={clsx("input-label")}>Timezone</Form.Label>
            <Form.Control asChild>
              <select
                {...registerDetails("timezone")}
                placeholder="Timezone"
                defaultValue={"London"}
                className={clsx("input-field")}
              >
                <option>London</option>
                <option>New York</option>
                <option>Melbourne</option>
                <option>Tokyo</option>
              </select>
            </Form.Control>
          </Form.Field>
          <Form.Submit className="button self-end col-span-full">
            Update details
          </Form.Submit>
        </Form.Root>
      </section>

      {/* Change password */}
      <section className={clsx(styles.sectionContainer)}>
        <h2 className={clsx(styles.sectionHeading)}>Change password</h2>
        <Form.Root
          onSubmit={changePasswordSubmit}
          className="grid md:grid-cols-2 gap-4"
        >
          <Form.Field
            className="flex flex-col gap-1 w-full col-span-full "
            name="name"
          >
            <Form.Label className={clsx("input-label")}>
              Current password
            </Form.Label>
            <Form.Control asChild>
              <PasswordInput
                register={registerPassword("currentPassword", {
                  required: true,
                })}
              />
            </Form.Control>
          </Form.Field>
          <Form.Field className="flex flex-col gap-1 w-full " name="name">
            <Form.Label className={clsx("input-label")}>
              New password
            </Form.Label>
            <Form.Control asChild>
              <PasswordInput
                register={registerPassword("newPassword", { required: true })}
              />
            </Form.Control>
          </Form.Field>
          <Form.Field className="flex flex-col gap-1 w-full " name="name">
            <Form.Label className={clsx("input-label")}>
              Confirm new password
            </Form.Label>
            <Form.Control asChild>
              <PasswordInput
                error={errorsPassword.confirmPassword}
                register={registerPassword("confirmPassword", {
                  required: true,
                  validate: (value: string) => {
                    if (watchPassword("newPassword") != value) {
                      return "Your passwords do no match";
                    }
                  },
                })}
              />
            </Form.Control>
          </Form.Field>
          <input type="hidden" name="username" value={currentUser.uid} />

          <Form.Submit className="button self-end col-span-full">
            Update password
          </Form.Submit>
        </Form.Root>
      </section>

      {/* Social accounts */}
      <section className={clsx(styles.sectionContainer)}>
        <h2 className={clsx(styles.sectionHeading)}>Social accounts</h2>
        <div className="flex flex-col gap-2">
          {checkProviderIdExists(currentUser.providerData, "google.com") ? (
            <button
              className={"button"}
              onClick={async () => {
                await unlink(currentUser, "google.com");
              }}
            >
              <BsGithub size={24} /> Unlink from Google
            </button>
          ) : (
            <button
              className={"button"}
              onClick={async () => {
                await linkWithPopup(currentUser, new GoogleAuthProvider());
              }}
            >
              <BsGithub size={24} /> Link with Google
            </button>
          )}
          {checkProviderIdExists(currentUser.providerData, "github.com") ? (
            <button
              className={"button"}
              onClick={async () => {
                await unlink(currentUser, "github.com");
              }}
            >
              <BsGithub size={24} /> Unlink from Github
            </button>
          ) : (
            <button
              className={"button"}
              onClick={async () => {
                await linkWithPopup(currentUser, new GithubAuthProvider());
              }}
            >
              <BsGithub size={24} /> Link with Github
            </button>
          )}
          {checkProviderIdExists(currentUser.providerData, "facebook.com") ? (
            <button
              className={"button"}
              onClick={async () => {
                await unlink(currentUser, "facebook.com");
              }}
            >
              <BsGithub size={24} /> Unlink from Facebook
            </button>
          ) : (
            <button
              className={"button"}
              onClick={async () => {
                await linkWithPopup(currentUser, new FacebookAuthProvider());
              }}
            >
              <BsGithub size={24} /> Link with Facebook
            </button>
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section className={clsx(styles.sectionContainer)}>
        <h2 className={clsx(styles.sectionHeading)}>Danger zone</h2>
      </section>
      <pre className="max-w-3xl w-full break-words whitespace-break-spaces">
        {JSON.stringify(currentUser, null, 2)}
      </pre>
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
      {!!message ? (
        <Toast.Provider swipeDirection="right">
          <Toast.Root
            className="bg-green-100 rounded-md shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] p-[15px] grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-[15px] items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
            open={open}
            onOpenChange={setOpen}
          >
            <Toast.Title className="[grid-area:_title] mb-[5px] font-medium text-slate12 text-[15px]">
              Success
            </Toast.Title>
            <Toast.Description asChild>
              <p>{message}</p>
            </Toast.Description>
            <Toast.Action
              className="[grid-area:_action]"
              asChild
              altText="Goto schedule to undo"
            >
              <button className="inline-flex items-center justify-center rounded font-medium text-xs px-[10px] leading-[25px] h-[25px] bg-green2 text-green11 shadow-[inset_0_0_0_1px] shadow-green7 hover:shadow-[inset_0_0_0_1px] hover:shadow-green-500 focus:shadow-[0_0_0_2px] focus:shadow-green8">
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
