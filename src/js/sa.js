/*
* sa  类 bootstrap 框架
* 增加，调整部分JS ，scss 代码
*
* */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery'), require('popper.js')) :
      typeof define === 'function' && define.amd ? define(['exports', 'jquery', 'popper.js'], factory) :
        (factory((global.sa = {}), global.jQuery, global.Popper));
}(this, (function (exports, $, Popper) {
    'use strict'

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

    //定义target 的key 的属性
    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    // 更改 构造器的 key 的属性
    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }

    // 对象key 赋值
    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }

        return obj;
    }

    // 将多个 object 的可枚举的属性或者 sym ，变成同一的property
    function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            var ownKeys = Object.keys(source);

            if (typeof Object.getOwnPropertySymbols === 'function') {
                ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
                    return Object.getOwnPropertyDescriptor(source, sym).enumerable;
                }));
            }

            ownKeys.forEach(function (key) {
                _defineProperty(target, key, source[key]);
            });
        }

        return target;
    }

    function _inheritsLoose(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype);
        subClass.prototype.constructor = subClass;
        subClass.__proto__ = superClass;
    }


    /*
    *
    *  工具
    *
    * */

    var Util = function ($$) {
        var TRANSITION_END = 'transitionend';
        var MAX_UID = 1000000;
        var MILLISECONDS_MULTIPLIER = 1000; // Shoutout AngusCroll (https://goo.gl/pxwQGp)

        function toType(obj) {
            return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
        }

        function getSpecialTransitionEndEvent() {
            return {
                bindType: TRANSITION_END,
                delegateType: TRANSITION_END,
                handle: function handle(event) {
                    if ($$(event.target).is(this)) {
                        return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
                    }

                    return undefined; // eslint-disable-line no-undefined
                }
            };
        }

        //定时器触发 saTransition 事件 , 如果在duration 期间触发了 saTransition 则不超时触发
        function transitionEndEmulator(duration) {
            var _this = this;

            var called = false;
            $$(this).one(Util.TRANSITION_END, function () {
                called = true;
            });
            setTimeout(function () {
                if (!called) {
                    Util.triggerTransitionEnd(_this);
                }
            }, duration);
            return this;
        }

        function setTransitionEndSupport() {
            $$.fn.emulateTransitionEnd = transitionEndEmulator;
            $$.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
        }

        var Util = {
            TRANSITION_END: 'saTransitionEnd',
            //相比 bs ， 可以灵活选择多个元素
            getSelectorFromElement: function getSelectorFromElement(el) {
                var result = [];
                var $el = $(el);

                var selectors = $el.attr('data-target');

                if (!selectors) {
                    selectors = $el.attr('href') || '';
                }

                selectors.split(/,|，|\||\\|\//).forEach(function (element) {
                    if (element.toLowerCase() === 'self') {
                        result.push($el);
                    }

                    try {
                        var $element = $$(document).find(element);
                        if ($element.length > 0) {
                            result.push($element);
                        }
                        //当查找不到元素时 ，无动作
                    } catch (err) {

                    }

                });

                return result;
            },

            isElement: function isElement(obj) {
                return (obj[0] || obj).nodeType;
            },

            // TODO: Remove in v5
            supportsTransitionEnd: function supportsTransitionEnd() {
                return Boolean(TRANSITION_END);
            },

            //清除缓存，实现 css3 动画
            reflow: function reflow(element) {
                return element.offsetHeight;
            },

            //获取多个目标元素
            getTransitionDurationFromElement: function getTransitionDurationFromElement(element) {
                if (!element) {
                    return 0;
                } // Get transition-duration of the element


                var transitionDuration = $$(element).css('transition-duration');
                var floatTransitionDuration = parseFloat(transitionDuration); // Return 0 if element or transition duration is not found

                if (!floatTransitionDuration) {
                    return 0;
                } // If multiple durations are defined, take the first


                transitionDuration = transitionDuration.split(',')[0];
                return parseFloat(transitionDuration) * MILLISECONDS_MULTIPLIER;
            },

            triggerTransitionEnd: function triggerTransitionEnd(element) {
                $$(element).trigger(TRANSITION_END);
            },

            typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
                for (var property in configTypes) {
                    if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
                        var expectedTypes = configTypes[property];
                        var value = config[property];
                        var valueType = value && Util.isElement(value) ? 'element' : toType(value);

                        if (!new RegExp(expectedTypes).test(valueType)) {
                            throw new Error(componentName.toUpperCase() + ": " + ("Option \"" + property + "\" provided type \"" + valueType + "\" ") + ("but expected type \"" + expectedTypes + "\"."));
                        }
                    }
                }
            },

            getMethods: function (config) {
                var res = null;
                if (typeof config === 'string') {
                    res = config.split(/,|，|\||\\|\//);

                } else if (config instanceof Array) {
                    res = config;
                }

                return res;
            }
        };

        setTransitionEndSupport();
        return Util;

    }($);

    var Alert = function ($$) {
        var NAME = 'saAlert';
        var DATA_KEY = 'sa.alert';
        var EVENT_KEY = '.' + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$.fn[NAME];
        var Selector = {
            DISMISS: '[data-dismiss="alert"]'
        };
        var EVENT = {
            CLOSE: "close" + EVENT_KEY,
            CLOSED: "closed" + EVENT_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY,
        };
        var CLASS_NAME = {
            ALERT: 'alert',
            FADE: 'fade',
            SHOW: 'show'
        };

        var alert = function () {
            var alert = function (element) {
                this._element = element;
            }

            var _prop = alert.prototype;

            // 接受alert 触发器或alert
            _prop.close = function ($el) {
                var $alert = this._element;
                var closeEvent;

                if ($el) {
                    $alert = this._getRootElement($el);
                }

                if ($alert) {
                    closeEvent = this._triggerCloseEvent($alert);

                    //判断是否阻止事件
                    if (!closeEvent.isDefaultPrevented()) {
                        this._remove($alert);
                    }
                }
            }

            //删除类，判断是否有动画
            _prop._remove = function ($el) {
                var _this = this;
                var transitionDuration;

                if (!$el.hasClass(CLASS_NAME.FADE)) {
                    this._destroy($el);

                } else {
                    transitionDuration = Util.getTransitionDurationFromElement($el);
                    $el.removeClass(CLASS_NAME.SHOW);

                    $($el).one(Util.TRANSITION_END, function (event) {
                        _this._destroy($el, event);
                    }).emulateTransitionEnd(transitionDuration);
                }
            }

            _prop._destroy = function ($el) {
                this._triggerClosedEvent($el);
                $($el).remove()
            }

            _prop._triggerCloseEvent = function ($el) {
                return this._eventTrigger($el, EVENT.CLOSE);
            }

            _prop._triggerClosedEvent = function ($el) {
                return this._eventTrigger($el, EVENT.CLOSED);
            }

            _prop._eventTrigger = function ($el, eventName) {
                var event = $$.Event();
                $el.trigger(eventName);
                return event;
            }

            //获取根 alert
            _prop._getRootElement = function ($el) {
                var $alert = Util.getSelectorFromElement($el);
                if (!$alert || !$alert.length) {
                    $alert = $$($el).closest('.' + CLASS_NAME.ALERT);
                }
                return $alert.length ? $alert : null;
            }

            alert._handleDismiss = function (alert) {
                return function (event) {
                    if (event) {
                        event.preventDefault();
                    }
                    alert.close(this);
                }

            }

            alert._jQueryInterface = function (config) {
                return this.each(function () {
                    var $element = $$(this);
                    var data = $element.data(DATA_KEY);

                    if (!data) {
                        data = new alert(this);
                        $element.data(DATA_KEY, data);
                    }

                    if (config === 'close') {
                        data[config](this);
                    }
                })
            }

            return alert;
        }();

        $$(document).on(EVENT.CLICK_DATA_API, Selector.DISMISS, alert._handleDismiss(new alert));

        $$.fn[NAME] = alert._jQueryInterface;
        $$.fn[NAME].Constructor = alert;

        $$.fn[NAME].noConflict = function () {
            $$.fn[NAME] = JQUERY_NO_CONFLICT;
            return alert._jQueryInterface;
        };

        return alert;
    }($);

    var Button = function ($$) {
        var NAME = 'saButton';
        var DATA_KEY = 'sa.button';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$.fn[NAME];

        var ClassName = {
            TOGGLE_GROUP: 'toggle-group',
            TOGGLE_BTN: 'toggle-btn',
            ACTIVE: 'active',
            BUTTON: 'btn',
            FOCUS: 'focus'
        };
        var Selector = {
            DATA_TOGGLE: '[data-toggle="button"]',
            TOGGLE_BTN: '.toggle-btn',
        };
        var Event = {
            ACTIVE: 'active' + EVENT_KEY,
            INACTIVE: 'inactive' + EVENT_KEY,
            TOGGLE: 'toggle' + EVENT_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY,
            FOCUS_BLUR_DATA_API: "focus" + EVENT_KEY + DATA_API_KEY + " " + ("blur" + EVENT_KEY + DATA_API_KEY),
        };

        var button = function () {
            var button = function ($el) {
                this._element = $el;
            }

            var _proto = button.prototype;

            _proto.active = function ($el) {
                var tars = this._getTargetElements($el);

                //触发active
                if (tars.length) {
                    if (!this.eventTrigger(Event.ACTIVE).isDefaultPrevented()) {
                        for (var i = 0; i < tars.length; i++) {
                            tars[i].addClass(ClassName.ACTIVE);
                        }
                    }
                }
            }

            _proto.inactive = function ($el) {
                var tars = this._getTargetElements($el);

                //触发inactive
                if (tars.length) {
                    if (!this.eventTrigger(Event.INACTIVE).isDefaultPrevented()) {
                        for (var i = 0; i < tars.length; i++) {
                            tars[i].removeClass(ClassName.ACTIVE);
                        }
                    }
                }
            }

            _proto.toggle = function ($el) {
                var tars = this._getTargetElements($el);

                //触发toggle
                if (tars.length) {
                    if (!this.eventTrigger($el, Event.TOGGLE).isDefaultPrevented()) {
                        for (var i = 0; i < tars.length; i++) {
                            tars[i].toggleClass(ClassName.ACTIVE);
                            //触发 active 或 in active
                            if (tars[i].hasClass(ClassName.ACTIVE)) {
                                tars[i].trigger(Event.ACTIVE);
                                this._updateOther(tars[i]);
                            } else {
                                tars[i].trigger(Event.INACTIVE);
                            }
                        }
                    }
                }
            }

            //更新同一组的状态
            _proto._updateOther = function ($el) {
                //判断是否属于 toggle group
                if($el.parent(ClassName.TOGGLE_GROUP)) {
                    $el.siblings(Selector.DATA_TOGGLE).removeClass(ClassName.ACTIVE);
                }

            }

            _proto._getTargetElements = function ($el) {
                return Util.getSelectorFromElement($el);
            }

            _proto.eventTrigger = function ($el, eventName) {
                var event = $$.Event(eventName);
                $el.trigger(event);
                return event;
            }

            button._jQueryInterface = function (config) {
                return this.each(function () {
                    var data = $$(this).data(DATA_KEY);
                    var methods = Util.getMethods(config);
                    var $this = $$(this);
                    if (!data) {
                        data = new button($this);
                        $this.data(DATA_KEY, data);
                    }

                    //判断config 内的方法是否合法
                    if (methods) {
                        methods.forEach(function (name) {
                            if (data[name] instanceof Function) data[name]($this);
                        })
                    }
                })
            }

            return button;
        }();


        $$(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
            event.preventDefault();
            var $btn = $$(event.target);

            button._jQueryInterface.call($btn, 'toggle');
        })

        $$.fn[NAME] = button._jQueryInterface;

        $$.fn[NAME].noConflict = function () {
            $$.fn[NAME] = JQUERY_NO_CONFLICT;
            return button._jQueryInterface;
        };

        return button;
    }($);

    var Carousel = function ($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'carousel';
        var VERSION = '4.1.1';
        var DATA_KEY = 'sa.carousel';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var ARROW_LEFT_KEYCODE = 37; // KeyboardEvent.which value for left arrow key

        var ARROW_RIGHT_KEYCODE = 39; // KeyboardEvent.which value for right arrow key

        var TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

        var Default = {
            interval: 5000,
            keyboard: true,
            slide: false,
            pause: 'hover',
            wrap: true
        };
        var DefaultType = {
            interval: '(number|boolean)',
            keyboard: 'boolean',
            slide: '(boolean|string)',
            pause: '(string|boolean)',
            wrap: 'boolean'
        };
        var Direction = {
            NEXT: 'next',
            PREV: 'prev',
            LEFT: 'left',
            RIGHT: 'right'
        };
        var Event = {
            SLIDE: "slide" + EVENT_KEY,
            SLID: "slid" + EVENT_KEY,
            KEYDOWN: "keydown" + EVENT_KEY,
            MOUSEENTER: "mouseenter" + EVENT_KEY,
            MOUSELEAVE: "mouseleave" + EVENT_KEY,
            TOUCHEND: "touchend" + EVENT_KEY,
            LOAD_DATA_API: "load" + EVENT_KEY + DATA_API_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            CAROUSEL: 'carousel',
            ACTIVE: 'active',
            SLIDE: 'slide',
            RIGHT: 'carousel-item-right',
            LEFT: 'carousel-item-left',
            NEXT: 'carousel-item-next',
            PREV: 'carousel-item-prev',
            ITEM: 'carousel-item'
        };
        var Selector = {
            ACTIVE: '.active',
            ACTIVE_ITEM: '.active.carousel-item',
            ITEM: '.carousel-item',
            NEXT_PREV: '.carousel-item-next, .carousel-item-prev',
            INDICATORS: '.carousel-indicators',
            DATA_SLIDE: '[data-slide], [data-slide-to]',
            DATA_RIDE: '[data-ride="carousel"]'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Carousel =
          /*#__PURE__*/
          function () {
              function Carousel(element, config) {
                  this._items = null;
                  this._interval = null;
                  this._activeElement = null;
                  this._isPaused = false;
                  this._isSliding = false;
                  this.touchTimeout = null;
                  this._config = this._getConfig(config);
                  this._element = $$$1(element)[0];
                  this._indicatorsElement = $$$1(this._element).find(Selector.INDICATORS)[0];

                  this._addEventListeners();
              } // Getters


              var _proto = Carousel.prototype;

              // Public
              _proto.next = function next() {
                  if (!this._isSliding) {
                      this._slide(Direction.NEXT);
                  }
              };

              _proto.nextWhenVisible = function nextWhenVisible() {
                  // Don't call next when the page isn't visible
                  // or the carousel or its parent isn't visible
                  if (!document.hidden && $$$1(this._element).is(':visible') && $$$1(this._element).css('visibility') !== 'hidden') {
                      this.next();
                  }
              };

              _proto.prev = function prev() {
                  if (!this._isSliding) {
                      this._slide(Direction.PREV);
                  }
              };

              _proto.pause = function pause(event) {
                  if (!event) {
                      this._isPaused = true;
                  }

                  if ($$$1(this._element).find(Selector.NEXT_PREV)[0]) {
                      Util.triggerTransitionEnd(this._element);
                      this.cycle(true);
                  }

                  clearInterval(this._interval);
                  this._interval = null;
              };

              _proto.cycle = function cycle(event) {
                  if (!event) {
                      this._isPaused = false;
                  }

                  if (this._interval) {
                      clearInterval(this._interval);
                      this._interval = null;
                  }

                  if (this._config.interval && !this._isPaused) {
                      this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
                  }
              };

              _proto.to = function to(index) {
                  var _this = this;

                  this._activeElement = $$$1(this._element).find(Selector.ACTIVE_ITEM)[0];

                  var activeIndex = this._getItemIndex(this._activeElement);

                  if (index > this._items.length - 1 || index < 0) {
                      return;
                  }

                  if (this._isSliding) {
                      $$$1(this._element).one(Event.SLID, function () {
                          return _this.to(index);
                      });
                      return;
                  }

                  if (activeIndex === index) {
                      this.pause();
                      this.cycle();
                      return;
                  }

                  var direction = index > activeIndex ? Direction.NEXT : Direction.PREV;

                  this._slide(direction, this._items[index]);
              };

              _proto.dispose = function dispose() {
                  $$$1(this._element).off(EVENT_KEY);
                  $$$1.removeData(this._element, DATA_KEY);
                  this._items = null;
                  this._config = null;
                  this._element = null;
                  this._interval = null;
                  this._isPaused = null;
                  this._isSliding = null;
                  this._activeElement = null;
                  this._indicatorsElement = null;
              }; // Private


              _proto._getConfig = function _getConfig(config) {
                  config = _objectSpread({}, Default, config);
                  Util.typeCheckConfig(NAME, config, DefaultType);
                  return config;
              };

              _proto._addEventListeners = function _addEventListeners() {
                  var _this2 = this;

                  if (this._config.keyboard) {
                      $$$1(this._element).on(Event.KEYDOWN, function (event) {
                          return _this2._keydown(event);
                      });
                  }

                  if (this._config.pause === 'hover') {
                      $$$1(this._element).on(Event.MOUSEENTER, function (event) {
                          return _this2.pause(event);
                      }).on(Event.MOUSELEAVE, function (event) {
                          return _this2.cycle(event);
                      });

                      if ('ontouchstart' in document.documentElement) {
                          // If it's a touch-enabled device, mouseenter/leave are fired as
                          // part of the mouse compatibility events on first tap - the carousel
                          // would stop cycling until user tapped out of it;
                          // here, we listen for touchend, explicitly pause the carousel
                          // (as if it's the second time we tap on it, mouseenter compat event
                          // is NOT fired) and after a timeout (to allow for mouse compatibility
                          // events to fire) we explicitly restart cycling
                          $$$1(this._element).on(Event.TOUCHEND, function () {
                              _this2.pause();

                              if (_this2.touchTimeout) {
                                  clearTimeout(_this2.touchTimeout);
                              }

                              _this2.touchTimeout = setTimeout(function (event) {
                                  return _this2.cycle(event);
                              }, TOUCHEVENT_COMPAT_WAIT + _this2._config.interval);
                          });
                      }
                  }
              };

              _proto._keydown = function _keydown(event) {
                  if (/input|textarea/i.test(event.target.tagName)) {
                      return;
                  }

                  switch (event.which) {
                      case ARROW_LEFT_KEYCODE:
                          event.preventDefault();
                          this.prev();
                          break;

                      case ARROW_RIGHT_KEYCODE:
                          event.preventDefault();
                          this.next();
                          break;

                      default:
                  }
              };

              _proto._getItemIndex = function _getItemIndex(element) {
                  this._items = $$$1.makeArray($$$1(element).parent().find(Selector.ITEM));
                  return this._items.indexOf(element);
              };

              _proto._getItemByDirection = function _getItemByDirection(direction, activeElement) {
                  var isNextDirection = direction === Direction.NEXT;
                  var isPrevDirection = direction === Direction.PREV;

                  var activeIndex = this._getItemIndex(activeElement);

                  var lastItemIndex = this._items.length - 1;
                  var isGoingToWrap = isPrevDirection && activeIndex === 0 || isNextDirection && activeIndex === lastItemIndex;

                  if (isGoingToWrap && !this._config.wrap) {
                      return activeElement;
                  }

                  var delta = direction === Direction.PREV ? -1 : 1;
                  var itemIndex = (activeIndex + delta) % this._items.length;
                  return itemIndex === -1 ? this._items[this._items.length - 1] : this._items[itemIndex];
              };

              _proto._triggerSlideEvent = function _triggerSlideEvent(relatedTarget, eventDirectionName) {
                  var targetIndex = this._getItemIndex(relatedTarget);

                  var fromIndex = this._getItemIndex($$$1(this._element).find(Selector.ACTIVE_ITEM)[0]);

                  var slideEvent = $$$1.Event(Event.SLIDE, {
                      relatedTarget: relatedTarget,
                      direction: eventDirectionName,
                      from: fromIndex,
                      to: targetIndex
                  });
                  $$$1(this._element).trigger(slideEvent);
                  return slideEvent;
              };

              _proto._setActiveIndicatorElement = function _setActiveIndicatorElement(element) {
                  if (this._indicatorsElement) {
                      $$$1(this._indicatorsElement).find(Selector.ACTIVE).removeClass(ClassName.ACTIVE);

                      var nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)];

                      if (nextIndicator) {
                          $$$1(nextIndicator).addClass(ClassName.ACTIVE);
                      }
                  }
              };

              _proto._slide = function _slide(direction, element) {
                  var _this3 = this;

                  var activeElement = $$$1(this._element).find(Selector.ACTIVE_ITEM)[0];

                  var activeElementIndex = this._getItemIndex(activeElement);

                  var nextElement = element || activeElement && this._getItemByDirection(direction, activeElement);

                  var nextElementIndex = this._getItemIndex(nextElement);

                  var isCycling = Boolean(this._interval);
                  var directionalClassName;
                  var orderClassName;
                  var eventDirectionName;

                  if (direction === Direction.NEXT) {
                      directionalClassName = ClassName.LEFT;
                      orderClassName = ClassName.NEXT;
                      eventDirectionName = Direction.LEFT;
                  } else {
                      directionalClassName = ClassName.RIGHT;
                      orderClassName = ClassName.PREV;
                      eventDirectionName = Direction.RIGHT;
                  }

                  if (nextElement && $$$1(nextElement).hasClass(ClassName.ACTIVE)) {
                      this._isSliding = false;
                      return;
                  }

                  var slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);

                  if (slideEvent.isDefaultPrevented()) {
                      return;
                  }

                  if (!activeElement || !nextElement) {
                      // Some weirdness is happening, so we bail
                      return;
                  }

                  this._isSliding = true;

                  if (isCycling) {
                      this.pause();
                  }

                  this._setActiveIndicatorElement(nextElement);

                  var slidEvent = $$$1.Event(Event.SLID, {
                      relatedTarget: nextElement,
                      direction: eventDirectionName,
                      from: activeElementIndex,
                      to: nextElementIndex
                  });

                  if ($$$1(this._element).hasClass(ClassName.SLIDE)) {
                      $$$1(nextElement).addClass(orderClassName);
                      Util.reflow(nextElement);
                      $$$1(activeElement).addClass(directionalClassName);
                      $$$1(nextElement).addClass(directionalClassName);

                      var transitionDuration = Util.getTransitionDurationFromElement(activeElement);
                      $$$1(activeElement).one(Util.TRANSITION_END, function () {
                          $$$1(nextElement).removeClass(directionalClassName + " " + orderClassName).addClass(ClassName.ACTIVE);
                          $$$1(activeElement).removeClass(ClassName.ACTIVE + " " + orderClassName + " " + directionalClassName);
                          _this3._isSliding = false;
                          setTimeout(function () {
                              return $$$1(_this3._element).trigger(slidEvent);
                          }, 0);
                      }).emulateTransitionEnd(transitionDuration);
                  } else {
                      $$$1(activeElement).removeClass(ClassName.ACTIVE);
                      $$$1(nextElement).addClass(ClassName.ACTIVE);
                      this._isSliding = false;
                      $$$1(this._element).trigger(slidEvent);
                  }

                  if (isCycling) {
                      this.cycle();
                  }
              }; // Static


              Carousel._jQueryInterface = function _jQueryInterface(config) {
                  return this.each(function () {
                      var data = $$$1(this).data(DATA_KEY);

                      var _config = _objectSpread({}, Default, $$$1(this).data());

                      if (typeof config === 'object') {
                          _config = _objectSpread({}, _config, config);
                      }

                      var action = typeof config === 'string' ? config : _config.slide;

                      if (!data) {
                          data = new Carousel(this, _config);
                          $$$1(this).data(DATA_KEY, data);
                      }

                      if (typeof config === 'number') {
                          data.to(config);
                      } else if (typeof action === 'string') {
                          if (typeof data[action] === 'undefined') {
                              throw new TypeError("No method named \"" + action + "\"");
                          }

                          data[action]();
                      } else if (_config.interval) {
                          data.pause();
                          data.cycle();
                      }
                  });
              };

              Carousel._dataApiClickHandler = function _dataApiClickHandler(event) {
                  var selector = Util.getSelectorFromElement(this);

                  if (!selector) {
                      return;
                  }

                  var target = $$$1(selector)[0];

                  if (!target || !$$$1(target).hasClass(ClassName.CAROUSEL)) {
                      return;
                  }

                  var config = _objectSpread({}, $$$1(target).data(), $$$1(this).data());

                  var slideIndex = this.getAttribute('data-slide-to');

                  if (slideIndex) {
                      config.interval = false;
                  }

                  Carousel._jQueryInterface.call($$$1(target), config);

                  if (slideIndex) {
                      $$$1(target).data(DATA_KEY).to(slideIndex);
                  }

                  event.preventDefault();
              };

              _createClass(Carousel, null, [{
                  key: "VERSION",
                  get: function get() {
                      return VERSION;
                  }
              }, {
                  key: "Default",
                  get: function get() {
                      return Default;
                  }
              }]);

              return Carousel;
          }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_SLIDE, Carousel._dataApiClickHandler);
        $$$1(window).on(Event.LOAD_DATA_API, function () {
            $$$1(Selector.DATA_RIDE).each(function () {
                var $carousel = $$$1(this);

                Carousel._jQueryInterface.call($carousel, $carousel.data());
            });
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Carousel._jQueryInterface;
        $$$1.fn[NAME].Constructor = Carousel;

        $$$1.fn[NAME].noConflict = function () {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Carousel._jQueryInterface;
        };

        return Carousel;
    }($);
})))