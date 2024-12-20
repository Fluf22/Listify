import { Resend } from 'resend';
import { singleton } from '~/singleton.server';

const EMAIL_FROM = `${process.env.EMAIL_FROM}`;

// Hard-code a unique key, so we can look up the client when this module gets re-imported
const resend = singleton('resend', () => new Resend(process.env.RESEND_API_KEY));

export { EMAIL_FROM, resend };
