export function googleLinkIntentMatches(
  googleCanonicalEmail: string,
  intendedCanonicalEmail: string | null
) {
  return intendedCanonicalEmail === null ||
    googleCanonicalEmail === intendedCanonicalEmail;
}

export function googleCandidateDecision(candidateCount: number) {
  if (candidateCount > 1) return "MERGE_REQUIRED";
  if (candidateCount === 1) return "CONFIRM_LINK";
  return "CREATE_ACCOUNT";
}
