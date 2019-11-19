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
    hasChild(child: ReactNodeVisitor): boolean;
    getChildIndex(child: ReactNodeVisitor): number;
    getChildAt(index: number): ReactNodeVisitor;
    addChild(child: ReactNodeVisitor | React.ReactNode): ReactNodeVisitor;
    addChildAt(child: ReactNodeVisitor | React.ReactNode, index: number): ReactNodeVisitor;
    addChildBefore(child: ReactNodeVisitor | React.ReactNode, refChild: ReactNodeVisitor): ReactNodeVisitor;
    addChildAfter(child: ReactNodeVisitor | React.ReactNode, refChild: ReactNodeVisitor): ReactNodeVisitor;
    remove(): ReactNodeVisitor;
    removeChild(child: ReactNodeVisitor): ReactNodeVisitor;
    removeChildAt(index: number): ReactNodeVisitor;
    removeChildren(): ReactNodeVisitor[];
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
