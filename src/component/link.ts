import { emptyElem, g } from '../core/dom';
import { ClsPrefix } from '../core/constant';
import { differencePx, px2Int } from '../util/util';
import { DataStore } from '../core/data-store';

function getStartLeft(el: HTMLElement): number {
  return px2Int(el.style.left);
}

function getEndLeft(el: HTMLElement): number {
  return px2Int(el.style.left) + el.getBoundingClientRect().width;
}

export class Link {
  el: HTMLElement;
  startPos: {
    left: number;
    top: number;
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
    this.el.addEventListener('contextmenu', (evt) => {
      evt.preventDefault();
    });
  }

  render() {
    emptyElem(this.el);
    const { fromEl, toEl } = this.options;
    const vd = differencePx(toEl.style.top, fromEl.style.top);
    const vDistance = Math.abs(vd);
    if (this.startAtRight && !this.endAtRight) {
      if (vd > 0) {
        this.drawZA(fromEl, toEl, { vDistance });
      } else {
        this.drawAS(toEl, fromEl, { vDistance });
      }
    } else if (!this.startAtRight && this.endAtRight) {
      if (vd > 0) {
        this.drawSA(fromEl, toEl, { vDistance });
      } else {
        this.drawAZ(toEl, fromEl, { vDistance });
      }
    } else if (this.startAtRight && this.endAtRight) {
      if (vd > 0) {
        this.drawDA(fromEl, toEl, { vDistance });
      } else {
        this.drawAD(toEl, fromEl, { vDistance });
      }
    } else {
      // !this.startAtRight && !this.endAtRight
      if (vd > 0) {
        this.drawCA(fromEl, toEl, { vDistance });
      } else {
        this.drawAC(toEl, fromEl, { vDistance });
      }
    }
  }

  private drawZA(
    topEl: HTMLElement,
    bottomEl: HTMLElement,
    { vDistance }: { vDistance: number },
  ) {
    const {
      linkHoverThick,
      linkStartMin,
      arrowSize,
      lineHeight,
      taskHeight,
    } = this.store.config;
    this.startPos = {
      left: getEndLeft(topEl),
      top: px2Int(topEl.style.top) + taskHeight / 2 - linkHoverThick / 2,
    };
    const hDistance = differencePx(bottomEl.style.left, this.startPos.left);
    if (hDistance < 2 * linkStartMin - linkHoverThick) {
      this.drawLine('f')(linkStartMin, 0)
        .drawLine()(0, lineHeight / 2 + linkHoverThick, -linkHoverThick, 0)
        .drawLine()(
          -(-hDistance + 2 * linkStartMin),
          0,
          linkHoverThick,
          -linkHoverThick,
        )
        .drawLine()(0, vDistance - lineHeight / 2 + linkHoverThick)
        .drawLine('l')(linkStartMin - arrowSize, 0, 0, -linkHoverThick);
    } else {
      this.drawLine('f')(hDistance / 2 + linkHoverThick, 0)
        .drawLine()(0, vDistance + linkHoverThick, -linkHoverThick, 0)
        .drawLine('l')(hDistance / 2 - arrowSize, 0, 0, -linkHoverThick);
    }
    this.drawPosArrow(
      this.startPos.left,
      this.startPos.top - arrowSize + linkHoverThick / 2,
    );
  }

