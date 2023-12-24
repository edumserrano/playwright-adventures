// The window.__fakeNow global variable needs to be set
// before this script is executed.
const fakeNow = window.__fakeNow;

Date = class extends Date {
  constructor(...args) {
    if (args.length === 0) {
      super(fakeNow);
    } else {
      super(...args);
    }
  }
}

// Override Date.now() to start from fakeNow
const __DateNowOffset = fakeNow - Date.now();
const __DateNow = Date.now;
Date.now = () => __DateNow() + __DateNowOffset;
