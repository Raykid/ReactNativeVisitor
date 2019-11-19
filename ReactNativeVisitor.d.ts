import React from 'react';
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
export declare type Style = ViewStyle | TextStyle | ImageStyle;
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
export declare function createStyleSheet<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(styles: T | StyleSheet.NamedStyles<T>): any;
/**
 * 筛选文本可以继承的样式
 *
 * @author Raykid
 * @date 2019-09-09
 * @export
 * @param {Style} style
 * @returns {TextStyle}
 */
export declare function filterTextStyles(style: Style): TextStyle;
/**
 * 合并样式
 *
 * @author Raykid
 * @date 2019-08-13
 * @export
 * @param {...Style[]} styles
 * @returns {Style}
 */
export declare function mergeStyles(...styles: Style[]): Style;
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
export declare function crossMergeStyles(style: Style, states: string[]): Style;
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
export declare function appendStyles(target: ReactNodeVisitor, ...styles: Style[]): Style;
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
export declare function appendContentContainerStyles(target: ReactNodeVisitor, ...styles: Style[]): Style;
export interface ReactNodeVisitorFunctions {
    /**
     * 查看是否含有某个子节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {ReactNodeVisitor} child 要测试的子节点Visitor
     * @returns {boolean} 是否含有该节点
     * @memberof ReactNodeVisitorFunctions
     */
    hasChild(child: ReactNodeVisitor): boolean;
    /**
     * 获取子节点索引
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {ReactNodeVisitor} child 子节点Visitor
     * @returns {number} 子节点索引
     * @memberof ReactNodeVisitorFunctions
     */
    getChildIndex(child: ReactNodeVisitor): number;
    /**
     * 获取指定索引处的子节点Visitor
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {number} index 指定索引
     * @returns {ReactNodeVisitor} 获取到的子节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    getChildAt(index: number): ReactNodeVisitor;
    /**
     * 添加显示节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {(ReactNodeVisitor|React.ReactNode)} child 要添加的显示节点，支持ReactNode或Visitor
     * @returns {ReactNodeVisitor} 添加的节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    addChild(child: ReactNodeVisitor | React.ReactNode): ReactNodeVisitor;
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
    addChildAt(child: ReactNodeVisitor | React.ReactNode, index: number): ReactNodeVisitor;
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
    addChildBefore(child: ReactNodeVisitor | React.ReactNode, refChild: ReactNodeVisitor): ReactNodeVisitor;
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
    addChildAfter(child: ReactNodeVisitor | React.ReactNode, refChild: ReactNodeVisitor): ReactNodeVisitor;
    /**
     * 将自身从父容器中移除
     *
     * @author Raykid
     * @date 2019-11-19
     * @returns {ReactNodeVisitor} 返回被移除的节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    remove(): ReactNodeVisitor;
    /**
     * 移除一个子节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {ReactNodeVisitor} child 要移除的子节点Visitor
     * @returns {ReactNodeVisitor} 被移除的节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    removeChild(child: ReactNodeVisitor): ReactNodeVisitor;
    /**
     * 移除指定索引处的子节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @param {number} index 要移除的子节点索引
     * @returns {ReactNodeVisitor} 被移除的节点Visitor
     * @memberof ReactNodeVisitorFunctions
     */
    removeChildAt(index: number): ReactNodeVisitor;
    /**
     * 清空子节点
     *
     * @author Raykid
     * @date 2019-11-19
     * @returns {ReactNodeVisitor[]} 被移除的字节点Visitor列表
     * @memberof ReactNodeVisitorFunctions
     */
    removeChildren(): ReactNodeVisitor[];
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
    replace(child: ReactNodeVisitor | React.ReactNode, refChild: ReactNodeVisitor): ReactNodeVisitor;
}
export interface ReactNodeVisitor extends ReactNodeVisitorFunctions {
    key?: string;
    readonly type: string;
    props: any;
    node: React.ReactNode;
    style: any;
    children: ReactNodeVisitorWithKey[] | string;
    parent: ReactNodeVisitorWithKey;
    keyDict: {
        [key: string]: ReactNodeVisitorWithKey;
    };
}
export declare type ReactNodeVisitorWithKey = ReactNodeVisitor & {
    [key: string]: ReactNodeVisitor;
};
export declare type ReactNodeVisitorWrapper = (node: React.ReactNode) => ReactNodeVisitorWithKey;
/**
 * 将ReactNode包装成一个便捷访问的对象，保证方法为连续执行
 *
 * @author Raykid
 * @date 2019-08-15
 * @export
 * @returns {ReactNodeVisitorWrapper}
 */
export declare function wrapVisitor(): ReactNodeVisitorWrapper;
/**
 * 添加ref回调
 *
 * @author Raykid
 * @date 2019-08-28
 * @export
 * @param {ReactNodeVisitor} target
 * @param {(ref:any)=>void} handler
 */
export declare function appendRefHandler(target: ReactNodeVisitor, handler: (ref: any) => void): void;
