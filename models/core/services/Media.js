angular.module("viaggiApp").service("$media", service);

function service($mdDialog, $api, $timeout) {
  var media = this;

  /**
   * Open media modal.
   *
   * @param multiSelection
   * @param callback
   */
  media.openModal = function (multiSelection, onlyImage, callback) {
    if (multiSelection === undefined) {
      multiSelection = false;
    }

    var maxSelection = undefined;

    if (multiSelection !== true && !isNaN(multiSelection)) {
      maxSelection = Number(multiSelection);
    }

    $mdDialog
      .show({
        templateUrl:
          "models/core/directives/views/relatedimages.modal.directives.html",
        locals: {
          maxSelection: maxSelection,
          onlyImage: onlyImage,
        },
        controller: function (
          $scope,
          $filter,
          $api,
          onlyImage,
          $core,
          maxSelection
        ) {
          $scope.maxSelection = maxSelection;
          $scope.onlyImage = onlyImage;

          $scope.mediaList = [];
          $scope.selected = [];

          $scope.offset = 0;
          $scope.cols = 33;
          $scope.inModale = true;

          $scope.isStop = false;
          $scope.isLoading = false;

          $scope.initScroll = function () {
            $timeout(function () {
              angular.element(".scroll-container").scroll(function (e) {
                $timeout(function () {
                  var progress = e.currentTarget.scrollTop;
                  var box = angular.element(".scroll-container").height();
                  var max = angular.element(".scroll-content").height();

                  if (
                    max - progress >= box &&
                    !$scope.isStop &&
                    !$scope.isLoading
                  ) {
                    $scope.isLoading = true;
                    $api
                      .getMedia({ offset: $scope.mediaList.length })
                      .then(function (response) {
                        if (!response.data.error) {
                          $timeout(function () {
                            response.data.data[0].filter(function (m) {
                              $scope.mediaList.push(m);
                            });

                            if (
                              $scope.mediaList.length >= $scope.mediaListTotal
                            ) {
                              $scope.isStop = true;
                            }

                            $timeout(function () {
                              $scope.isLoading = false;
                            }, 1000);
                          });
                        }
                      });
                  }
                }, 200);
              });
            }, 200);
          };

          if ($core.mediaList === undefined) {
            $api.getMedia().then(function (response) {
              var mediaList = response.data.data[0];
              var mediaListTotal = response.data.data[1][0].total;

              $core.mediaList = mediaList;
              $core.mediaListTotal = mediaListTotal;
              $scope.mediaList = $core.mediaList;
              $scope.mediaListTotal = $core.mediaListTotal;
            });
          } else {
            $scope.mediaList = $core.mediaList;
            $scope.mediaListTotal = $core.mediaListTotal;
          }

          /**
           * Check if media is already selected.
           *
           * @param media
           * @returns {boolean}
           */
          $scope.isSelected = function (media) {
            if ($scope.selected.indexOf(media) !== -1) return true;

            return false;
          };

          /**
           * Save selected media.
           *
           * @param media
           */
          $scope.setMedia = function (media) {
            if (
              $scope.maxSelection &&
              $scope.selected.length >= $scope.maxSelection
            )
              return;

            if ($scope.isSelected(media)) {
              var index = $scope.selected.indexOf(media);
              $scope.selected.splice(index, 1);
            } else {
              if (multiSelection) {
                $scope.selected.push(media);
              } else {
                $scope.selected[0] = media;
              }
            }
          };

          $scope.disabledSelection = function (media) {
            if (!multiSelection) {
              if ($scope.selected.length && !$scope.isSelected(media))
                return true;
            }
            return false;
          };

          $scope.confirm = function () {
            $mdDialog.hide($scope.selected);
          };

          $scope.afterUpload = function (media) {
            if (media) {
              $scope.mediaList.unshift(media);
            }
          };

          /**
           * Close modal without apply changes.
           */
          $scope.close = function () {
            $mdDialog.cancel();
          };

          $scope.filtroMediaType = function (media) {
            if ($scope.onlyImage) {
              if (media.media_mime_type.indexOf("image") != -1) return media;
            } else return media;
          };
        },
      })
      .then(function (data) {
        if (typeof callback == "function") {
          callback(data);
        }
      });
  };

  /**
   * Open link modal.
   *
   * @param callback
   */
  media.addLink = function (originalData, callback) {
    $mdDialog
      .show({
        templateUrl: "models/travel/views/addlink.editor.html",
        controller: function ($scope, $http, $core) {
          "use strict";

          if (originalData) {
            $scope.link = originalData;
          } else {
            $scope.link = {
              type: "internal",
              href: "",
              text: "",
              nofollow: false,
              blank: false,
            };
          }

          $scope.internalLinks = [];

          // Load static url
          var sitemap = $core.env().server.homeUrl + "sitemap";
          $http.get(sitemap).then(function (response) {
            var data = response.data;
            data = data.split("\n");

            angular.forEach(data, function (url, index) {
              url = url.replace("\n", "");
              url = url.replace("\r", "");

              if (index !== 0) {
                $scope.internalLinks.push(
                  "/" + url.replace($core.env().server.homeUrl, "")
                );
              } else {
                $scope.internalLinks.push("/");
              }
            });
          });

          $scope.confirm = function () {
            $mdDialog.hide($scope.link);
          };

          $scope.close = function () {
            $mdDialog.cancel();
          };
        },
      })
      .then(function (data) {
        if (typeof callback === "function") {
          callback(data);
        }
      });
  };

  return media;
}
