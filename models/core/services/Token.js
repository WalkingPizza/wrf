(function () {
  angular.module(APP).service("$token", tokenService);

  function tokenService($http, $core) {
    var self = this;

    self.generateGuestAuthToken = function () {
      return $http.get($core.api("v1") + "token");
    };

    self.createNewCustomToken = function (payload, expiration) {
      return new Promise(function (resolve, reject) {
        if (!payload || !expiration) reject("Missing params");
        $http
          .post($core.api("v1") + "token", {
            payload: payload,
            expiration: expiration,
          })
          .then(function (tokenResponse) {
            resolve(tokenResponse.data);
          })
          .catch(function (tokenErrorResponse) {
            reject(tokenErrorResponse);
          });
      });
    };

    self.validateToken = function (token) {
      return new Promise(function (resolve, reject) {
        if (!token || token === "") reject("Missing params");
        $http
          .post($core.api("v1") + "token/check", {
            token: token,
          })
          .then(function (checkTokenResponse) {
            reolve(checkTokenResponse);
          })
          .catch(function (checkTokenErrorResponse) {
            reject(checkTokenErrorResponse);
          });
      });
    };
  }
})();
