import React from 'react';
import { ImageStyle, ListRenderItem, ListRenderItemInfo, Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native';

function handleStyleSheet<T = any>(style:T):T
{
    // 遍历styles
    for(let name in style)
    {
        const value = style[name];
        if(name === "fontWeight" && Platform.OS === "android" && style["fontFamily"] == null)
        {
            // 安卓中如果给了fontWeight但没有给fontFamily，有可能会导致某些手机布局错乱，因此给一个空字符串
            style["fontFamily"] = "";
        }
        if(typeof value === "object")
        {
            // 是个复杂类型，需要特殊处理
            Object.defineProperty(style, name, {
                configurable: true,
                enumerable: Array.isArray(value) || name === "shadowOffset",
                writable: false,
                value: handleStyleSheet(value)
            });
        }
    }
    return mergeStyles(style) as T;
}

export type Style = ViewStyle | TextStyle | ImageStyle;

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
export function createStyleSheet<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(styles: T | StyleSheet.NamedStyles<T>):any
{
    // 遍历styles
    for(let name in styles)
    {
        styles[name] = handleStyleSheet(styles[name]);
    }
    // 返回处理后的值
    return StyleSheet.create(styles);
}

const textStyleKeys:string[] = [
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
export function filterTextStyles(style:Style):TextStyle
{
    if(!style) return style;
    const result:TextStyle = {};
    for(let key of textStyleKeys)
    {
        if(style[key] !== undefined)
        {
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
export function mergeStyles(...styles:Style[]):Style
{
    // 过滤掉空样式，这里不能和null对比，因为还要过滤掉false的情况
    styles = styles.filter(style=>style);
    // 合并样式
    const style:Style = Object.assign({}, ...styles);
    // 这里返回一个Proxy，如果用户尝试获取一个没有的key，则返回原始style列表中所有相同key属性的合并
    return new Proxy(style, {
        get(target:Style, propertyKey:PropertyKey):any
        {
            if(target.hasOwnProperty(propertyKey))
            {
                return target[propertyKey];
            }
            else
            {
                let hasSubStyle:boolean = false;
                const subStyles = styles.map(style=>{
                    if(style.hasOwnProperty ? style.hasOwnProperty(propertyKey) : style[propertyKey])
                    {
                        hasSubStyle = true;
                    }
                    return style[propertyKey];
                });
                return hasSubStyle ? mergeStyles(...subStyles) : undefined;
            }
        }
    });
}

function flattenStyle(style:Style, states?:string[]):Style[]
{
    if(!style) return [];
    const result:Style[] = [style];
    for(let state of states || [])
    {
        // 过滤掉为false或没有的字段
        if(state)
        {
            const subStyle:Style = style[state];
            if(subStyle)
            {
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
export function crossMergeStyles(style:Style, states:string[]):Style
{
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
export function appendStyles(target:ReactNodeVisitor, ...styles:Style[]):Style
{
    if(!target) return null;
    const style = mergeStyles(target.style, ...styles);
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
export function appendContentContainerStyles(target:ReactNodeVisitor, ...styles:Style[]):Style
{
    if(!target) return null;
    const style = mergeStyles(target.props.contentContainerStyle, ...styles);
    target.props.contentContainerStyle = style;
    return style;
}

export interface ReactNodeVisitorFunctions
{
    /**
     * 查看是否含有某个子节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {ReactNodeVisitor} child 要测试的子节点Visitor
     * @returns {boolean} 是否含有该节点
     * @memberof ReactNodeVisitorFunctions
     */
    hasChild(child:ReactNodeVisitor):boolean;

    /**
     * 获取子节点索引
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {ReactNodeVisitor} child 子节点Visitor
     * @returns {number} 子节点索引
     * @memberof ReactNodeVisitorFunctions
     */
    getChildIndex(child:ReactNodeVisitor):number;

    /**
     * 获取指定索引处的子节点Visitor
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {number} index 指定索引
     * @returns {ReactNodeVisitor} 获取到的子节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    getChildAt(index:number):ReactNodeVisitor;

    /**
     * 添加显示节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {(ReactNodeVisitor|React.ReactNode)} child 要添加的显示节点，支持ReactNode或Visitor
     * @returns {ReactNodeVisitor} 添加的节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    addChild(child:ReactNodeVisitor|React.ReactNode):ReactNodeVisitor;

    /**
     * 在指定索引处添加显示节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {(ReactNodeVisitor|React.ReactNode)} child 要添加的显示节点，支持ReactNode或Visitor
     * @param {number} index 要添加到的索引
     * @returns {ReactNodeVisitor} 添加的节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    addChildAt(child:ReactNodeVisitor|React.ReactNode, index:number):ReactNodeVisitor;

    /**
     * 在某个已有子节点前面插入显示节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {(ReactNodeVisitor|React.ReactNode)} child 要添加的显示节点，支持ReactNode或Visitor
     * @param {ReactNodeVisitor} refChild 已有节点Visitor
     * @returns {ReactNodeVisitor} 添加的节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    addChildBefore(child:ReactNodeVisitor|React.ReactNode, refChild:ReactNodeVisitor):ReactNodeVisitor;

    /**
     * 在某个已有子节点后面插入显示节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {(ReactNodeVisitor|React.ReactNode)} child 要添加的显示节点，支持ReactNode或Visitor
     * @param {ReactNodeVisitor} refChild 已有节点Visitor
     * @returns {ReactNodeVisitor} 添加的节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    addChildAfter(child:ReactNodeVisitor|React.ReactNode, refChild:ReactNodeVisitor):ReactNodeVisitor;

    /**
     * 将自身从父容器中移除
     *
     * @author Raykid
     * @date 2019-11-19
     * @returns {ReactNodeVisitor} 返回被移除的节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    remove():ReactNodeVisitor;

    /**
     * 移除一个子节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {ReactNodeVisitor} child 要移除的子节点Visitor
     * @returns {ReactNodeVisitor} 被移除的节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    removeChild(child:ReactNodeVisitor):ReactNodeVisitor;

    /**
     * 移除指定索引处的子节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {number} index 要移除的子节点索引
     * @returns {ReactNodeVisitor} 被移除的节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    removeChildAt(index:number):ReactNodeVisitor;

    /**
     * 清空子节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @returns {ReactNodeVisitor[]} 被移除的字节点Visitor列表
     * @memberof ReactNodeVisitorFunctions
     */
    removeChildren():ReactNodeVisitor[];

    /**
     * 替换子节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {(ReactNodeVisitor|React.ReactNode)} child 要替换成的子节点，支持ReactNode或Visitor
     * @param {ReactNodeVisitor} refChild 要被替换的子节点Visitor
     * @returns {ReactNodeVisitor} 返回被添加的节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    replace(child:ReactNodeVisitor|React.ReactNode, refChild:ReactNodeVisitor):ReactNodeVisitor;
}

export interface ReactNodeVisitor extends ReactNodeVisitorFunctions
{
    key?:string;
    readonly type:string;
    props:any;
    node:React.ReactNode;
    style:any;
    children:ReactNodeVisitorWithKey[]|string;
    parent:ReactNodeVisitorWithKey;
    keyDict:{[key:string]:ReactNodeVisitorWithKey};
}

function isVisitor(target:any):boolean
{
    return target != null &&
        target.hasOwnProperty("key") &&
        target.hasOwnProperty("type") &&
        target.hasOwnProperty("props") &&
        target.hasOwnProperty("node") &&
        target.hasOwnProperty("style") &&
        target.hasOwnProperty("children") &&
        target.hasOwnProperty("parent") &&
        target.hasOwnProperty("keyDict");
}

function getChildren<T = ReactNodeVisitor|React.ReactNode>(children:T|T[]|string):T[]|string
{
    if(typeof children === "string" || Array.isArray(children))
    {
        return children;
    }
    else if(children != null)
    {
        return [children];
    }
    else
    {
        return [];
    }
}

function handleChildren<T = React.ReactNode|React.ReactNode[]|string>(children:T):T
{
    if(Array.isArray(children) && children.length === 1)
    {
        children = children[0];
    }
    return children;
}

export type ReactNodeVisitorWithKey = ReactNodeVisitor&{[key:string]:ReactNodeVisitor};
export type ReactNodeVisitorWrapper = (node:React.ReactNode)=>ReactNodeVisitorWithKey;

const visitorFunctions:ReactNodeVisitorFunctions = {
    hasChild(child:ReactNodeVisitor):boolean
    {
        return this.getChildIndex(child) >= 0;
    },
    getChildIndex(child:ReactNodeVisitor):number
    {
        return Array.isArray(this.children) ? this.children.indexOf(child) : -1;
    },
    getChildAt(index:number):ReactNodeVisitor
    {
        return Array.isArray(this.children) ? this.children[index] : null;
    },
    addChild(child:ReactNodeVisitor|React.ReactNode):ReactNodeVisitor
    {
        return this.addChildAt(child, Number.MAX_SAFE_INTEGER);
    },
    addChildAt(child:ReactNodeVisitor|React.ReactNode, index:number):ReactNodeVisitor
    {
        if(!child)
        {
            return null;
        }
        if(typeof this.children === "string")
        {
            throw new Error("非容器节点不能添加子节点");
        }
        // 处理边界情况
        if(index < 0) index = 0;
        else if(index > this.children.length) index = this.children.length;
        // 如果传入的是个ReactNode，要先包装一下
        const visitor:ReactNodeVisitor = isVisitor(child) ? <ReactNodeVisitor>child : wrapVisitor()(child);
        // 如果之前有父节点，先移除之
        if(visitor.parent)
        {
            visitor.parent.removeChild(visitor);
        }
        // 插入visitor数组
        this.children.splice(index, 0, visitor);
        // 插入node数组
        const children:React.ReactNode[] = getChildren(this.node.props.children) as React.ReactNode[];
        children.splice(index, 0, visitor.node);
        this.node.props.children = handleChildren(children);
        // 设置父节点引用
        visitor.parent = this;
        // 返回child
        return visitor;
    },
    addChildBefore(child:ReactNodeVisitor|React.ReactNode, refChild:ReactNodeVisitor):ReactNodeVisitor
    {
        const index:number = this.getChildIndex(refChild);
        if(index < 0)
        {
            throw new Error("refChild不在当前子节点列表中");
        }
        return this.addChildAt(child, index);
    },
    addChildAfter(child:ReactNodeVisitor|React.ReactNode, refChild:ReactNodeVisitor):ReactNodeVisitor
    {
        const index:number = this.getChildIndex(refChild);
        if(index < 0)
        {
            throw new Error("refChild不在当前子节点列表中");
        }
        return this.addChildAt(child, index + 1);
    },
    remove():ReactNodeVisitor
    {
        return this.parent && this.parent.removeChild(this);
    },
    removeChild(child:ReactNodeVisitor):ReactNodeVisitor
    {
        const index:number = this.getChildIndex(child);
        return this.removeChildAt(index);
    },
    removeChildAt(index:number):ReactNodeVisitor
    {
        const child:ReactNodeVisitor = Array.isArray(this.children) && this.children[index];
        if(child)
        {
            // 移除子节点
            this.children.splice(index, 1);
            // 移除node
            const children:React.ReactNode[] = getChildren(this.node.props.children) as React.ReactNode[];
            children.splice(index, 1);
            this.node.props.children = handleChildren(children);
            // 删除父引用
            child.parent = null;
            // 返回子节点
            return child;
        }
        return null;
    },
    removeChildren():ReactNodeVisitor[]
    {
        if(Array.isArray(this.children))
        {
            const children:ReactNodeVisitor[] = this.children.concat();
            return children.map(child=>this.removeChild(child));
        }
        return [];
    },
    replace(child:ReactNodeVisitor|React.ReactNode, refChild:ReactNodeVisitor):ReactNodeVisitor
    {
        // 先将目标对象插入引用前面
        const result:ReactNodeVisitor = this.addChildBefore(child, refChild);
        // 如果插入成功了，则移除引用
        if(result)
        {
            this.removeChild(refChild);
        }
        return result;
    }
};
function wrapFunction<T extends ReactNodeVisitor>(visitor:T):T
{
    for(let key in visitorFunctions)
    {
        visitor[key] = visitorFunctions[key];
    }
    return visitor;
}

function doWrapVisitor(node:ReactNodeVisitorWithKey|React.ReactElement, parent?:ReactNodeVisitorWithKey):ReactNodeVisitorWithKey
{
    if(node == null || typeof node !== "object") return null;
    // 如果node本来就是访问器，修改parent然后返回
    if(isVisitor(node))
    {
        (<ReactNodeVisitorWithKey>node).parent = parent;
        return node as ReactNodeVisitorWithKey;
    }
    const keyDict:{[key:string]:ReactNodeVisitorWithKey} = {};
    let visitorChildren:ReactNodeVisitorWithKey[]|string;
    // 自身
    let visitor:ReactNodeVisitorWithKey;
    if(node["__visitor__"])
    {
        visitor = node["__visitor__"];
        visitorChildren = getChildren(visitor.children);
        visitor.parent = parent;
    }
    else
    {
        visitorChildren = typeof node.props.children === "string" ? node.props.children : [];
        // 如果有style字段但没有给style，则给一个空的，防止改的时候报错
        if(node.props.hasOwnProperty("style") && !node.props.style)
        {
            node.props.style = {};
        }
        visitor = new Proxy<ReactNodeVisitorWithKey>(
            wrapFunction(<ReactNodeVisitorWithKey>{
                get key():string
                {
                    return node.key as string;
                },
                set key(value:string)
                {
                    node.key = value;
                },
                get type():string
                {
                    return node["type"]["displayName"];
                },
                node,
                get props():any
                {
                    return node.props;
                },
                set props(value:any)
                {
                    node.props = value;
                },
                get style():any
                {
                    return node.props.style;
                },
                set style(value:any)
                {
                    node.props.style = value;
                },
                get children():ReactNodeVisitorWithKey[]|string
                {
                    return visitorChildren;
                },
                set children(value:ReactNodeVisitorWithKey[]|string)
                {
                    visitorChildren = value;
                    if(!value || typeof value === "string")
                    {
                        // 如果是字符串，直接更新原始属性
                        node.props.children = value;
                    }
                    else
                    {
                        // 是数组，用node列表更新原始属性
                        node.props.children = value.map(child=>child.node);
                    }
                    // 处理一下子数组
                    node.props.children = handleChildren(node.props.children);
                },
                parent,
                keyDict
            }),
            {
                get(target:ReactNodeVisitor, key:PropertyKey):any
                {
                    if(!target.hasOwnProperty(key))
                    {
                        // 如果没有这个key，尝试从keyDict中取
                        return target.keyDict[key as any];
                    }
                    else
                    {
                        return target[key];
                    }
                }
            }
        );
        node["__visitor__"] = visitor;
    }
    if(visitor.key)
    {
        keyDict[visitor.key] = visitor as ReactNodeVisitorWithKey;
    }
    // 子节点
    let children = node.props.children;
    if(children && typeof children === "object")
    {
        if(!Array.isArray(children))
        {
            children = [children];
        }
        children.forEach((child, i)=>{
            if(child)
            {
                const childVisitor = doWrapVisitor(child, visitor);
                // 填充key字典
                for(let key in childVisitor && childVisitor.keyDict)
                {
                    keyDict[key] = childVisitor.keyDict[key];
                }
                // 填充子访问器
                if(Array.isArray(visitorChildren))
                {
                    visitorChildren[i] = childVisitor;
                }
            }
        });
    }
    else if(node.props.renderItem instanceof Function)
    {
        // 是个列表
        const oriRenderItem:ListRenderItem<any> = node.props.renderItem;
        node.props.renderItem = function(info:ListRenderItemInfo<any>):React.ReactElement|null
        {
            const renderItem = oriRenderItem.call(this, info);
            // 解析渲染器对象
            const childVisitor = doWrapVisitor(renderItem, visitor);
            // 填充key字典
            for(let key in childVisitor && childVisitor.keyDict)
            {
                keyDict[key] = childVisitor.keyDict[key];
            }
            // 填充子列表
            if(Array.isArray(visitorChildren))
            {
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
export function wrapVisitor():ReactNodeVisitorWrapper
{
    // 篡改Object.freeze方法，使其失效
    const oriFreeze = Object.freeze;
    Object.freeze = a=>a;
    return node=>{
        // 恢复Object.freeze方法
        Object.freeze = oriFreeze;
        // 解析node节点
        return doWrapVisitor(node as React.ReactElement) as ReactNodeVisitor & {[key:string]:ReactNodeVisitor};
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
export function appendRefHandler(target:ReactNodeVisitor, handler:(ref:any)=>void):void
{
    const oriRef:(ref:any)=>void = target.node["ref"];
    target.node["ref"] = ref=>{
        // 当用当前的方法
        handler(ref);
        // 调用原来的方法
        oriRef && oriRef(ref);
    };
}