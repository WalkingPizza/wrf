angular.module("viaggiApp").config(configPlatform);

function configPlatform(
  $anchorScrollProvider,
  $qProvider,
  $mdIconProvider,
  $mdDateLocaleProvider,
  $cookiesProvider,
  ScrollBarsProvider,
  $locationProvider,
  $httpProvider,
  $mdThemingProvider,
  ChartJsProvider,
  $urlRouterProvider,
  $provide,
  $mdAriaProvider
) {
  $anchorScrollProvider.disableAutoScrolling();

  $qProvider.errorOnUnhandledRejections(false);

  $urlRouterProvider.otherwise(function ($injector, $location) {
    $injector.invoke([
      "$state",
      function ($state) {
        $state.go("other.error");
      },
    ]);
  });

  $locationProvider.html5Mode(true);
  $httpProvider.defaults.headers.common["Content-Type"] = "application/json";

  $mdDateLocaleProvider.months = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];
  $mdDateLocaleProvider.shortMonths = [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Sett",
    "Ott",
    "Nov",
    "Dic",
  ];
  $mdDateLocaleProvider.days = [
    "Domenica",
    "Lunedi",
    "Martedi",
    "Mercoledi",
    "Giovedi",
    "Venerdi",
    "Sabato",
  ];
  $mdDateLocaleProvider.shortDays = ["Do", "Lu", "Ma", "Me", "Gio", "Ve", "Sa"];
  $mdDateLocaleProvider.firstDayOfWeek = 1;
  $mdDateLocaleProvider.formatDate = function (date) {
    return date ? moment(date).format("DD/MM/YY") : "";
    // return date ? date.toLocaleDateString('it-IT', { day : '2-digit' , month : '2-digit' , year : '2-digit' }) : '';
  };

  $mdAriaProvider.disableWarnings();

  $mdIconProvider.defaultIconSet("assets/css/mdi.svg");

  ScrollBarsProvider.defaults = {
    scrollButtons: {
      scrollAmount: "auto", // scroll amount when button pressed
      enable: false,
    },
    scrollInertia: 400, // adjust however you want
    axis: "y", // enable 2 axis scrollbars by default,
    theme: "dark",
    autoHideScrollbar: false,
  };

  // textAngular custom options
  $provide.decorator("taOptions", [
    "$delegate",
    function (taOptions) {
      taOptions.classes = {
        focussed: "",
        toolbar: "ta-toolbar",
        toolbarGroup: "ta-button-group",
        toolbarButton: "md-icon-button",
        toolbarButtonActive: "md-accent",
        disabled: "disabled",
        textEditor: "ta-text-editor",
        htmlEditor: "md-input",
      };

      return taOptions;
    },
  ]);

  // textAngular custom icons
  $provide.decorator("taTools", [
    "$delegate",
    function (taTools) {
      taTools.h1.display = '<md-button aria-label="Heading 1">H1</md-button>';
      taTools.h2.display = '<md-button aria-label="Heading 2">H2</md-button>';
      taTools.h3.display = '<md-button aria-label="Heading 3">H3</md-button>';
      taTools.p.display = '<md-button aria-label="Paragraph">P</md-button>';
      taTools.pre.display = '<md-button aria-label="Pre">pre</md-button>';
      taTools.quote.display =
        '<md-button class="md-icon-button" aria-label="Quote"><md-icon md-font-set="material-icons">format_quote</md-icon></md-button>';
      taTools.bold.display =
        '<md-button class="md-icon-button" aria-label="Bold"><md-icon md-font-set="material-icons">format_bold</md-icon></md-button>';
      taTools.italics.display =
        '<md-button class="md-icon-button" aria-label="Italic"><md-icon md-font-set="material-icons">format_italic</md-icon></md-button>';
      taTools.underline.display =
        '<md-button class="md-icon-button" aria-label="Underline"><md-icon md-font-set="material-icons">format_underlined</md-icon></md-button>';
      taTools.ul.display =
        '<md-button class="md-icon-button" aria-label="Buletted list"><md-icon md-font-set="material-icons">format_list_bulleted</md-icon></md-button>';
      taTools.ol.display =
        '<md-button class="md-icon-button" aria-label="Numbered list"><md-icon md-font-set="material-icons">format_list_numbered</md-icon></md-button>';
      taTools.undo.display =
        '<md-button class="md-icon-button" aria-label="Undo"><md-icon md-font-set="material-icons">undo</md-icon></md-button>';
      taTools.redo.display =
        '<md-button class="md-icon-button" aria-label="Redo"><md-icon md-font-set="material-icons">redo</md-icon></md-button>';
      taTools.justifyLeft.display =
        '<md-button class="md-icon-button" aria-label="Align left"><md-icon md-font-set="material-icons">format_align_left</md-icon></md-button>';
      taTools.justifyRight.display =
        '<md-button class="md-icon-button" aria-label="Align right"><md-icon md-font-set="material-icons">format_align_right</md-icon></md-button>';
      taTools.justifyCenter.display =
        '<md-button class="md-icon-button" aria-label="Align center"><md-icon md-font-set="material-icons">format_align_center</md-icon></md-button>';
      taTools.justifyFull.display =
        '<md-button class="md-icon-button" aria-label="Justify"><md-icon md-font-set="material-icons">format_align_justify</md-icon></md-button>';
      taTools.clear.display =
        '<md-button class="md-icon-button" aria-label="Clear formatting"><md-icon md-font-set="material-icons">format_clear</md-icon></md-button>';
      taTools.html.display =
        '<md-button class="md-icon-button" aria-label="Show HTML"><md-icon md-font-set="material-icons">code</md-icon></md-button>';
      taTools.insertLink.display =
        '<md-button class="md-icon-button" aria-label="Insert link"><md-icon md-font-set="material-icons">insert_link</md-icon></md-button>';
      taTools.addLink.display =
        '<md-button class="md-icon-button" aria-label="Insert link"><md-icon md-font-set="material-icons">insert_link</md-icon></md-button>';
      taTools.addLink.display =
        '<md-button class="md-icon-button" aria-label="Insert link"><md-icon md-font-set="material-icons">insert_link</md-icon></md-button>';
      taTools.insertMedia.display =
        '<md-button class="md-icon-button" aria-label="Insert photo"><md-icon md-font-set="material-icons">insert_photo</md-icon></md-button>';
      taTools.embedYoutube.display =
        '<md-button class="md-icon-button" aria-label="Insert YouTube embed"><md-icon md-font-set="material-icons">videocam</md-icon></md-button>';
      return taTools;
    },
  ]);

  $provide.decorator("taOptions", [
    "taRegisterTool",
    "taSelection",
    "$delegate",
    "$media",
    "$filter",
    "$mdDialog",
    function (
      taRegisterTool,
      taSelection,
      taOptions,
      $media,
      $filter,
      $mdDialog
    ) {
      taRegisterTool("embedYoutube", {
        iconclass: "embed-youtube",
        action: function (promise) {
          var $editor = this.$editor();

          var dialog = $mdDialog
            .prompt()
            .title("Embed video YouTube")
            .textContent("Inserisci ID del video da embeddare")
            .ariaLabel("Embed video YouTube")
            .required(true)
            .ok("Inserisci")
            .cancel("Annulla");

          function addIframe(id) {
            if (id !== "" && id !== undefined && id !== null) {
              $editor.displayElements.text.trigger("focus");
              $editor.wrapSelection(
                "insertHtml",
                '<div class="video-embed"><img class="yt-video-embed" data-video-id="' +
                  id +
                  '" src="http://img.youtube.com/vi/' +
                  id +
                  '/0.jpg"></div>',
                true
              );
            }
          }

          $mdDialog.show(dialog).then(function (id) {
            addIframe(id);
          });

          return false;
        },
      });

      /**
       * Insert media button
       */
      taRegisterTool("insertMedia", {
        iconclass: "insert-media",
        action: function (promise, restoreSelection) {
          var $editor = this.$editor();

          // Text selected?
          var text = window.getSelection().toString();

          $media.openModal(false, false, function (data) {
            var data = data[0];

            if (data) {
              if (data.media_mime_type.indexOf("image") !== -1) {
                var src = $filter("media")(data.media_nome, "medium");
                restoreSelection();
                $editor.wrapSelection(
                  "insertHtml",
                  '<img src="' +
                    src +
                    '" alt="' +
                    data.media_nome +
                    '" title="' +
                    data.media_nome +
                    '">'
                );
                promise.resolve();
              } else {
                var src = $filter("media")(data.media_nome, "full");

                if (!text) {
                  text = prompt("Inserisci il testo del link:");
                }

                restoreSelection();
                $editor.wrapSelection(
                  "insertHtml",
                  '<a href="' +
                    src +
                    '" target="_blank" title="' +
                    data.media_nome +
                    '">' +
                    text +
                    "</a>"
                );
                promise.resolve();
              }
            }
          });

          return false;
        },
      });

      /**
       * Insert link external/internal
       */
      taRegisterTool("addLink", {
        iconclass: "insert-link",
        action: function (promise, restoreSelection) {
          var $editor = this.$editor();
          var el = window.getSelection().anchorNode.parentNode;

          var originalData = {
            type: "internal",
            href: "",
            text: window.getSelection().toString(),
            nofollow: false,
            blank: false,
          };

          // Check if element is already a link
          if (el.nodeName === "A") {
            var href = el.getAttribute("href");

            if (href !== undefined && href !== null) {
              originalData.href = href;
              originalData.text = el.innerText;

              if (href.indexOf("/") > 0) {
                if (el.getAttribute("rel")) {
                  originalData.nofollow = true;
                }

                if (el.getAttribute("target")) {
                  originalData.blank = true;
                }
              }
            }
          }

          $media.addLink(originalData, function (data) {
            restoreSelection();

            if (el.nodeName === "A") {
              el.setAttribute("href", originalData.href);

              el.innerHTML = originalData.text;

              if (originalData.nofollow) {
                el.setAttribute("rel", "nofollow");
              }

              if (originalData.blank) {
                el.setAttribute("target", "_blank");
              }
            } else {
              var element = document.createElement("a");

              element.setAttribute("href", originalData.href);

              if (originalData.nofollow) {
                element.setAttribute("rel", "nofollow");
              }

              if (originalData.blank) {
                element.setAttribute("target", "_blank");
              }

              element.appendChild(document.createTextNode(originalData.text));
              window.getSelection().getRangeAt(0).deleteContents();
              window.getSelection().getRangeAt(0).insertNode(element);
            }

            promise.resolve();
          });

          return false;
        },
        activeState: function () {
          return this.$editor().queryCommandState("bold");
        },
      });

      return taOptions;
    },
  ]);
}
