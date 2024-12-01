import { Resend } from 'resend';
import { singleton } from '~/singleton.server';

// Hard-code a unique key, so we can look up the client when this module gets re-imported
const resend = singleton('resend', () => new Resend(process.env.RESEND_API_KEY));

export { resend };
