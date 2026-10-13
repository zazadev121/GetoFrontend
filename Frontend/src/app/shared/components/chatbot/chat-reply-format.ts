import { Language } from '../../../core/services/translation.service';

export interface ChatPageLink {
  path: string;
  label: string;
}

const internalPath = /\/(?:auth\/register|dashboard|news(?:\/\d+)?|vacancies(?:\/\d+)?)(?=$|[\s)\]*.,!?;:])/g;

function isStandalonePath(text: string, index: number): boolean {
  return index === 0 || !/[\w.:/]/.test(text[index - 1]);
}

function pageName(path: string, language: Language): string {
  const ka = language === 'ka';
  if (path.startsWith('/vacancies/')) return ka ? 'ვაკანსიის გვერდი' : 'the vacancy page';
  if (path === '/vacancies') return ka ? 'ვაკანსიების გვერდი' : 'the Vacancies page';
  if (path.startsWith('/news/')) return ka ? 'სიახლის გვერდი' : 'the news post';
  if (path === '/news') return ka ? 'სიახლეების გვერდი' : 'the News page';
  if (path === '/auth/register') return ka ? 'რეგისტრაციის გვერდი' : 'the registration page';
  return ka ? 'პირადი კაბინეტი' : 'your dashboard';
}

function linkLabel(path: string, language: Language): string {
  const ka = language === 'ka';
  if (path.startsWith('/vacancies/')) return ka ? 'ვაკანსიის ნახვა' : 'View vacancy';
  if (path === '/vacancies') return ka ? 'ვაკანსიების ნახვა' : 'View vacancies';
  if (path.startsWith('/news/')) return ka ? 'სიახლის ნახვა' : 'View news post';
  if (path === '/news') return ka ? 'სიახლეების ნახვა' : 'View news';
  if (path === '/auth/register') return ka ? 'რეგისტრაცია' : 'Register';
  return ka ? 'პირად კაბინეტში გადასვლა' : 'Open dashboard';
}

export function formatChatReply(reply: string, language: Language): { content: string; links: ChatPageLink[] } {
  const paths = new Set<string>();
  for (const match of reply.matchAll(internalPath)) {
    if (isStandalonePath(reply, match.index)) paths.add(match[0]);
  }

  const content = reply
    .replace(/\[([^\]\n]+)\]\((\/[^)]+)\)/g, '$1')
    .replace(/^\s*[*-]\s+/gm, '• ')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/\*|`|__/g, '')
    .replace(internalPath, (path, index, text) => isStandalonePath(text, index) ? pageName(path, language) : path)
    .trim();

  return {
    content,
    links: [...paths].map(path => ({ path, label: linkLabel(path, language) }))
  };
}
