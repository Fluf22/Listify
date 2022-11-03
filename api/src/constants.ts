export const prismaUserProfileIncludeQuery = {
  profile: { select: { firstName: true, lastName: true } },
};

export const MAIL_WORKER = 'mail-worker';

export const X_CAUDEX_KEY = 'X-Caudex-Key';

export enum ROLES {
  Admin = 'ADMIN',
  User = 'USER',
}
