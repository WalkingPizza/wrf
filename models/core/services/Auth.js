(function () {
  angular.module(APP).service("$auth", authService);

  function authService($cookies, $window) {
    const self = this;

    const authCookieName = "_auth";

    const token = {
      value: "",
      data: "",
      decoded: {},
      validSignature: false,
    };

    self.getToken = function () {
      return token;
    };

    self.isValid = function () {
      return token.validSignature && !isTokenExpired();
    };

    self.removeToken = function () {
      $cookies.remove(authCookieName);
    };

    self.updateToken = function (newToken) {
      let expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      $cookies.put(authCookieName, newToken, {
        expires: expiryDate,
      });
      setupToken();
    };

    self.getData = function () {
      return token.data;
    };

    self.getAuthCookieName = () => {
      return authCookieName;
    };

    setupToken();

    return self;

    function setupToken() {
      retrieveToken();
      decodeToken();
      getTokenData();
    }

    function retrieveToken() {
      let cookieToken = $cookies.get(authCookieName);
      token.value = cookieToken;
    }

    function getTokenData() {
      token.data = token.decoded.data;
    }

    function decodeToken() {
      try {
        token.decoded = $window.jwt_decode(token.value);
        token.validSignature = true;
      } catch (error) {
        return false;
      }
    }

    function isTokenExpired() {
      return Math.floor(+new Date() / 1000) > token.decoded.exp;
    }
  }
})();
