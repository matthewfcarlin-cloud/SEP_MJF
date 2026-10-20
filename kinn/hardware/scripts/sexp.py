"""Tiny S-expression reader/writer for KiCad files."""
import re

_tok = re.compile(r'\s*(\(|\)|"(?:[^"\\]|\\.)*"|[^\s()"]+)', re.S)


class Sym(str):
    """Unquoted atom."""


def _unescape(s):
    return re.sub(r'\\(.)', r'\1', s)


def parse(text):
    stack, cur = [], []
    for m in _tok.finditer(text):
        t = m.group(1)
        if t == '(':
            stack.append(cur)
            cur = []
        elif t == ')':
            done = cur
            cur = stack.pop()
            cur.append(done)
        elif t.startswith('"'):
            cur.append(_unescape(t[1:-1]))
        else:
            cur.append(Sym(t))
    return cur[0]


def _q(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n') + '"'


def dump(x, indent=0):
    if isinstance(x, list):
        inner = [dump(i, indent + 1) for i in x]
        flat = '(' + ' '.join(inner) + ')'
        if len(flat) < 100 and '\n' not in flat:
            return flat
        return '(' + inner[0] + ''.join('\n' + '\t' * (indent + 1) + i for i in inner[1:]) + ')'
    if isinstance(x, Sym):
        return str(x)
    if isinstance(x, bool):
        return 'yes' if x else 'no'
    if isinstance(x, float):
        s = ('%.4f' % x).rstrip('0').rstrip('.')
        return '0' if s in ('-0', '') else s
    if isinstance(x, int):
        return str(x)
    return _q(str(x))


def find(node, key):
    return [c for c in node if isinstance(c, list) and c and c[0] == key]


def find1(node, key):
    r = find(node, key)
    return r[0] if r else None
