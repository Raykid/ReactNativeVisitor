# [ReactNativeVisitor](https://github.com/Raykid/ReactNativeVisitor) &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Raykid/ReactNativeVisitor/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/react-native-visitor.svg?style=flat)](https://www.npmjs.com/package/react-native-visitor) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Raykid/ReactNativeVisitor/pulls)

ReactNativeVisitor提供给你对jsx语法产生的、无法修改的对象进行二次修改的能力。

* **破解jsx对象:** 通过React jsx语法产生的对象其实并不是实际的显示对象，而是一个为下次渲染提供参考的配置对象。而且React在底层通过Object.freeze方法冻结了该对象，使得用户在拿到该对象后便没有任何机会对其进行修改。ReactNativeVisitor提供了用户在实际渲染之前对生成对象进行修改的机会，即某种程度上实现了对React jsx机制的破解。
* **下次渲染前你将可以:**
  * 修改节点传入参数；
  * 修改节点样式Style；
  * 增删移动节点；
  * 通过key获取某节点内部任何一个后代节点（无需关心嵌套层级）。
* **此外还友情提供:**
  * 对样式Style的嵌套功能支持，类似sass/less的嵌套样式语法，以及样式的递归混合功能；
  * 对Typescript的支持。

## Installation

ReactNativeVisitor支持npm安装
```
npm install react-native-visitor
```

## Tutorial

