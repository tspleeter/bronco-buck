/**
 * Stripe mode per deployment. `STRIPE_MODE` is inlined at build time from
 * AWS_BRANCH in next.config.ts: "test" on the `test` branch, "live" otherwise.
 * Safe in client and server code (no secrets here).
 */
export const STRIPE_TEST_MODE = process.env.STRIPE_MODE === "test";

const PUBLISHABLE_KEYS = {
  live: "pk_live_51TYB6eQxnWViL6pk6T03aow2two706HTaMsVMolL13dACQu1M8p4TCnkrJI524FHu9Pnd9qhk8jIdQpYJ9OZLBdm0060sRbsAK",
  test: "pk_test_51TYB6eQxnWViL6pkzkG3hrq7dyR6L2e8qJtaMr4xTd7VxDA63aVkvJh4Nm377hlAznUDYoloO077zdZAkzFXzhkE00PW4sCTa5",
};

export const STRIPE_PUBLISHABLE_KEY = STRIPE_TEST_MODE
  ? PUBLISHABLE_KEYS.test
  : PUBLISHABLE_KEYS.live;

/** SSM SecureString holding the matching secret key. */
export const STRIPE_SECRET_PARAM = STRIPE_TEST_MODE
  ? "/bronco-buck/stripe-secret-key-test"
  : "/bronco-buck/stripe-secret-key";

/** Expected secret-key prefix — guards against a live key on test or vice versa. */
export const STRIPE_SECRET_PREFIX = STRIPE_TEST_MODE ? "sk_test_" : "sk_live_";
