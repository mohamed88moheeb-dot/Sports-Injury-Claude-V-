import { Protocol, type Fact } from '@/engine/schema';
import hamstringRaw from '@content/protocols/hamstring.json';
import hamstringFacts from '@content/facts/hamstring.json';

export const protocols: Record<string, Protocol> = {
  'hamstring-strain': Protocol.parse(hamstringRaw),
};

export const facts: Record<string, Fact[]> = {
  'hamstring-strain': hamstringFacts.facts as Fact[],
};

export function getProtocol(id: string): Protocol {
  const p = protocols[id];
  if (!p) throw new Error(`unknown protocol ${id}`);
  return p;
}
