export interface FriendlyError {
  title: string;
  hint: string;
  details: string;
}

/** Turns raw server/provider errors into something a person can act on. */
export function toFriendlyError(raw: string): FriendlyError {
  const msg = raw.toLowerCase();
  const make = (title: string, hint: string) => ({ title, hint, details: raw });

  if (msg.includes("402") || msg.includes("credits")) {
    return make(
      "The AI account is out of credits",
      "The OpenRouter account behind this app needs credits for the selected model. Add credits, or set OPENROUTER_MODEL to a model ending in :free."
    );
  }
  if (msg.includes("429") || msg.includes("rate") || msg.includes("quota")) {
    return make(
      "The AI service is busy right now",
      "Too many requests were sent in a short time. Wait about 30 seconds and try again."
    );
  }
  if (msg.includes("401") || msg.includes("api key") || msg.includes("unauthorized")) {
    return make(
      "The API key was rejected",
      "Check that the OPENROUTER_API_KEY environment variable is set correctly, then redeploy or restart."
    );
  }
  if (msg.includes("not a valid model") || (msg.includes("404") && msg.includes("model"))) {
    return make(
      "The selected AI model isn't available",
      "Check the OPENROUTER_MODEL environment variable — the model name may be misspelled or no longer offered."
    );
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return make(
      "The analysis took too long",
      "The AI model didn't answer in time. Try again, or shorten very long requirements."
    );
  }
  if (
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("econnrefused") ||
    msg.includes("internal server error")
  ) {
    return make(
      "Can't reach the analysis server",
      "Check your internet connection and try again. If it keeps happening, the server may be down."
    );
  }
  return make(
    "Something went wrong",
    "The analysis couldn't be completed. Try again in a moment — your text is still here."
  );
}
