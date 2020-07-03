export function appendChildren(el: HTMLElement, ...children: HTMLElement[]) {
  children.forEach((c) => {
    el.appendChild(c);
  });
}

export function g<K extends keyof HTMLElementTagNameMap>({
  tag,
  className,
  children,
  text,
  styles,
}: {
  tag: K;
  className?: string;
  children?: HTMLElement[];
  text?: string;
  styles?;
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
  if (Array.isArray(children) && children.length > 0) {
    appendChildren(t, ...children);
  }
  return t;
}
