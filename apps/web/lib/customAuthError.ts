import { CredentialsSignin } from "next-auth";

export class CustomAuthError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}