* [生成Visitor](#生成Visitor)
* [获取节点类型](#获取节点类型)
* [获取后代Visitor](#获取后代Visitor)
* [获取ReactNode](#获取ReactNode)
* [获取父节点](#获取父节点)
* [获取子节点列表](#获取子节点列表)
* [Text组件内文本](#Text组件内文本)
* [组件参数](#组件参数)
* [组件样式](#组件样式)
* [子节点API](#子节点API)

你可以发给我一个[Pull Request](https://github.com/Raykid/ReactNativeVisitor/pulls)，和我一起完善这个工具。

## 生成Visitor
使用wrapVisitor方法可以很轻松地生成一个访问器对象，仅需在jsx代码外部包裹一层方法调用即可，如下。

```jsx
import { wrapVisitor } from 'react-native-visitor';

const visitor = wrapVisitor()(
    <View>
        <Text>Hello ReactNativeVisitor!</Text>
    </View>
);
```
[[返回目录]](#Tutorial)

## 获取节点类型
可以通过Visitor提供的type属性获取到该Visitor对应的节点类型，type是个字符串。

```jsx
const visitor = wrapVisitor()(
    <View>
        <Text key="text">Hello ReactNativeVisitor!</Text>
    </View>
);
console.log(visitor.type);// View
console.log(visitor.text.type)// Text
```
[[返回目录]](#Tutorial)

## 获取后代Visitor
你可以通过给后代节点起名字(key)来为Visitor提供访问依据，该功能忽略层级嵌套，如下。

```jsx
const visitor = wrapVisitor()(
    <View key="depth_0">
        <View key="depth_1">
            <Text key="target_text">Hello ReactNativeVisitor!</Text>
        </View>
    </View>
);
console.log(visitor.keyDict.depth_0);// 根级别View组件的Visitor
console.log(visitor.depth_1);// 直接访问key的效果与通过keyDict访问相同
console.log(visitor.target_text.children);// Hello ReactNativeVisitor!
```
[[返回目录]](#Tutorial)

## 获取ReactNode
当你需要获取ReactNode对象时，例如在React组件的render方法中需要return时，使用visitor的node属性即可。

```jsx
function render()
{
    const visitor = wrapVisitor()(
        <View>
            <Text>Hello ReactNativeVisitor!</Text>
        </View>
    );
    return visitor.node;
}
```
[[返回目录]](#Tutorial)

## 获取父节点
调用Visitor的parent属性即可获取父级Visitor。

```jsx
const visitor = wrapVisitor()(
    <View key="parentContainer">
        <View key="subContainer"/>
    </View>
);
console.log(visitor.subContainer.parent === visitor.parentContainer);// true
```
[[返回目录]](#Tutorial)

## 获取子节点列表
调用Visitor的children属性可以获取容器节点Visitor的所有子节点Visitor数组。

```jsx
const visitor = wrapVisitor()(
    <View>
        <Text>第一行文本</Text>
        <Text>第二行文本</Text>
        <Text>第三行文本</Text>
    </View>
);
console.log(visitor.children);// 返回由三个Text类型Visitor组成的数组
```
[[返回目录]](#Tutorial)

## Text组件内文本
和获取子节点数组一样，调用Text组件Visitor的children属性，对于Text组件来说，children返回的是字符串而不是数组。如果想修改文本，只需设置它即可。

```jsx
function render()
{
    const visitor = wrapVisitor()(<Text>我是文本</Text>);
    console.log(visitor.children);// 我是文本
    visitor.children = "我是新的文本";
    return visitor.node;// 界面上将渲染“我是新的文本”这行字
}
```
[[返回目录]](#Tutorial)

## 组件参数
Visitor提供了props属性，以允许你访问和修改组件的传入参数。

```jsx
function render()
{
    const visitor = wrapVisitor()(<MyComp prop1="这是参数1"></MyComp>);
    console.log(visitor.props.prop1);// 这是参数1
    visitor.props.prop2 = "这里新增了参数2";
    return visitor.node;// MyComp组件将接收到值为"这里新增了参数2"的参数prop2
}
```
[[返回目录]](#Tutorial)

## 组件样式
Visitor提供了style属性，以允许你更加便捷地访问和修改组件的样式。

```jsx
function render()
{
    const visitor = wrapVisitor()(
        <Text style={{color: "black"}}>我是一段文字</Text>
    );
    visitor.style.color = "red";
    return visitor.node;// 最终“我是一段文字”会被渲染成红色
}
```
在样式方面，ReactNodeVisitor还额外提供了类似于sass/less的完整解决方案，其中包括：
* [创建样式表](#创建样式表)
* [合并样式](#合并样式)
* [交叉合并样式](#交叉合并样式)
* [附加样式](#附加样式)
* [附加内容样式](#附加内容样式)

### 创建样式表
ReactNodeVisitor提供一个createStyleSheet方法，可以替换掉React Native原始的StyleSheet.create方法，用于支持样式多层嵌套功能。
```jsx
import { createStyleSheet } from 'react-native-visitor';

function render()
{
    // 声明一个含有任意层级结构的样式表对象
    const styles = createStyleSheet({
        root: {
            width: "100%",
            height: "100%",

            // 这就是个嵌套的样式结构
            text1: {
                color: "black",
                fontWeight: "500"
            },

            // 这是第二个嵌套的样式结构
            second: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",

                // 它里面还有一层嵌套的样式结构
                text2: {
                    color: "red"
                }
            }
        }
    });
    // 在书写结构时按照层级结构赋值样式，让结构更清晰
    return <View style={styles.root}>
        <Text style={styles.root.text1}>文本1</Text>
        <View style={styles.root.second}>
            <Text style={styles.root.second.text2}>文本2</Text>
        </View>
    </View>;
}
```

### 合并样式
mergeStyles方法允许你将多个样式对象进行合并，得出一个样式对象，所有内嵌的同名样式都会***递归***地被合并。如下：
```jsx
import { createStyleSheet, mergeStyles } from 'react-native-visitor';

function render()
{
    // 这是第一个样式表
    const style1 = createStyleSheet({
        root: {
            width: "100%",
    
            text: {
                fontSize: 30
            }
        }
    });
    // 这是第二个样式表
    const style2 = createStyleSheet({
        root: {
            height: 200,
    
            text: {
                color: "red"
            }
        }
    });
    // 这是合并后的样式表
    const mergeRoot = mergeStyles(style1.root, style2.root);
    // 使用合并后的样式表书写结构
    return <View style={mergeRoot}>
        <Text style={mergeRoot.text}>文本</Text>
    </View>;
    // 最后得到的样式表形如
    /*
        {
            root: {
                width: "100%",
                height: 200,
    
                text: {
                    fontSize: 30,
                    color: "red"
                }
            }
        }
    */
}
```

### 交叉合并样式
有这样一个需求，整个页面有正常、正确和错误3个状态，页面中有一个按钮，正常是黄色的。当页面状态为正确时，按钮背景要变成绿色，反之当页面状态为错误时，按钮背景要变成红色。

交叉合并功能就是为了解决这样的问题而诞生的，它模仿的是sass/less中的并列样式功能。

交叉合并用到的方法为crossMergeStyles。下面的例子就说明了crossMergeStyles是如何给一个样式赋上状态的。
```jsx
import { createStyleSheet, crossMergeStyles } from 'react-native-visitor';

function render()
{
    const styles = createStyleSheet({
        root: {
            width: "100%",
            height: "100%",

            button: {
                position: "absolute",
                bottom: 100,
                width: 200,
                height: 100,
                backgroundColor: "yellow",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",

                text: {
                    fontSize: 30,
                    color: "black",
                }
            },

            // 这个是root为正确状态下的样式结构
            _right: {
                button: {
                    backgroundColor: "green",

                    text: {
                        color: "white"
                    }
                }
            },

            // 这个是root为错误状态下的样式结构
            _wrong: {
                button: {
                    backgroundColor: "red",

                    text: {
                        color: "white"
                    }
                }
            }
        }
    });
    // 假设有一个isRight变量可以获取到页面状态
    // crossMergeStyles方法第二个参数接收一个字符串数组，字符串都是某个样式节点的状态名
    // 样式的状态名必须是该层样式的第一级子样式。一般都用下划线作为前缀，标明它是个状态，而不是一个嵌套结构，但这不是必须的，你完全可以自己决定前缀或者完全没有前缀（这将不太好管理）。
    const mergeRoot = crossMergeStyles(styles.root, [
        isRight && "_right",
        !isRight && "_wrong"
    ]);
    return <View style={mergeRoot}>
        <View style={mergeRoot.button}>
            <Text style={mergeRoot.button.text}>点我</Text>
        </View>
    </View>;
    // 这样当isRight为true时，你会看到按钮变成了绿底白字，而当isRight为false时，按钮则变成了红底白字。
}
```
交叉合并样式几乎是开发界面时最常用的方法，因为通常页面或者组件都需要维护多个不同的状态，如果为每个状态都写一个完整的样式结构将会非常麻烦，特别是当样式不支持嵌套时……

### 附加样式
上面几个方法都可以脱离Visitor体系使用。但如果你使用Visitor体系开发，则appendStyles可以让你快速给一个已经有样式的Visitor增加新的样式。
```jsx
import { createStyleSheet, crossMergeStyles, appendStyles } from 'react-native-visitor';

function render()
{
    // 假设这是我从其他地方获取到的Visitor
    const visitor = wrapVisitor()(
        <View>
            <Text key="text" style={{color: "red"}}>文本</Text>
        </View>
    );
    // 我希望让Text组件的字体加粗，我可以这么干
    // 第一个参数给要附加样式的Visitor，这里是visitor.text
    // 第二个参数就是要附加的样式结构
    appendStyles(visitor.text, {
        fontWeight: "bold"
    });
    // 当然你也可以使用上面提到的任何方法修改你需要的样式，然后再附加上去
    const styles = createStyleSheet({
        fontWeight: "bold",

        _right: {
            color: "green"
        },

        _wrong: {
            color: "red"
        }
    });
    appendStyles(visitor.text, crossMergeStyles(styles, [
        isRight && "_right",
        !isRight && "_wrong"
    ]));
    // 返回修改后的结构
    return visitor.node;
}
```

### 附加内容样式
这个和附加样式差不多，只不过ScrollView系列组件有两个样式(style和contentContainerStyle)，appendContentContainerStyles就是针对后者的附加样式。如果你拿到的Visitor是ScrollView、ListView、FlatList，则用这个方法可以给组件内部容器增加样式。

[[返回目录]](#Tutorial)

## 子节点API
通过Visitor提供的子节点API，你可以方便地添加新节点或者移除、移动已有节点。

```jsx
function render()
{
    const visitor = wrapVisitor()(
        <View>
            <Text key="text1">文本1</Text>
            <Text key="text2">文本2</Text>
            <Text key="text3">文本3</Text>
        </View>
    );
    // 添加节点，addChild可以直接接收ReactNode，后面它会被转换为子Visitor
    visitor.addChild(<Text key="text5">我是新增的文本5</Text>);
    // 按索引添加节点，你也可以传递一个Visitor，和直接传递ReactNode是一样的
    const insertVisitor = wrapVisitor()(
        <Text key="text4">我是插入的文本4</Text>
    );
    visitor.addChildAt(insertVisitor, 3);
    // 移除节点
    visitor.removeChild(visitor.text3);
    // 替换节点
    visitor.replace(<Text>我是新的文本2</Text>, visitor.text2);
    // 返回node
    return visitor.node;
    // 这样下来实际的显示会和以下代码生成的一样
    /*
        <View>
            <Text key="text1">文本1</Text>
            <Text>我是新的文本2</Text>
            <Text key="text4">我是插入的文本4</Text>
            <Text key="text5">我是新增的文本5</Text>
        </View>
    */
}
```
### 全部子节点API包括：
```ts
/**
 * 查看是否含有某个子节点
 *
 * @param {ReactNodeVisitor} child 要测试的子节点Visitor
 * @returns {boolean} 是否含有该节点
 */
hasChild(child:ReactNodeVisitor):boolean;

/**
 * 获取子节点索引
 *
 * @param {ReactNodeVisitor} child 子节点Visitor
 * @returns {number} 子节点索引
 */
getChildIndex(child:ReactNodeVisitor):number;

/**
 * 获取指定索引处的子节点Visitor
 *
 * @param {number} index 指定索引
 * @returns {ReactNodeVisitor} 获取到的子节点Visitor
 */
getChildAt(index:number):ReactNodeVisitor;

/**
 * 添加显示节点
 *
 * @param {(ReactNodeVisitor|React.ReactNode)} child 要添加的显示节点，支持ReactNode或Visitor
 * @returns {ReactNodeVisitor} 添加的节点Visitor
 */
addChild(child:ReactNodeVisitor|React.ReactNode):ReactNodeVisitor;

/**
 * 在指定索引处添加显示节点
 *
 * @param {(ReactNodeVisitor|React.ReactNode)} child 要添加的显示节点，支持ReactNode或Visitor
 * @param {number} index 要添加到的索引
 * @returns {ReactNodeVisitor} 添加的节点Visitor
 */
addChildAt(child:ReactNodeVisitor|React.ReactNode, index:number):ReactNodeVisitor;

/**
 * 在某个已有子节点前面插入显示节点
 *
 * @param {(ReactNodeVisitor|React.ReactNode)} child 要添加的显示节点，支持ReactNode或Visitor
 * @param {ReactNodeVisitor} refChild 已有节点Visitor
 * @returns {ReactNodeVisitor} 添加的节点Visitor
 */
addChildBefore(child:ReactNodeVisitor|React.ReactNode, refChild:ReactNodeVisitor):ReactNodeVisitor;

/**
 * 在某个已有子节点后面插入显示节点
 *
 * @param {(ReactNodeVisitor|React.ReactNode)} child 要添加的显示节点，支持ReactNode或Visitor
 * @param {ReactNodeVisitor} refChild 已有节点Visitor
 * @returns {ReactNodeVisitor} 添加的节点Visitor
 */
addChildAfter(child:ReactNodeVisitor|React.ReactNode, refChild:ReactNodeVisitor):ReactNodeVisitor;

/**
 * 将自身从父容器中移除
 *
 * @returns {ReactNodeVisitor} 返回被移除的节点Visitor
 */
remove():ReactNodeVisitor;

/**
 * 移除一个子节点
 *
 * @param {ReactNodeVisitor} child 要移除的子节点Visitor
 * @returns {ReactNodeVisitor} 被移除的节点Visitor
 */
removeChild(child:ReactNodeVisitor):ReactNodeVisitor;

/**
 * 移除指定索引处的子节点
 *
 * @param {number} index 要移除的子节点索引
 * @returns {ReactNodeVisitor} 被移除的节点Visitor
 */
removeChildAt(index:number):ReactNodeVisitor;

/**
 * 清空子节点
 *
 * @returns {ReactNodeVisitor[]} 被移除的字节点Visitor列表
 */
removeChildren():ReactNodeVisitor[];

/**
 * 替换子节点
 *
 * @param {(ReactNodeVisitor|React.ReactNode)} child 要替换成的子节点，支持ReactNode或Visitor
 * @param {ReactNodeVisitor} refChild 要被替换的子节点Visitor
 * @returns {ReactNodeVisitor} 返回被添加的节点Visitor
 */
replace(child:ReactNodeVisitor|React.ReactNode, refChild:ReactNodeVisitor):ReactNodeVisitor;
```

[[返回目录]](#Tutorial)

### Issues

如果你有任何问题、意见或建议，欢迎给我提[issues](https://github.com/Raykid/ReactNativeVisitor/issues)，和我一起完善这个小工具。

### License

ReactNativeVisitor is [MIT licensed](./LICENSE).