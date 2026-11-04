// The contact composer: builds a mailto link from what the visitor typed.
// Pure functions, so the link can be tested without a browser.

export const TOPICS = ['internship', 'research', 'freelance', 'just saying hi'];

/** Subject line from the chosen topic and the visitor's name. */
export function composeSubject(topic, name) {
  const who = name.trim();
  const what = topic === 'just saying hi' ? 'Hello' : `${topic[0].toUpperCase()}${topic.slice(1)} inquiry`;
  return who ? `${what} from ${who}` : what;
}

/** mailto: URL with subject and body encoded (RFC 6068). */
export function composeMailto(email, { topic, name, message }) {
  const params = [`subject=${encodeURIComponent(composeSubject(topic, name))}`];
  const body = message.trim();
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}?${params.join('&')}`;
}

/** "22:48" in the given time zone. */
export function localTime(date, timeZone) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone }).format(date);
}
