export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** Error carrying the HTTP status so the router can apply the ADR 0002 Q2 taxonomy. */
export async function httpError(providerId: string, res: Response): Promise<Error> {
  const body = await res.text().catch(() => '');
  return Object.assign(new Error(`[${providerId}] HTTP ${res.status}: ${body.slice(0, 200)}`), {
    status: res.status,
  });
}