  private drawAZ(
    topEl: HTMLElement,
    bottomEl: HTMLElement,
    { vDistance }: { vDistance: number },
  ) {
    const {
      linkHoverThick,
      linkStartMin,
      arrowSize,
      lineHeight,
      taskHeight,
    } = this.store.config;
    this.startPos = {
      left: getEndLeft(topEl),
      top: px2Int(topEl.style.top) + taskHeight / 2 - linkHoverThick / 2,
    };
    const hDistance = differencePx(bottomEl.style.left, this.startPos.left);
    this.drawNegArrow(
      this.startPos.left - arrowSize,
      this.startPos.top - arrowSize + linkHoverThick / 2,
    );
    if (hDistance < 2 * linkStartMin - linkHoverThick) {
      this.drawLine('f')(linkStartMin - arrowSize, 0, arrowSize, 0)
        .drawLine()(0, lineHeight / 2 + linkHoverThick, -linkHoverThick, 0)
        .drawLine()(
          -(-hDistance + 2 * linkStartMin),
          0,
          linkHoverThick,
          -linkHoverThick,
        )
        .drawLine()(0, vDistance - lineHeight / 2 + linkHoverThick)
        .drawLine('l')(linkStartMin, 0, 0, -linkHoverThick);
    } else {
      this.drawLine('f')(
        hDistance / 2 + linkHoverThick - arrowSize,
        0,
        arrowSize,
        0,
      )
        .drawLine()(0, vDistance + linkHoverThick, -linkHoverThick, 0)
        .drawLine('l')(hDistance / 2, 0, 0, -linkHoverThick);
    }
  }

  private drawSA(
    topEl: HTMLElement,
    bottomEl: HTMLElement,
    { vDistance }: { vDistance: number },
  ) {
    const {
      linkHoverThick,
      linkStartMin,
      arrowSize,
      lineHeight,
      taskHeight,
    } = this.store.config;
    this.startPos = {
      left: getStartLeft(topEl),
      top: px2Int(topEl.style.top) + taskHeight / 2 - linkHoverThick / 2,
    };
    const hDistance = differencePx(
      bottomEl.getBoundingClientRect().right,
      topEl.getBoundingClientRect().left,
    );
    if (hDistance <= -2 * linkStartMin + linkHoverThick) {
      this.drawLine('f')(hDistance / 2 - linkHoverThick, 0)
        .drawLine()(0, vDistance + linkHoverThick)
        .drawLine('l')(
        hDistance / 2 + arrowSize,
        0,
        linkHoverThick,
        -linkHoverThick,
      );
    } else {
      this.drawLine('f')(-linkStartMin, 0)
        .drawLine()(0, lineHeight / 2 + linkHoverThick)
        .drawLine()(hDistance + 2 * linkStartMin, 0, 0, -linkHoverThick)
        .drawLine()(
          0,
          vDistance - lineHeight / 2 + linkHoverThick,
          -linkHoverThick,
          0,
        )
        .drawLine('l')(
        -linkStartMin + arrowSize,
        0,
        linkHoverThick,
        -linkHoverThick,
      );
    }
    this.drawNegArrow(
      this.startPos.left - 2 * arrowSize,
      this.startPos.top - arrowSize + linkHoverThick / 2,
    );
  }

  private drawAS(
    topEl: HTMLElement,
    bottomEl: HTMLElement,
    { vDistance }: { vDistance: number },
  ) {
    const {
      linkHoverThick,
      linkStartMin,
      arrowSize,
      lineHeight,
      taskHeight,
    } = this.store.config;
    this.startPos = {
      left: getStartLeft(topEl),
      top: px2Int(topEl.style.top) + taskHeight / 2 - linkHoverThick / 2,
    };
    const hDistance = differencePx(
      bottomEl.getBoundingClientRect().right,
      topEl.getBoundingClientRect().left,
    );
    this.drawPosArrow(
      this.startPos.left - arrowSize,
      this.startPos.top - arrowSize + linkHoverThick / 2,
    );
    if (hDistance <= -2 * linkStartMin + linkHoverThick) {
      this.drawLine('f')(
        hDistance / 2 - linkHoverThick + arrowSize,
        0,
        -arrowSize,
        0,
      )
        .drawLine()(0, vDistance + linkHoverThick)
        .drawLine('l')(hDistance / 2, 0, linkHoverThick, -linkHoverThick);
    } else {
      this.drawLine('f')(-linkStartMin + arrowSize, 0, -arrowSize, 0)
        .drawLine()(0, lineHeight / 2 + linkHoverThick)
        .drawLine()(hDistance + 2 * linkStartMin, 0, 0, -linkHoverThick)
        .drawLine()(
          0,
          vDistance - lineHeight / 2 + linkHoverThick,
          -linkHoverThick,
          0,
        )
        .drawLine('l')(-linkStartMin, 0, linkHoverThick, -linkHoverThick);
    }
  }

