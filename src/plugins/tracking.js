export default {
  install(Vue, options = {}) {
    const config = {
      siteId: options.id || "1",
      defaultStatus: options.status || "active",
      debug: options.debug || false,
      titleCheckMaxWait: 2000,
      titleCheckInterval: 100
    };

    const log = (...args) => config.debug && console.log('[Tracker]', ...args);

    const initializeTracking = () => {
      if (window.kntrTracking) return;

      window.kntrTracking = {
        getOrCreateCookie: function (cookieName, isSessionCookie = false) {
          let cookieValue = this.getCookie(cookieName);
          if (!cookieValue) {
            cookieValue = this.generateUniqueId();
            let cookieSettings = `path=/; SameSite=None; Secure;`;
            if (!isSessionCookie) {
              const expirationDate = new Date();
              expirationDate.setFullYear(expirationDate.getFullYear() + 1);
              cookieSettings += `expires=${expirationDate.toUTCString()};`;
            }
            document.cookie = `${cookieName}=${cookieValue}; ${cookieSettings}`;
          }
          return cookieValue;
        },

        getCookie: function (name) {
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          return match ? match[2] : null;
        },

        generateUniqueId: function () {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        },

        startTracking: function (trackingId, siteSpecificUserHash = "") {  // Default empty string
          const trackingApiUrl = "https://track.kntr.ir/tracking/" + trackingId;
          const data = {
            url: window.location.href,
            referrer: document.referrer,
            title: document.title,
            platform: navigator.platform,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewPortWidth: window.innerWidth,
            viewPortHeight: window.innerHeight,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            siteSpecificUserHash: siteSpecificUserHash,  // Will be empty string if not provided
            userUniqueId: this.getOrCreateCookie("KontorUserUniqueId"),
            sessionUniqueId: this.getOrCreateCookie("KontorSessionUniqueId", true)
          };

          fetch(trackingApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
          }).catch(error => {
            log('Tracking error:', error);
          });
        }
      };
    };

    const trackWithTitleCheck = (status, initialTitle = null) => {
      const startTime = Date.now();
      const currentTitle = initialTitle || document.title;

      if (initialTitle === null && /[\u0600-\u06FF]/.test(currentTitle)) {
        window.kntrTracking.startTracking(config.siteId, "");  // Explicit empty string
        log('Tracked (initial):', status, 'Title:', currentTitle);
        return;
      }

      const checkTitle = () => {
        const elapsed = Date.now() - startTime;
        const newTitle = document.title;

        if (newTitle !== currentTitle || elapsed > config.titleCheckMaxWait) {
          window.kntrTracking.startTracking(config.siteId, "");  // Explicit empty string
          log('Tracked (after', elapsed, 'ms):', status, 'Title:', newTitle);
        } else {
          setTimeout(checkTitle, config.titleCheckInterval);
        }
      };

      checkTitle();
    };

    // Initialization
    initializeTracking();
    trackWithTitleCheck('initial_load', document.title);

    if (options.router) {
      options.router.afterEach((to) => {
        trackWithTitleCheck(`route:${to.path}`);
      });
    }
  }
};