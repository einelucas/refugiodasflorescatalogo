/* Protege /admin/* — exceto a própria tela de login. */
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/admin/((?!login).*)"],
};
