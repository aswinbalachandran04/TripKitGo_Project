(function () {
  const AUTH_KEY = "tripkitgo_admin_auth";
  const isLoginPage = window.location.pathname.endsWith("/login.html") || window.location.pathname === "login.html";

  function isAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === "true";
  }

  function enforceRouteGuard() {
    const authed = isAuthenticated();

    // Logged-in user trying to open login.html -> send to Hub
    if (isLoginPage && authed) {
      window.location.replace("index.html");
      return;
    }

    // Logged-out user trying to open any studio page -> send to login.html
    if (!isLoginPage && !authed) {
      window.location.replace("login.html");
    }
  }

  // Run immediately on load and whenever restored from browser back/forward cache
  enforceRouteGuard();
  window.addEventListener("pageshow", enforceRouteGuard);

  // Expose helpers for login and logout
  window.TripKitGoAuth = {
    loginSuccess: function () {
      sessionStorage.setItem(AUTH_KEY, "true");
      window.location.replace("index.html");
    },
    logout: function () {
      sessionStorage.removeItem(AUTH_KEY);
      window.location.replace("login.html");
    }
  };
})();