  private drawDA(
    topEl: HTMLElement,
    bottomEl: HTMLElement,
    { vDistance }: { vDistance: number },
  ) {
    const {
      linkHoverThick,
      linkStartMin,
      arrowSize,
      taskHeight,
    } = this.store.config;
    this.startPos = {
      left: getEndLeft(topEl),
      top: px2Int(topEl.style.top) + taskHeight / 2 - linkHoverThick / 2,
    };
    const hDistance = differencePx(
      bottomEl.getBoundingClientRect().right,
      topEl.getBoundingClientRect().right,
    );
    if (hDistance < 0) {
      this.drawLine('f')(linkStartMin, 0)
        .drawLine()(0, vDistance + linkHoverThick, -linkHoverThick, 0)
        .drawLine('l')(
        hDistance - linkStartMin + arrowSize,
        0,
        linkHoverThick,
        -linkHoverThick,
      );
    } else {
      this.drawLine('f')(hDistance + linkStartMin, 0)
        .drawLine()(0, vDistance + linkHoverThick, -linkHoverThick, 0)
        .drawLine('l')(
        -linkStartMin + arrowSize,
        0,
        linkHoverThick,
        -linkHoverThick,
      );
    }
    this.drawNegArrow(
      this.startPos.left - 2 * arrowSize,
      this.startPos.top - arrowSize + linkHoverThick / 2,
    );
  }

  private drawAD(
    topEl: HTMLElement,
    bottomEl: HTMLElement,
    { vDistance }: { vDistance: number },
  ) {
    const {
      linkHoverThick,
      linkStartMin,
      arrowSize,
      taskHeight,
    } = this.store.config;
    this.startPos = {
      left: getEndLeft(topEl),
      top: px2Int(topEl.style.top) + taskHeight / 2 - linkHoverThick / 2,
    };
    const hDistance = differencePx(
      bottomEl.getBoundingClientRect().right,
      topEl.getBoundingClientRect().right,
    );
    this.drawNegArrow(
      this.startPos.left - arrowSize,
      this.startPos.top - arrowSize + linkHoverThick / 2,
    );
    if (hDistance < 0) {
      this.drawLine('f')(linkStartMin - arrowSize, 0, arrowSize, 0)
        .drawLine()(0, vDistance + linkHoverThick, -linkHoverThick, 0)
        .drawLine('l')(
        hDistance - linkStartMin,
        0,
        linkHoverThick,
        -linkHoverThick,
      );
    } else {
      this.drawLine('f')(hDistance + linkStartMin - arrowSize, 0, arrowSize, 0)
        .drawLine()(0, vDistance + linkHoverThick, -linkHoverThick, 0)
        .drawLine('l')(-linkStartMin, 0, linkHoverThick, -linkHoverThick);
    }
  }

  private drawCA(
    topEl: HTMLElement,
    bottomEl: HTMLElement,
    { vDistance }: { vDistance: number },
  ) {
    const {
      linkHoverThick,
      linkStartMin,
      arrowSize,
      taskHeight,
    } = this.store.config;
    this.startPos = {
      left: getStartLeft(topEl),
      top: px2Int(topEl.style.top) + taskHeight / 2 - linkHoverThick / 2,
    };
    const hDistance = differencePx(bottomEl.style.left, topEl.style.left);
    if (hDistance < 0) {
      this.drawLine('f')(hDistance - linkStartMin, 0)
        .drawLine()(0, vDistance + linkHoverThick)
        .drawLine('l')(linkStartMin - arrowSize, 0, 0, -linkHoverThick);
    } else {
      this.drawLine('f')(-linkStartMin, 0)
        .drawLine()(0, vDistance + linkHoverThick)
        .drawLine('l')(
        hDistance + linkStartMin - arrowSize,
        0,
        0,
        -linkHoverThick,
      );
    }
    this.drawPosArrow(
      this.startPos.left,
      this.startPos.top - arrowSize + linkHoverThick / 2,
    );
  }

