export function appendChildren(el: HTMLElement, ...children: HTMLElement[]) {
  children.forEach((c) => {
    el.appendChild(c);
  });
}

export function setStyle(
  el: HTMLElement,
  styles: Partial<CSSStyleDeclaration>,
) {
  Object.entries(styles).forEach(([s, v]) => {
    el.style[s] = v;
  });
}

export function g<K extends keyof HTMLElementTagNameMap>({
  tag,
  className,
  children,
  text,
  styles,
  attrs,
}: {
  tag: K;
  className?: string;
  children?: HTMLElement[];
  text?: string;
  styles?;
  attrs?: Record<string, string>;
}): HTMLElement {
  const t: HTMLElement = document.createElement(tag);
  if (className) {
    t.className = className;
  }
  if (text) {
    t.innerText = text;
  }
  if (styles) {
    Object.entries(styles).forEach(([s, v]) => {
      t.style[s] = v;
    });
  }
  if (attrs) {
    Object.entries(attrs).forEach(([a, v]) => {
      t.setAttribute(a, v);
    });
  }
  if (Array.isArray(children) && children.length > 0) {
    appendChildren(t, ...children);
  }
  return t;
}

export function emptyElem(el: HTMLElement) {
  el.innerHTML = '';
  return el;
}
