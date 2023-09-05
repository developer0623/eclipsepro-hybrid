export namespace FloatingLabels {
  export function floatingLabelContent(
    container: HTMLElement,
    isAvailableJobs: boolean
  ) {
    let children = isAvailableJobs
      ? container.getElementsByClassName('td-griditem')
      : container.getElementsByClassName('as-td-griditem');
    let visibleElements = [];
    let rowsLenght = children.length;
    for (let index = 0; index < rowsLenght; index++) {
      let currentElement = children[index];
      let result = isElementInViewport(
        container,
        currentElement,
        isAvailableJobs
      );
      if (result['status']) {
        result['element'] = currentElement;
        visibleElements.push(result);
      }
    }
    let visibleElementsCount = visibleElements.length;
    for (let index = 0; index < visibleElementsCount; index++) {
      let currentElementObject = visibleElements[index];
      floatLabel(container, currentElementObject, isAvailableJobs);
    }
  }

  function isElementInViewport(
    parent: HTMLElement,
    element: Element,
    isAvailableJobs: boolean
  ) {
    let elementRect = element.getBoundingClientRect();
    let parentRect = parent.getBoundingClientRect();
    let parentRectTop = parentRect.top;
    let parentRectBottom = parentRect.bottom;
    let elementRectTop = elementRect.top;
    let elementRectBottom = elementRect.bottom;
    let elementRectHeight = elementRect.height;
    let objElementWithStatus = {} as { status: boolean; type: number };
    objElementWithStatus['status'] = false;
    if (isAvailableJobs) {
      if (elementRectHeight <= 50) {
        objElementWithStatus['status'] = false;
        objElementWithStatus['type'] = 5;
        return objElementWithStatus;
      } else {
        if (
          elementRectTop >= parentRectTop &&
          elementRectBottom <= parentRectBottom
        ) {
          // element starts inside viewport and ends inside viewport
          objElementWithStatus['status'] = true;
          objElementWithStatus['type'] = 4;
          return objElementWithStatus;
        }

        if (
          elementRectTop < parentRectTop &&
          elementRectBottom > parentRectBottom
        ) {
          // element starts before viewport and ends after viewport
          objElementWithStatus['status'] = true;
          objElementWithStatus['type'] = 1;
          return objElementWithStatus;
        }
        if (
          elementRectTop < parentRectTop &&
          elementRectBottom > parentRectTop &&
          elementRectBottom <= parentRectBottom
        ) {
          // element starts before viewport and ends in viewport
          objElementWithStatus['status'] = true;
          objElementWithStatus['type'] = 2;
          return objElementWithStatus;
        }
        if (
          elementRectTop >= parentRectTop &&
          elementRectTop < parentRectBottom &&
          elementRectBottom > parentRectBottom
        ) {
          // element starts inside viewport and ends after viewport
          objElementWithStatus['status'] = true;
          objElementWithStatus['type'] = 3;
          return objElementWithStatus;
        }
      }
    } else {
      if (elementRectHeight <= 100) {
        objElementWithStatus['status'] = false;
        objElementWithStatus['type'] = 5;
        return objElementWithStatus;
      } else {
        if (
          elementRectTop >= parentRectTop &&
          elementRectBottom <= parentRectBottom
        ) {
          // element starts inside viewport and ends inside viewport
          objElementWithStatus['status'] = true;
          objElementWithStatus['type'] = 4;
          return objElementWithStatus;
        }

        if (
          elementRectTop < parentRectTop &&
          elementRectBottom > parentRectBottom
        ) {
          // element starts before viewport and ends after viewport
          objElementWithStatus['status'] = true;
          objElementWithStatus['type'] = 1;
          return objElementWithStatus;
        }
        if (
          elementRectTop < parentRectTop &&
          elementRectBottom > parentRectTop &&
          elementRectBottom <= parentRectBottom
        ) {
          // element starts before viewport and ends in viewport
          objElementWithStatus['status'] = true;
          objElementWithStatus['type'] = 2;
          return objElementWithStatus;
        }
        if (
          elementRectTop >= parentRectTop &&
          elementRectTop < parentRectBottom &&
          elementRectBottom > parentRectBottom
        ) {
          // element starts inside viewport and ends after viewport
          objElementWithStatus['status'] = true;
          objElementWithStatus['type'] = 3;
          return objElementWithStatus;
        }
      }
    }
    return objElementWithStatus;
  }

  function floatLabel(
    container: HTMLElement,
    elementObject: { type: number; element: HTMLElement; status: boolean },
    isAvailableJobs: boolean
  ) {
    let elementType = elementObject['type'];
    let element = elementObject['element'];
    let elementRect = element.getBoundingClientRect();
    let contaienrRect = container.getBoundingClientRect();
    let children = element.children;
    let spanElement = children[0] as HTMLElement;
    let contentHeight = spanElement.clientHeight;

    switch (elementType) {
      case 1: {
        let elemStartPosition = contaienrRect.top;
        let elemEndPosition = contaienrRect.bottom;
        let elementCurrentHeight = contaienrRect.bottom - contaienrRect.top;
        let top =
          contaienrRect.top -
          elementRect.top +
          (elementCurrentHeight - contentHeight) / 2;
        alignContentCenterPosition(top, spanElement, element, isAvailableJobs);
        break;
      }
      case 2: {
        let elemStartPosition = contaienrRect.top;
        let elemEndPosition = elementRect.bottom;
        let elementHeight = elementRect.bottom - elementRect.top;
        let elementCurrentHeight = elemEndPosition - elemStartPosition;
        let flag = contaienrRect.top - elementRect.top;
        let top = flag - 10 + (elementCurrentHeight - contentHeight) / 2; // 10 is temparary value to fix overflow content to next block
        //if(!isAvailableJobs)spanElement.style.setProperty("bottom", "2px");
        alignContentCenterPosition(top, spanElement, element, isAvailableJobs);
        break;
      }
      case 3: {
        let elemStartPosition = elementRect.top;
        let elemEndPosition = contaienrRect.bottom;
        let elementCurrentHeight = elemEndPosition - elemStartPosition;
        let top = (elementCurrentHeight - contentHeight) / 2;
        if (top < 0) {
          top = elementCurrentHeight / 2;
          //top = -(top);
        }
        //if(!isAvailableJobs)spanElement.style.setProperty("bottom", "");
        alignContentCenterPosition(top, spanElement, element, isAvailableJobs);
        break;
      }
      case 4:
        let elemStartPosition = elementRect.top;
        let elemEndPosition = elementRect.bottom;
        let elementCurrentHeight = elemEndPosition - elemStartPosition;
        let top = elementCurrentHeight / 2;
        if (isAvailableJobs) {
          alignContentCenterPosition(
            top,
            spanElement,
            element,
            isAvailableJobs
          );
        } else {
          let children = element.children;
          let spanElement = children[0] as HTMLElement;
          element.style.position = 'initial';
          spanElement.style.position = 'initial';
          spanElement.style.setProperty('top', '0px');
          spanElement.style.setProperty('padding', '1px');
          spanElement.style.transitionDuration = '0.0s';
        }
        break;
      default:
        let children = element.children;
        spanElement = children[0] as HTMLElement;
        element.style.position = 'initial';
        spanElement.style.position = 'initial';
        spanElement.style.setProperty('top', '0px');
        spanElement.style.setProperty('padding', '1px');
        spanElement.style.transitionDuration = '0.0s';
        break;
    }
  }

  // Align label content to center alignment.

  function alignContentCenterPosition(
    top: number,
    spanElement: HTMLElement,
    element: HTMLElement,
    isAvailableJobs: boolean
  ) {
    element.style.position = 'relative';
    spanElement.style.position = 'absolute';
    spanElement.style.setProperty('top', top + 'px');
    spanElement.style.setProperty('margin-left', '0px');
    spanElement.style.setProperty('margin-right', '0px');
    if (!isAvailableJobs) {
      spanElement.style.padding = '1px';
      let spanWidth = spanElement.clientWidth;
      let parentWidth = element.clientWidth;
      let currentWidth = parentWidth - spanWidth;
      let caliclatedPadding = currentWidth / 2;
      spanElement.style.setProperty('right', caliclatedPadding + 'px');
      spanElement.style.setProperty('left', caliclatedPadding + 'px');
      spanElement.style.transitionDuration = '0.0s';
    } else {
      spanElement.style.padding = '1px';
      spanElement.style.setProperty('right', 0 + 'px');
      spanElement.style.setProperty('left', 0 + 'px');
      spanElement.style.transitionDuration = '0.0s';
    }
  }
}
