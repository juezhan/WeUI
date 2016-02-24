/// <reference path="zepto.min.js" />
/**
 * Created by jf on 2015/9/11.
 */
$(function () {

    var pageManager = {
        $container: $('.js_container'),
        _pageStack: [],
        _configs: [],
        _defaultPage: null,
        _isGo: false,
        default: function (defaultPage) {
            this._defaultPage = defaultPage;
            return this;
        },
        init: function () {
            var self = this;

            $(window).on('hashchange', function (e) {

                var _isBack = !self._isGo;

                self._isGo = false;
                if (!_isBack) {
                    return;
                }

                var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
                var found = null;
                for (var i = 0, len = self._pageStack.length; i < len; i++) {
                    var stack = self._pageStack[i];
                    if (stack.config.url === url) {
                        found = stack;
                        break;
                    }
                }

                if (found) {
                    found.config.load ? found.config.load() : null;
                    self.back();
                }
                else {
                    goDefault();
                }
            });

            function goDefault() {
                var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
                var page = self._find('url', url) || self._find('name', self._defaultPage);
                self.go(page.name);
                console.log(self._defaultPage);
            }

            goDefault();

            return this;
        },
        push: function (config) {
            this._configs.push(config);
            return this;
        },
        go: function (to) {
            var config = this._find('name', to);
            if (!config) {
                return;
            }
            var ts = this;

            $.get('./view/' + config.name + '.html', function (html) {
                var $html = $(html).addClass('slideIn').addClass(config.name);
                ts.$container.append($html);
                ts._pageStack.push({
                    config: config,
                    dom: $html
                });

                ts._isGo = true;
                location.hash = config.url;

                config.load ? config.load() : null;

                if (!config.isBind) {
                    ts._bind(config);
                }
            });

            return this;
        },
        back: function () {
            var stack = this._pageStack.pop();

            if (!stack) {
                return;
            }

            stack.dom.addClass('slideOut').on('animationend', function () {
                stack.dom.remove();
            }).on('webkitAnimationEnd', function () {
                stack.dom.remove();
            });

            return this;
        },
        _find: function (key, value) {
            var page = null;
            for (var i = 0, len = this._configs.length; i < len; i++) {
                if (this._configs[i][key] === value) {
                    page = this._configs[i];
                    break;
                }
            }
            return page;
        },
        _bind: function (page) {
            var events = page.events || {};
            for (var t in events) {
                for (var type in events[t]) {
                    this.$container.on(type, t, events[t][type]);
                }
            }
            page.isBind = true;
        }
    };

    var home = {
        name: 'home',
        url: '#',
        template: '#tpl_home',
        events: {
            '.js_grid': {
                click: function (e) {
                    var id = $(this).data('id');
                    pageManager.go(id);
                }
            }
        },
        load: function () {
            console.log('LOAD');
        }
    };
    var button = {
        name: 'button',
        url: '#button',
        template: '#tpl_button',
        events: {
            '#myBtn1': {
                click: function (e) {
                    pageManager.go('icons');
                }
            }
        },
        load: function () {
            console.log('button');
        }
    };
    var cell = {
        name: 'cell',
        url: '#cell',
        template: '#tpl_cell',
        events: {
            '#showTooltips': {
                click: function () {
                    toptips({ text: '格式不对', css: 'succress' });
                }
            }
        },
        load: function () {
            console.log('cell');
        }
    };
    var toast = {
        name: 'toast',
        url: '#toast',
        template: '#tpl_toast',
        events: {
            '#showToast': {
                click: function (e) { showToast() }
            },
            '#showLoadingToast': {
                click: function (e) {
                    showLoadingToast({ text: '加载中…' });
                }
            },
            '#showToastOfCallBack': {
                click: function (e) {
                    showLoadingToast({
                        text: '加载中1',
                        callBack: function (t, e) {
                            console.log('加载中 1 Begin');
                            setTimeout(function () {
                                console.log('加载中 1 End');
                                removeTarget(t);

                                showLoadingToast({
                                    text: '加载中2',
                                    callBack: function (t, e) {
                                        console.log('加载中 2 Begin');
                                        setTimeout(function () {
                                            console.log('加载中 2 End');
                                            removeTarget(t);
                                        }, 500);
                                    },
                                    closeDelay: 0
                                });

                            }, 500);
                        },
                        closeDelay: 0
                    });
                }
            }
        }
    };

    var dialog = {
        name: 'dialog',
        url: '#dialog',
        template: '#tpl_dialog',
        events: {
            '#showDialog1': {
                click: function (e) {
                    showDialog({
                        title: '标题',
                        text: '内容',
                        buttons: [
                            {
                                text: '取消',
                                click: function (m, e) {
                                    console.log('取消');
                                }
                            },
                            {
                                text: '按钮3',
                                click: function (m, e) {
                                    console.log('按钮3');
                                }
                            },
                            {
                                text: '确定',
                                css: 'primary',
                                click: function (m, e) {
                                    console.log('确定');
                                }
                            }
                        ]
                    });
                }
            },
            '#showDialog2': {
                click: function (e) {
                    showDialog({
                        title: '标题',
                        text: '内容',
                        buttons: [
                            {
                                text: '确定',
                                css: 'primary',
                                click: function (m, e) {
                                    console.log('确定');
                                }
                            }
                        ]
                    });
                }
            }
        }
    };

    var progress = {
        name: 'progress',
        url: '#progress',
        template: '#tpl_progress',
        events: {
            '#btnStartProgress': {
                click: function () {

                    if ($(this).hasClass('weui_btn_disabled')) {
                        return;
                    }

                    $(this).addClass('weui_btn_disabled');

                    var progress = 0;
                    var $progress = $('.js_progress');

                    function next() {
                        $progress.css({ width: progress + '%' });
                        progress = ++progress % 100;
                        setTimeout(next, 30);
                    }

                    next();
                }
            }
        }
    };
    var msg = {
        name: 'msg',
        url: '#msg',
        template: '#tpl_msg',
        events: {}
    };
    var article = {
        name: 'article',
        url: '#article',
        template: '#tpl_article',
        events: {}
    };
    var actionSheet = {
        name: 'actionsheet',
        url: '#actionsheet',
        template: '#tpl_actionsheet',
        events: {
            '#showActionSheet': {
                click: function () {
                    actions({
                        buttons: [
                                    [
                                        {
                                            text: '这里是一些可选的描述',
                                            label: true
                                        },
                                        {
                                            text: '菜单一',
                                            css: 'primary'
                                        },
                                        {
                                            text: '菜单二',
                                            close: false,
                                            click: function (actions, btn, e) {
                                                showLoadingToast({
                                                    text: '加载中…',
                                                    callBack: function (t, e) {
                                                        setTimeout(function () {
                                                            removeTarget(t);
                                                            showDialog({
                                                                title: '信息',
                                                                text: '加载完成',
                                                                buttons: [
                                                                    {
                                                                        text: '确定',
                                                                        css: 'primary',
                                                                        click: function (m, e) {
                                                                            hideActionSheet(actions);
                                                                        }
                                                                    }
                                                                ]
                                                            });
                                                        }, 5000);
                                                    },
                                                    closeDelay: 0
                                                });
                                            }
                                        },
                                        {
                                            text: '菜单三',
                                            click: function (e) {
                                                pageManager.go('cell');
                                            }
                                        }
                                    ],
                                    [
                                        {
                                            text: '菜单四',
                                        },
                                        {
                                            text: '菜单五'
                                        },
                                        {
                                            text: '菜单六'
                                        }
                                    ],
                                    [
                                        {
                                            text: '取消'
                                        }
                                    ]
                        ]
                    });
                }
            }
        },
        load: function () {
            console.log('actionSheet');
        }
    };
    var icons = {
        name: 'icons',
        url: '#icons',
        template: '#tpl_icons',
        events: {}
    };

    pageManager.push(home)
        .push(button)
        .push(cell)
        .push(toast)
        .push(dialog)
        .push(progress)
        .push(msg)
        .push(article)
        .push(actionSheet)
        .push(icons)
        .default('home')
        .init();



    function actions(params) {
        params = params || {};

        var buttonsHTML = "", cancelButtonsHTML = "";
        if (params.buttons && params.buttons.length > 0) {
            for (var i = 0; i < params.buttons.length; i++) {
                if (params.buttons[i].length > 0) {
                    buttonsHTML += '<div class="weui_actionsheet_menu">';
                    for (var j = 0; j < params.buttons[i].length; j++) {
                        if (params.buttons[i][j].label) {
                            buttonsHTML += '<div class="weui_actionsheet_cell weui_actionsheet_label ' + (params.buttons[i][j].css ? params.buttons[i][j].css : '') + '">' + params.buttons[i][j].text + '</div>';
                        } else {
                            buttonsHTML += '<a href="javascript:;" class="weui_actionsheet_cell ' + (params.buttons[i][j].css ? params.buttons[i][j].css : '') + '">' + params.buttons[i][j].text + '</a>';
                        }
                    }
                    buttonsHTML += '</div>';
                }
            }
        }

        var $actions = $('<div class="pullUpMenu">' +
                            '<div class="weui_mask_transition"></div>' +
                                '<div class="weui_actionsheet">' +
                                    buttonsHTML +
                                '</div>' +
                            '</div>');


        pageManager.$container.append($actions)
            .find(".weui_actionsheet_menu").each(function (i, el) {
                $(this).find('.weui_actionsheet_cell').each(function (j, $e) {
                    $(this).bind("click", function (e) {
                        if (!$(this).hasClass('weui_actionsheet_label')) {
                            if (params.buttons[i][j].click) params.buttons[i][j].click($actions, $(this), e);
                            if (params.buttons[i][j].close !== false) hideActionSheet($actions);
                            if (params.click) params.click($actions, $(this), e);
                        }
                    });
                });
            });

        setTimeout(function () { $actions.addClass('active'); }, 10);

        return $actions;

    }

    function hideActionSheet(target) {
        target.removeClass('active')
            .on('transitionend', function () {
                removeTarget(target);
            })
            .on('webkitTransitionEnd', function () {
                removeTarget(target);
            });
    }
    /*
        2016年2月17日11:40:49
        提示消息
        参数:{
                text:'消息内容（字符串 或 HTML）',
                css:'消息样式',可选（warn/succress）默认 warn
                closeDelay:2000,可选，自动关闭延时默认 2000 毫秒，为 0 时不会自动关闭            
             }
    */
    function toptips(params) {
        params = params || {};
        params.text = params.text ? params.text : null
        params.closeDelay = params.closeDelay ? params.closeDelay : 2000;

        var $toptips = $('<div class="weui_toptips ' + (params.css ? params.css : 'warn') + '">' + params.text + '</div>');

        pageManager.$container.append($toptips);

        if (isNumber(params.closeDelay) && params.closeDelay > 0) {
            setTimeout(function () { removeTarget($toptips); }, params.closeDelay);
        }

        return $toptips;
    }

    /*
        2016年2月16日17:19:37
        模态框
        参数:{
                title:'模态框标题',
                text:'模态框内容（字符串 或 HTML）',
                buttons:[
                    对象数组
                    {
                        text:'按钮内容',
                        css:'按钮样式',可选（defaul/primary）默认 defaul
                        close:自动关闭模态框,可选（true/false）默认 true
                        click:function(m, e){
                            可选
                            按钮点击回调函数（m:当前模态框,e:按钮默认事件）
                        }
                    }
                ],
                click:function(m,i,e){
                    可选
                    按钮点击回调函数（m:当前模态框,i:被点击按钮索引,e:按钮默认事件）
                }
            }
    */
    function showDialog(params) {
        params = params || {};

        var buttonsHTML = "";
        if (params.buttons && params.buttons.length > 0) {
            for (var i = 0; i < params.buttons.length; i++) {
                buttonsHTML += '<a href="javascript:;" class="weui_btn_dialog ' + (params.buttons[i].css ? params.buttons[i].css : 'default') + '">' + params.buttons[i].text + '</a>';
            }
        }

        var modal = $('<div class="weui_dialog_confirm">' +
                            '<div class="weui_mask"></div>' +
                            '<div class="weui_dialog">' +
                                '<div class="weui_dialog_hd"><strong class="weui_dialog_title">' + params.title + '</strong></div>' +
                                '<div class="weui_dialog_bd">' + params.text + '</div>' +
                                '<div class="weui_dialog_ft">' +
                                    buttonsHTML +
                                '</div>' +
                            '</div>' +
                        '</div>');

        pageManager.$container.append(modal)
            .find(".weui_btn_dialog").each(function (index, el) {
                $(this).bind("click", function (e) {
                    if (params.buttons[index].click) params.buttons[index].click(modal, e);
                    if (params.buttons[index].close !== false) removeTarget(modal);
                    if (params.click) params.click(modal, index, e);
                });
            });

        return modal;
    }

    //2016年2月16日13:49:11
    //删除指定标签
    function removeTarget(t) {
        t.remove();
    }

    /*
        2016年2月16日18:02:52
        消息框
        参数:{
                toastHtml:'模态框内容（字符串 或 HTML）',
                closeDelay:2000,可选，自动关闭延时默认 2000 毫秒，为 0 时不会自动关闭
                callBack:function(t){
                    可选
                    回调函数（t:当前模态框）
                }
            }
    */
    function showToastBase(params) {

        params = params || {};

        if (!isNotEmpty(params.toastHtml)) { return; }

        params.closeDelay = (isNumber(params.closeDelay)) ? params.closeDelay : 2000;

        toast = $(params.toastHtml);

        pageManager.$container.append(toast);

        if (params.closeDelay > 0) {
            setTimeout(function () {
                removeTarget(toast);
            }, params.closeDelay);
        }

        (isExitsFunction(params.callBack)) ? params.callBack(toast) : null;

        return toast;
    }

    /*
        2016年2月16日18:06:32
        消息框
        参数:{
                text:'模态框标题（字符串）',
                iconClass：可选，'图标样式' 默认 weui_icon_toast
                closeDelay:2000,可选，自动关闭延时默认 2000 毫秒，为 0 时不会自动关闭
                callBack:function(t){
                    可选
                    回调函数（t:当前模态框）
                }
            }
    */
    function showToast(params) {
        params = params || {};

        params.text = isNotEmpty(params.text) ? params.text : '已完成';
        params.iconClass = params.iconClass ? params.iconClass : 'weui_icon_toast';

        var toastHtml = params.iconClass.length >= 0 ? '<i class="' + params.iconClass + '"></i>' : '',
            css = '';

        if (params.iconClass == 'weui_loading') {
            css = 'weui_loading_toast';
            toastHtml =
                '<div class="weui_loading">' +
                    '<div class="weui_loading_leaf weui_loading_leaf_0"></div>' +
                    '<div class="weui_loading_leaf weui_loading_leaf_1"></div>' +
                    '<div class="weui_loading_leaf weui_loading_leaf_2"></div>' +
                    '<div class="weui_loading_leaf weui_loading_leaf_3"></div>' +
                    '<div class="weui_loading_leaf weui_loading_leaf_4"></div>' +
                    '<div class="weui_loading_leaf weui_loading_leaf_5"></div>' +
                    '<div class="weui_loading_leaf weui_loading_leaf_6"></div>' +
                    '<div class="weui_loading_leaf weui_loading_leaf_7"></div>' +
                    '<div class="weui_loading_leaf weui_loading_leaf_8"></div>' +
                    '<div class="weui_loading_leaf weui_loading_leaf_9"></div>' +
                    '<div class="weui_loading_leaf weui_loading_leaf_10"></div>' +
                    '<div class="weui_loading_leaf weui_loading_leaf_11"></div>' +
                '</div>';
        }

        params.toastHtml = '<div class="' + css + '">' +
                                '<div class="weui_mask_toast"></div>' +
                                '<div class="weui_toast">' +
                                    toastHtml +
                                    '<p class="weui_toast_content">' + params.text + '</p>' +
                                '</div>' +
                            '</div>'

        return showToastBase(params);

    }

    /*
        2016年2月16日14:38:23
        消息框
        参数:{
                text:'模态框标题（字符串）',
                closeDelay:2000,可选，自动关闭延时默认 2000 毫秒，为 0 时不会自动关闭
                callBack:function(t){
                    可选
                    回调函数（t:当前模态框）
                }
            }
    */
    function showLoadingToast(params) {
        params = params || {};
        params.text = params.text ? params.text : '数据加载中';
        params.iconClass = 'weui_loading';
        return showToast(params);
    }

    //验证    
    function isNotEmpty(targer) {
        return !/^\s*$/.test(targer) && targer != undefined;
    }

    function isNumber(targer) {
        return (/^[0-9]*$/.test(targer));
    }

    function isNotString(targer) {
        return !/^[A-Za-z0-9_/-]*$/.test(targer);
    }

    function isExitsFunction(funcName) {
        try {
            if (typeof (eval(funcName)) == "function") {
                return true;
            }
        } catch (e) { }

        return false;
    }

});