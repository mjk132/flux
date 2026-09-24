declare module "jsonwebtoken" {
  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string | Buffer,
    options?: {
      expiresIn?: string | number;
      algorithm?: string;
      [key: string]: unknown;
    }
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: {
      algorithms?: string[];
      [key: string]: unknown;
    }
  ): string | object;

  export function decode(
    token: string,
    options?: {
      complete?: boolean;
      json?: boolean;
    }
  ): null | string | { [key: string]: unknown };
}
