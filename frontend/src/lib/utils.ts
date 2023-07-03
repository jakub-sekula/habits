import { Auth, UserInfo } from "firebase/auth";

export async function synchronizeWithBackend(auth: Auth) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${token}`,
    }),
  });
  const json = await res.json();
  console.log("response from express: ", json);
}

export function getInitials(str: string | null) {
  if (!str) return "A";
  const pattern = /(^|\s|-)(\w)/g;
  const matches = str.match(pattern) || [];
  const initials = matches.map((match) => match.charAt(match.length - 1));
  return initials.join("");
}


export function checkProviderIdExists(providerData: UserInfo[], providerId: string): boolean {
  return providerData.some(entry => entry.providerId === providerId);
}