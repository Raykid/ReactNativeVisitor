var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { Platform, StyleSheet } from 'react-native';
function handleStyleSheet(style) {
    // 遍历styles
    for (var name in style) {
        var value = style[name];
        if (name === "fontWeight" && Platform.OS === "android" && style["fontFamily"] == null) {
            // 安卓中如果给了fontWeight但没有给fontFamily，有可能会导致某些手机布局错乱，因此给一个空字符串
            style["fontFamily"] = "";
        }
        if (typeof value === "object") {
            // 是个复杂类型，需要特殊处理
            Object.defineProperty(style, name, {
                configurable: true,
                enumerable: Array.isArray(value) || name === "shadowOffset",
                writable: false,
                value: handleStyleSheet(value)
            });
        }
    }
    return style;
}
/**
 * 创建一个可嵌套的样式表
 *
 * @author Raykid
 * @date 2019-08-13
 * @export
 * @template T
 * @param {(T | StyleSheet.NamedStyles<T>)} styles
 * @returns {{[P in keyof T]:any}}
 */
export function createStyleSheet(styles) {
    // 遍历styles
    for (var name in styles) {
        handleStyleSheet(styles[name]);
    }
    // 返回处理后的值
    return StyleSheet.create(styles);
}
var textStyleKeys = [
    "color",
    "fontFamily",
    "fontSize",
    "fontStyle",
    "fontWeight",
    "letterSpacing",
    "lineHeight",
    "textAlign",
    "textDecorationLine",
    "textDecorationStyle",
    "textDecorationColor",
    "textShadowColor",
    "textShadowOffset",
    "textShadowRadius",
];
/**
 * 筛选文本可以继承的样式
 *
 * @author Raykid
 * @date 2019-09-09
 * @export
 * @param {Style} style
 * @returns {TextStyle}
 */
export function filterTextStyles(style) {
    if (!style)
        return style;
    var result = {};
    for (var _i = 0, textStyleKeys_1 = textStyleKeys; _i < textStyleKeys_1.length; _i++) {
        var key = textStyleKeys_1[_i];
        if (style[key] !== undefined) {
            result[key] = style[key];
        }
    }
    return result;
}
/**
 * 合并样式
 *
 * @author Raykid
 * @date 2019-08-13
 * @export
 * @param {...Style[]} styles
 * @returns {Style}
 */
export function mergeStyles() {
    var styles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        styles[_i] = arguments[_i];
    }
    // 过滤掉空样式，这里不能和null对比，因为还要过滤掉false的情况
    styles = styles.filter(function (style) { return style; });
    // 合并样式
    var style = Object.assign.apply(Object, __spreadArrays([{}], styles));
    // 这里返回一个Proxy，如果用户尝试获取一个没有的key，则返回原始style列表中所有相同key属性的合并
    return new Proxy(style, {
        get: function (target, propertyKey) {
            if (target.hasOwnProperty(propertyKey)) {
                return target[propertyKey];
            }
            else {
                var hasSubStyle_1 = false;
                var subStyles = styles.map(function (style) {
                    if (style.hasOwnProperty ? style.hasOwnProperty(propertyKey) : style[propertyKey]) {
                        hasSubStyle_1 = true;
                    }
                    return style[propertyKey];
                });
                return hasSubStyle_1 ? mergeStyles.apply(void 0, subStyles) : undefined;
            }
        }
    });
}
function flattenStyle(style, states) {
    if (!style)
        return [];
    var result = [style];
    for (var _i = 0, _a = states || []; _i < _a.length; _i++) {
        var state = _a[_i];
        // 过滤掉为false或没有的字段
        if (state) {
            var subStyle = style[state];
            if (subStyle) {
                result.push.apply(result, flattenStyle(subStyle, states));
            }
        }
    }
    return result;
}
/**
 * 将某个样式与其内部具有指定名称的子样式进行合并
 *
 * @author Raykid
 * @date 2019-08-19
 * @export
 * @param {Style} style
 * @param {string} states
 * @returns {Style}
 */
export function crossMergeStyles(style, states) {
    return mergeStyles.apply(this, flattenStyle(style, states));
}
/**
 * 追加样式
 *
 * @author Raykid
 * @date 2019-08-16
 * @export
 * @param {ReactNodeVisitor} target
 * @param {...Style[]} styles
 * @returns {Style}
 */