  private drawAC(
    topEl: HTMLElement,
    bottomEl: HTMLElement,
    { vDistance }: { vDistance: number },
  ) {
    const {
      linkHoverThick,
      linkStartMin,
      arrowSize,
      taskHeight,
    } = this.store.config;
    this.startPos = {
      left: getStartLeft(topEl),
      top: px2Int(topEl.style.top) + taskHeight / 2 - linkHoverThick / 2,
    };
    const hDistance = differencePx(bottomEl.style.left, topEl.style.left);
    this.drawPosArrow(
      this.startPos.left - arrowSize,
      this.startPos.top - arrowSize + linkHoverThick / 2,
    );
    if (hDistance < 0) {
      this.drawLine('f')(hDistance - linkStartMin + arrowSize, 0, -arrowSize, 0)
        .drawLine()(0, vDistance + linkHoverThick)
        .drawLine('l')(linkStartMin, 0, 0, -linkHoverThick);
    } else {
      this.drawLine('f')(-linkStartMin + arrowSize, 0, -arrowSize, 0)
        .drawLine()(0, vDistance + linkHoverThick)
        .drawLine('l')(hDistance + linkStartMin, 0, 0, -linkHoverThick);
    }
  }

  /**
   * @param invokeIndex
   * // @param x
   * // @param y
   * // @param shiftX shift the start pointer before start drawing
   * // @param shiftY shift the start pointer before start drawing
   */
  drawLine = (invokeIndex: 'f' | 'l' = null) => (
    x: number,
    y: number,
    shiftX = 0,
    shiftY = 0,
  ) => {
    this.startPos.left += shiftX;
    this.startPos.top += shiftY;
    this.el.appendChild(
      this.d(this.startPos.left, this.startPos.top, x, y, invokeIndex),
    );
    this.startPos.left += x;
    this.startPos.top += y;
    return this;
  };

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
   * @param x 水平方向移动距离
   * @param y 竖直方向移动距离
   * @param invokeIndex
   */
  private d(
    left: number,
    top: number,
    x: number,
    y: number,
    invokeIndex: 'f' | 'l' | null,
  ) {
    const { linkHoverThick, linkThick } = this.store.config;
    // if ((x === 0 && y === 0) || (x !== 0 && y !== 0)) {
    //   throw Error(`Cannot draw this line： ${JSON.stringify({x,y})}`);
    // }
    let realLeft;
    let realTop;
    let width;
    let height: number;
    const paddingStyles: Partial<CSSStyleDeclaration> = {
      paddingTop: `${linkHoverThick / 2 - linkThick / 2}px`,
      paddingRight: `${linkHoverThick / 2 - linkThick / 2}px`,
      paddingBottom: `${linkHoverThick / 2 - linkThick / 2}px`,
      paddingLeft: `${linkHoverThick / 2 - linkThick / 2}px`,
    };
    if (x < 0) {
      // <-
      realLeft = left + x;
      width = -x;
      realTop = top;
      height = linkHoverThick;
      switch (invokeIndex) {
        case 'f':
          paddingStyles.paddingRight = '0px';
          break;
        case 'l':
          paddingStyles.paddingLeft = '0px';
          break;
      }
    } else if (x > 0) {
      // ->
      realLeft = left;
      width = x;
      realTop = top;
      height = linkHoverThick;
      switch (invokeIndex) {
        case 'f':
          paddingStyles.paddingLeft = '0px';
          break;
        case 'l':
          paddingStyles.paddingRight = '0px';
          break;
      }
    }
    if (y < 0) {
      // ^
      realLeft = left;
      width = linkHoverThick;
      realTop = top + y;
      height = -y;
    } else if (y > 0) {
      // v
      realLeft = left;
      width = linkHoverThick;
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
        ...paddingStyles,
      },
      children: [
        g({
          tag: 'div',
          className: `${ClsPrefix}-link-inner`,
        }),
      ],
    });
  }
}
