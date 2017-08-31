import zipWith from "../../tools/zipWith";
import createElement, {Element} from "./element";
import createList, {List} from "./list";
import scrollHandler, {ScrollHandler} from "./scrollHandler";

interface UListMethods {

    add(element: Element<any>): UList;
    deHighlight(): UList;
    hide(): UList;
    highlight(): UList;
    moveAndScroll(element: any): void;
    moveToAndHighlightElement(targetElement: any, displaySetting?: string): void;
    prepHorizontal(): UList;
}

export interface UList extends List<Element<any>>, UListMethods {

    children: Array<Element<any>>;
    element: Element<any>;
}

export default (function() {

    let id: number = 1;

    const scroller: ScrollHandler = scrollHandler();
    const methods: UListMethods = {

        add(element: Element<any>): any {

            this.element.appendChild(element);
        },
        deHighlight(): UList {

            this.currentElement().setBackgroundColor(null);

            return this;
        },
        hide(): UList {

            this.forEach((element: Element<any>) => element.hide());

            return this;
        },
        highlight(): UList {

            this.currentElement().setBackgroundColor("tan");

            return this;
        },
        moveAndScroll(element: any): void {

            scroller.moveToIndex(this.currentIndex());

            this.moveToElement(element)
                .forEach((child: Element<any>, index: number) => {

                    scroller.outOfBounds(index) ? child.hide() : child.show();
                });
        },
        moveToAndHighlightElement(targetElement: any, displaySetting: string = "block"): void {

            this.deHighlight();

            if (targetElement) {

                this.moveToElement(targetElement);
            }

            targetElement.display(displaySetting);

            this.highlight(targetElement);
        },
        prepHorizontal(): UList {

            const currentPlusLeftAndRightElements = this.neighbors(1);

            zipWith(currentPlusLeftAndRightElements, ["left", "center", "right"], (element, position) => {

                return element.setAttribute("position", position);
            });

            return this;
        },
    };

    return function(parent?: Element<any>, childNodes: Array<Element<any>> = []): UList {

        const element: Element<any> = parent ? parent : createElement<any>(`Ulist#${id++}`, "ul");
        const children: Array<Element<any>> = parent ? parent.getChildren() : childNodes;
        const list = Object.create(createList(children));

        return Object.assign(list, methods, {

            element,
            children,
        });
    };
}());