export function appendStyles(target) {
    var styles = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        styles[_i - 1] = arguments[_i];
    }
    if (!target)
        return null;
    var style = mergeStyles.apply(void 0, __spreadArrays([target.style], styles));
    target.style = style;
    return style;
}
/**
 * 追加ScrollView系列组件的内容容器样式
 *
 * @author Raykid
 * @date 2019-08-28
 * @export
 * @param {ReactNodeVisitor} target
 * @param {...Style[]} styles
 * @returns {Style}
 */
export function appendContentContainerStyles(target) {
    var styles = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        styles[_i - 1] = arguments[_i];
    }
    if (!target)
        return null;
    var style = mergeStyles.apply(void 0, __spreadArrays([target.props.contentContainerStyle], styles));
    target.props.contentContainerStyle = style;
    return style;
}
function isVisitor(target) {
    return target != null &&
        target.hasOwnProperty("key") &&
        target.hasOwnProperty("node") &&
        target.hasOwnProperty("style") &&
        target.hasOwnProperty("children") &&
        target.hasOwnProperty("parent") &&
        target.hasOwnProperty("keyDict");
}
function getChildren(children) {
    if (typeof children === "string" || Array.isArray(children)) {
        return children;
    }
    else if (children != null) {
        return [children];
    }
    else {
        return [];
    }
}
function handleChildren(children) {
    if (Array.isArray(children) && children.length === 1) {
        children = children[0];
    }
    return children;
}
var visitorFunctions = {
    hasChild: function (child) {
        return this.getChildIndex(child) >= 0;
    },
    getChildIndex: function (child) {
        return Array.isArray(this.children) ? this.children.indexOf(child) : -1;
    },
    getChildAt: function (index) {
        return Array.isArray(this.children) ? this.children[index] : null;
    },
    addChild: function (child) {
        return this.addChildAt(child, Number.MAX_SAFE_INTEGER);
    },
    addChildAt: function (child, index) {
        if (!child) {
            return null;
        }
        if (typeof this.children === "string") {
            throw new Error("非容器节点不能添加子对象");
        }
        // 处理边界情况
        if (index < 0)
            index = 0;
        else if (index > this.children.length)
            index = this.children.length;
        // 如果传入的是个ReactNode，要先包装一下
        var visitor = isVisitor(child) ? child : wrapVisitor()(child);
        // 如果之前有父节点，先移除之
        if (visitor.parent) {
            visitor.parent.removeChild(visitor);
        }
        // 插入visitor数组
        this.children.splice(index, 0, visitor);
        // 插入node数组
        var children = getChildren(this.node.props.children);
        children.splice(index, 0, visitor.node);
        this.node.props.children = handleChildren(children);
        // 设置父节点引用
        visitor.parent = this;
        // 返回child
        return visitor;
    },
    addChildBefore: function (child, refChild) {
        var index = this.getChildIndex(refChild);
        if (index < 0) {
            throw new Error("refChild不在当前子节点列表中");
        }
        return this.addChildAt(child, index);
    },
    addChildAfter: function (child, refChild) {
        var index = this.getChildIndex(refChild);
        if (index < 0) {
            throw new Error("refChild不在当前子节点列表中");
        }
        return this.addChildAt(child, index + 1);
    },
    remove: function () {
        return this.parent && this.parent.removeChild(this);
    },
    removeChild: function (child) {
        var index = this.getChildIndex(child);
        return this.removeChildAt(index);
    },
    removeChildAt: function (index) {
        var child = Array.isArray(this.children) && this.children[index];
        if (child) {
            // 移除子节点
            this.children.splice(index, 1);
            // 移除node
            var children = getChildren(this.node.props.children);
            children.splice(index, 1);
            this.node.props.children = handleChildren(children);
            // 删除父引用
            child.parent = null;
            // 返回子节点
            return child;
        }
        return null;
    },
    removeChildren: function () {
        var _this = this;
        if (Array.isArray(this.children)) {
            var children = this.children.concat();
            return children.map(function (child) { return _this.removeChild(child); });
        }
        return [];
    },
    replace: function (child, refChild) {
        // 先将目标对象插入引用前面
        var result = this.addChildBefore(child, refChild);
        // 如果插入成功了，则移除引用
        if (result) {
            this.removeChild(refChild);
        }
        return result;
    }
};
function wrapFunction(visitor) {
    for (var key in visitorFunctions) {
        visitor[key] = visitorFunctions[key];
    }
    return visitor;
}
function doWrapVisitor(node, parent) {
    if (node == null || typeof node !== "object")
        return null;
    // 如果node本来就是访问器，修改parent然后返回
    if (isVisitor(node)) {
        node.parent = parent;
        return node;
    }
    var keyDict = {};
    var visitorChildren;
    // 自身
    var visitor;
    if (node["__visitor__"]) {
        visitor = node["__visitor__"];
        visitorChildren = getChildren(visitor.children);
        visitor.parent = parent;
    }
    else {
        visitorChildren = typeof node.props.children === "string" ? node.props.children : [];
        // 如果有style字段但没有给style，则给一个空的，防止改的时候报错
        if (node.props.hasOwnProperty("style") && !node.props.style) {
            node.props.style = {};
        }
        visitor = new Proxy(wrapFunction({
            get key() {
                return node.key;
            },
            set key(value) {
                node.key = value;
            },
            node: node,
            get props() {
                return node.props;
            },
            set props(value) {
                node.props = value;
            },
            get style() {
                return node.props.style;
            },
            set style(value) {
                node.props.style = value;
            },
            get children() {
                return visitorChildren;
            },
            set children(value) {
                visitorChildren = value;
                if (!value || typeof value === "string") {
                    // 如果是字符串，直接更新原始属性
                    node.props.children = value;
                }
                else {
                    // 是数组，用node列表更新原始属性
                    node.props.children = value.map(function (child) { return child.node; });
                }
                // 处理一下子数组
                node.props.children = handleChildren(node.props.children);
            },
            parent: parent,
            keyDict: keyDict
        }), {
            get: function (target, key) {
                if (!target.hasOwnProperty(key)) {
                    // 如果没有这个key，尝试从keyDict中取
                    return target.keyDict[key];
                }
                else {
                    return target[key];
                }
            }
        });
        node["__visitor__"] = visitor;
    }
    if (visitor.key) {
        keyDict[visitor.key] = visitor;
    }
    // 子节点
    var children = node.props.children;
    if (children && typeof children === "object") {
        if (!Array.isArray(children)) {
            children = [children];
        }
        children.forEach(function (child, i) {
            if (child) {
                var childVisitor = doWrapVisitor(child, visitor);
                // 填充key字典
                for (var key in childVisitor && childVisitor.keyDict) {
                    keyDict[key] = childVisitor.keyDict[key];
                }
                // 填充子访问器
                if (Array.isArray(visitorChildren)) {
                    visitorChildren[i] = childVisitor;
                }
            }
        });
    }
    else if (node.props.renderItem instanceof Function) {
        // 是个列表
        var oriRenderItem_1 = node.props.renderItem;
        node.props.renderItem = function (info) {
            var renderItem = oriRenderItem_1.call(this, info);
            // 解析渲染器对象
            var childVisitor = doWrapVisitor(renderItem, visitor);
            // 填充key字典
            for (var key in childVisitor && childVisitor.keyDict) {
                keyDict[key] = childVisitor.keyDict[key];
            }
            // 填充子列表
            if (Array.isArray(visitorChildren)) {
                visitorChildren[info.index] = childVisitor;
            }
            // 返回渲染器
            return renderItem;
        };
    }
    return visitor;
}
/**
 * 将ReactNode包装成一个便捷访问的对象，保证方法为连续执行
 *
 * @author Raykid
 * @date 2019-08-15
 * @export
 * @returns {ReactNodeVisitorWrapper}
 */
export function wrapVisitor() {
    // 篡改Object.freeze方法，使其失效
    var oriFreeze = Object.freeze;
    Object.freeze = function (a) { return a; };
    return function (node) {
        // 恢复Object.freeze方法
        Object.freeze = oriFreeze;
        // 解析node节点
        return doWrapVisitor(node);
    };
}
/**
 * 添加ref回调
 *
 * @author Raykid
 * @date 2019-08-28
 * @export
 * @param {ReactNodeVisitor} target
 * @param {(ref:any)=>void} handler
 */
export function appendRefHandler(target, handler) {
    var oriRef = target.node["ref"];
    target.node["ref"] = function (ref) {
        // 当用当前的方法
        handler(ref);
        // 调用原来的方法
        oriRef && oriRef(ref);
    };
}
//# sourceMappingURL=ReactNativeVisitor.js.map