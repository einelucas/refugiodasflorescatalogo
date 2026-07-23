import "next-auth";

declare module "next-auth" {
  interface User {
    papel?: string;
  }
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      papel?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    papel?: string;
  }
}
