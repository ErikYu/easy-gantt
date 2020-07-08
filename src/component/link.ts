import { emptyElem, g } from '../core/dom';
import { ClsPrefix } from '../core/constant';
import { differencePx, px2Int } from '../util/util';
import { DataStore } from '../core/data-store';

export class Link {
  el: HTMLElement;
  startPos: {
    left: number;
    top: number;
    invokeCount: number;
  };
  private readonly startAtRight: boolean;
  private readonly endAtRight: boolean;
  constructor(
    private options: {
      fromEl: HTMLElement;
      toEl: HTMLElement;
      typing: 'l2l' | 'l2r' | 'r2l' | 'r2r';
      className?: string;
    },
    private store: DataStore,
  ) {
    const { typing, className } = options;
    this.startAtRight = typing.startsWith('r');
    this.endAtRight = typing.endsWith('r');
    this.el = g({
      tag: 'div',
      className: `${ClsPrefix}-link-container${
        className ? ` ${className}` : ''
      }`,
    });
    this.render();
  }

  render() {
    emptyElem(this.el);
    const { fromEl, toEl } = this.options;
    const { store } = this;
    const { linkThick, linkStartMin, arrowSize } = store.config;
    this.startPos = {
      left:
        px2Int(fromEl.style.left) +
        (this.startAtRight ? fromEl.getBoundingClientRect().width : 0),
      top: px2Int(fromEl.style.top) + store.barHeight / 2 - linkThick / 2,
      invokeCount: 0,
    };
    const vDistance = differencePx(toEl.style.top, fromEl.style.top);
    if (this.startAtRight && this.endAtRight) {
      const hDistance = differencePx(
        toEl.getBoundingClientRect().right,
        fromEl.getBoundingClientRect().right,
      );
      if (hDistance < 0) {
        this.drawLine(linkStartMin, 0)
          .drawLine(0, vDistance + linkThick, -linkThick, 0)
          .drawLine(
            hDistance - linkStartMin + arrowSize,
            0,
            linkThick,
            -linkThick,
          );
      } else {
        this.drawLine(hDistance + linkStartMin, 0)
          .drawLine(0, vDistance + linkThick, -linkThick, 0)
          .drawLine(-linkStartMin + arrowSize, 0, linkThick, -linkThick);
      }
      this.drawNegArrow(
        this.startPos.left - 2 * arrowSize,
        this.startPos.top - arrowSize + linkThick / 2,
      );
    } else if (this.startAtRight && !this.endAtRight) {
      const hDistance = differencePx(toEl.style.left, this.startPos.left);
      if (hDistance < 2 * linkStartMin) {
        this.drawLine(linkStartMin, 0)
          .drawLine(0, store.unitHeight / 2 + linkThick, -linkThick, 0)
          .drawLine(-(-hDistance + 2 * linkStartMin), 0, linkThick, -linkThick)
          .drawLine(0, vDistance - store.unitHeight / 2 + linkThick)
          .drawLine(linkStartMin - arrowSize, 0, 0, -linkThick);
      } else {
        this.drawLine(hDistance / 2 + linkThick, 0)
          .drawLine(0, vDistance + linkThick, -linkThick, 0)
          .drawLine(hDistance / 2 - arrowSize, 0, 0, -linkThick);
      }
      this.drawPosArrow(
        this.startPos.left,
        this.startPos.top - arrowSize + linkThick / 2,
      );
    } else if (!this.startAtRight && this.endAtRight) {
      const hDistance = differencePx(
        toEl.getBoundingClientRect().right,
        fromEl.getBoundingClientRect().left,
      );
      if (hDistance <= -2 * linkStartMin) {
        this.drawLine(hDistance / 2 - linkThick, 0)
          .drawLine(0, vDistance + linkThick)
          .drawLine(hDistance / 2 + arrowSize, 0, linkThick, -linkThick);
      } else {
        this.drawLine(-linkStartMin, 0)
          .drawLine(0, store.unitHeight / 2 + linkThick)
          .drawLine(hDistance + 2 * linkStartMin, 0, 0, -linkThick)
          .drawLine(
            0,
            vDistance - store.unitHeight / 2 + linkThick,
            -linkThick,
            0,
          )
          .drawLine(-linkStartMin + arrowSize, 0, linkThick, -linkThick);
      }
      this.drawNegArrow(
        this.startPos.left - 2 * arrowSize,
        this.startPos.top - arrowSize + linkThick / 2,
      );
    } else {
      const hDistance = differencePx(toEl.style.left, fromEl.style.left);
      if (hDistance < 0) {
        this.drawLine(hDistance - linkStartMin, 0)
          .drawLine(0, vDistance + linkThick)
          .drawLine(linkStartMin - arrowSize, 0, 0, -linkThick);
      } else {
        this.drawLine(-linkStartMin, 0)
          .drawLine(0, vDistance + linkThick)
          .drawLine(hDistance + linkStartMin - arrowSize, 0, 0, -linkThick);
      }
      this.drawPosArrow(
        this.startPos.left,
        this.startPos.top - arrowSize + linkThick / 2,
      );
    }
  }

  private drawLine(x: number, y: number, shiftX = 0, shiftY = 0) {
    this.startPos.left += shiftX;
    this.startPos.top += shiftY;
    this.el.appendChild(this.d(this.startPos.left, this.startPos.top, x, y));
    this.startPos.left += x;
    this.startPos.top += y;
    return this;
  }

  private drawPosArrow(left, top) {
    this.el.appendChild(
      g({
        tag: 'div',
        className: `${ClsPrefix}-link-arrow to-right`,
        styles: {
          left: `${left}px`,
          top: `${top}px`,
          borderWidth: `${this.store.config.arrowSize}px`,
        },
      }),
    );
  }

  private drawNegArrow(left, top) {
    this.el.appendChild(
      g({
        tag: 'div',
        className: `${ClsPrefix}-link-arrow to-left`,
        styles: {
          left: `${left}px`,
          top: `${top}px`,
          borderWidth: `${this.store.config.arrowSize}px`,
        },
      }),
    );
  }

  /**
   * draw link line
   * @param left 起始点left
   * @param top 起始点top
   * @param x 距离
   * @param y 距离
   */
  private d(left: number, top: number, x: number, y: number) {
    const { linkThick } = this.store.config;
    // if ((x === 0 && y === 0) || (x !== 0 && y !== 0)) {
    //   throw Error(`Cannot draw this line： ${JSON.stringify({x,y})}`);
    // }
    let realLeft;
    let realTop;
    let width;
    let height: number;
    if (x < 0) {
      realLeft = left + x;
      width = -x;
      realTop = top;
      height = linkThick;
    } else if (x > 0) {
      realLeft = left;
      width = x;
      realTop = top;
      height = linkThick;
    }
    if (y < 0) {
      realLeft = left;
      width = linkThick;
      realTop = top + y;
      height = -y;
    } else if (y > 0) {
      realLeft = left;
      width = linkThick;
      realTop = top;
      height = y;
    }
    return g({
      tag: 'div',
      className: `${ClsPrefix}-link`,
      styles: {
        left: `${realLeft}px`,
        top: `${realTop}px`,
        width: `${width}px`,
        height: `${height}px`,
      },
    });
  }
}
