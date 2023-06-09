import { Auth } from "firebase/auth";

export async function synchronizeWithBackend(auth: Auth) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch("http://localhost:3000/auth/login", {
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
  const pattern = /(?<=^|\s|-)\w/g;
  const initials = str.match(pattern) || [];
  return initials.join('');
}
