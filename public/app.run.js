/* global angular */
angular.module("viaggiApp").run(runPlatform);

function runPlatform(
  $rootScope,
  $mdDialog,
  $transitions,
  $injector,
  $state,
  $location,
  $mdSidenav,
  $mdMenu,
  $interval,
  $mdComponentRegistry,
  $core,
  $api,
  $mdTheming,
  $timeout,
  $http,
  $exceptionHandler,
  $mdToast,
  $cookies,
  $window,
  $auth
) {
  progressLoader();

  var prog = $interval(progressLoader, 500);
  $rootScope.progressLoader = 0;
  $rootScope.$on("mlb:cms:salva", $core.on().save);
  $rootScope.$on("mlb:cms:message", $core.on().message);
  $rootScope.reloadToken = false;

  $transitions.onError({}, stateChangeError);
  $transitions.onStart({}, stateChangeStart);

  $transitions.onSuccess({}, stateChangeSuccess);
  $rootScope.$on("$viewContentLoaded", viewContenLoad);

  $rootScope.$core = $core;

  $rootScope.getSectionPage = function () {
    return $rootScope.sectionPage;
  };

  /**
   *
   *
   *
   * SIDE MENU
   *
   */
  $rootScope.menuIsActiveItem = function (section) {
    if ($state.current && $state.current.params) {
      if ($state.current.params.sectionItem === section) return true;
    }
    return false;
  };

  $rootScope.goToMenu = function (index) {
    var item = $core.env().sections[index];
    if (item.childs) {
      if (item._opened) item._opened = false;
      else item._opened = true;
    } else $state.go(index);
  };

  $rootScope.checkOpenMenu = function (index) {
    var item = $core.env().sections[index];
    if (item.childs) {
      if (
        $rootScope.sectionKey &&
        $rootScope.sectionKey === index &&
        !item._opened
      )
        item._opened = true;
      return item._opened;
    }
  };

  /* Dark an Maintenance modes are handled outside of APP

  $rootScope.darkStatusOn = function () {
    if ($core.env().dark) {
      return true
    } else {
      return false
    }
  }

  $rootScope.maintenanceStatusOn = function () {
    if ($core.env().maintenance) {
      return true
    } else {
      return false
    }
  }

  $rootScope.changeDark = function (ev) {
    $rootScope.dark = $core.env().dark
    $rootScope.maintenance = $core.env().maintenance

    var confirm = $mdDialog.confirm()
      .title('Dark page')
      .textContent('Sei sicuro di voler ' + ($rootScope.dark === 0 ? 'attivare' : 'disattivare') + ' la dark page?')
      .ariaLabel('Sono sicuro')
      .targetEvent(ev)
      .ok('Si, sono sicuro')
      .cancel('No')

    $mdDialog.show(confirm).then(function () {
      var args = {
        table: 'settings',
        fields: ['setting_id', 'setting_value'],
        values: [{
          setting_id: $core.env().global.dark_page.setting_id,
          setting_value: $rootScope.dark === 0 ? 1 : 0
        }]
      }

      $rootScope.dark = $rootScope.dark === 0 ? 1 : 0

      $api.patchSettings({ settings: args }).then(function (response) {
        if (!response.error) {
          $core.emit().save()
          $window.location.reload()
        }
      })
    }, function () {
      $rootScope.dark = $rootScope.dark ? 0 : 1
    })
  }

  $rootScope.changeMaintenance = function (ev) {
    $rootScope.dark = $core.env().dark
    $rootScope.maintenance = $core.env().maintenance

    var confirm = $mdDialog.confirm()
      .title('Maintenance page')
      .textContent('Sei sicuro di voler ' + ($rootScope.maintenance === 0 ? 'attivare' : 'disattivare') + ' la mainenace page?')
      .ariaLabel('Sono sicuro')
      .targetEvent(ev)
      .ok('Si, sono sicuro')
      .cancel('No')

    $mdDialog.show(confirm).then(function () {
      var args = {
        table: 'settings',
        fields: ['setting_id', 'setting_value'],
        values: [{
          setting_id: $core.env().global.maintenance_page.setting_id,
          setting_value: $rootScope.maintenance === 0 ? 1 : 0
        }]
      }

      $api.patchSettings({ settings: args }).then(function (response) {
        if (!response.error) {
          $core.emit().save()
          $window.location.reload()
        }
      })
    }, function () {
      $rootScope.maintenance = $rootScope.maintenance ? 0 : 1
    })
  }
  */

  $rootScope.toggleMenu = function () {
    $mdSidenav("main-menu").toggle();
  };

  $rootScope.isOpenMenu = function () {
    return $mdSidenav("main-menu").isOpen();
  };

  $rootScope.openMenuHead = function ($mdMenu, ev) {
    $mdMenu.open(ev);
  };

  $rootScope.newBookingFromMenu = function (ev) {
    $mdSidenav("side").toggle();
    $injector.get("$booking").openModalAddBooking(ev);
  };

  function progressLoader() {
    if ($rootScope.progressLoader === 100) {
      $interval.cancel(prog);
    } else {
      if ($rootScope.progressLoader <= 90) {
        $rootScope.progressLoader += 10;
      }
    }
  }

  function stateChangeError($transition$) {
    if (
      $transition$.error() &&
      $transition$.error().hasOwnProperty("destination")
    ) {
      return $state.go($transition$.to().name);
    }
  }

  function stateChangeStart(trans) {
    //  Check Token
    if (!$core.userLogin && $auth.isValid()) {
      if ($auth.getData().role_id && $auth.getData().role_id > 3) {
        $auth.removeToken();
      }
    }

    angular.element(".wrapper-page").addClass("state-change");
    $mdComponentRegistry.when("side").then(function () {
      $mdSidenav("side").close();
    });
  }

  function stateChangeSuccess(trans) {
    if (trans.to().params) {
      $rootScope.sectionKey = trans.to().params.sectionKey;
      $rootScope.sectionPage = trans.to().params.sectionPage;
      $rootScope.sectionId = trans.to().params.sectionId;
    }

    angular.element(".wrapper-page").removeClass("state-change");

    angular.element("body").removeClass("loaded");

    $timeout(function () {
      if (!$rootScope.pageLoaded) {
        $rootScope.progressLoader = 100;
        $timeout(function () {
          $rootScope.pageLoaded = true;
          angular.element("#preloader").addClass("loaded");
        });
      }
      angular.element("body").addClass("loaded");
    });
  }
  function viewContenLoad(e) {
    // $rootScope.$core = $core;
  }
}
