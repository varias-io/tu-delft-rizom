import pkg from "@slack/bolt";
const { App } = pkg;

export const token = "xoxb-5194334601200-5257291564646-Eie1fpeQbMkbeAuNVbdvavMF"
export const signingSecret = "2ae237533a1feb3ba83dc91e70e79ec7"
export const channel = "C055D7ZGWJV"
export const user = "U0550FJR0UB"

export const app = new App({
    token,
    signingSecret
  });
  