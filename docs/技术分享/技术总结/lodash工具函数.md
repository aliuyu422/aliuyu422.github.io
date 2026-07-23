## 取「交集」

### intersection

返回一个包含所有传入数组交集元素的新数组。

```javascript
_.intersection([2, 1], [4, 2], [1, 2]); // => [2]
```



### intersectionBy

根据某个字段来进行计算交集

```javascript
_.intersectionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x'); // => [{ 'x': 1 }]
```



### intersectionWith

根据某个条件函数来计算交集，比如使用isEqual

```javascript
var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]; var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];  _.intersectionWith(objects, others, _.isEqual); 
// => [{ 'x': 1, 'y': 2 }]
```



## 取「合集」

### union

返回一个新的联合数组。

```javascript
_.union([2], [1, 2]); // => [2, 1]
```



### unionBy

根据某个字段来计算合集

```javascript
_.unionBy([{ 'x': 1, 'y': 5 }], [{ 'x': 2, 'y': 3 }, { 'x': 1, 'y': 6 }], 'x'); 
// => [{ 'x': 1, 'y': 5 }, { 'x': 2, 'y': 3 }]
```



### unionWith

根据某个条件函数来计算合集

```javascript
var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]; var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];  _.unionWith(objects, others, _.isEqual); 
// => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
```



## 取「差集」

同上面两种工具函数，这里无需多言~

1. · difference
2. · differenceBy
3. · differenceWith

## 取数组「总和」

### sum

返回总和。

```javascript
_.sum([4, 2, 8, 6]); // => 20
```



### sumBy

根据某个字段计算并返回总和。

```javascript
var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];  _.sumBy(objects, function(o) { return o.n; }); 
// => 20  // The `_.property` iteratee shorthand. _.sumBy(objects, 'n'); // => 20
```



## 取「平均数」

### mean

计算平均数

```javascript
_.mean([4, 2, 8, 6]); // => 5
```



### meanBy

根据某个字段计算出平均值

```javascript
var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];  _.meanBy(objects, function(o) { return o.n; }); 
// => 5  // The `_.property` iteratee shorthand. _.meanBy(objects, 'n'); // => 5
```



## 根据字段或条件「排序」

### sortBy

```javascript
var users = [ { 'user': 'fred', 'age': 48 }, { 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }, { 'user': 'barney', 'age': 34 } ];  _.sortBy(users, function(o) { return o.user; }); 
// => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]  _.sortBy(users, ['user', 'age']); // => objects for [['barney', 34], ['barney', 36], ['fred', 40], ['fred', 48]]  _.sortBy(users, 'user', function(o) { return Math.floor(o.age / 10); }); // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
```



###  

## 「浅拷贝」

### clone

```javascript
const obj1 = [{a: 1 }]const obj2 = _.clone(obj1)console.log(obj1 === obj2) // falseconsole.log(obj1.a === obj2.a) // true
```



## 「深拷贝」

### cloneDeep

```javascript
const obj1 = [{a: 1 }]const obj2 = _.cloneDeep(obj1)console.log(obj1 === obj2) // falseconsole.log(obj1.a === obj2.a) // false
```



## 「防抖」

### 参数

1. func *(Function)* : 要防抖动的函数。
2. [wait=0] *(number)* : 需要延迟的毫秒数。
3. [options=] *(Object)* : 选项对象。
4. [options.leading=false] *(boolean)* : 指定在延迟开始前调用。
5. [options.maxWait] *(number)* : 设置 func 允许被延迟的最大值。
6. [options.trailing=true] *(boolean)* : 指定在延迟结束后调用。

### 返回

*(Function)* : 返回新的 debounced（防抖动）函数。

### 例子

```javascript
// 避免窗口在变动时出现昂贵的计算开销。
jQuery(window).on('resize', _.debounce(calculateLayout, 150)); 
// 当点击时 `sendMail` 随后就被调用。
jQuery(element).on('click', _.debounce(sendMail, 300, { 'leading': true, 'trailing': false})); 
// 确保 `batchLog` 调用1次之后，1秒内会被触发。
var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });var source = new EventSource('/stream');jQuery(source).on('message', debounced); 
// 取消一个 trailing 的防抖动调用
jQuery(window).on('popstate', debounced.cancel);
```



## 「节流」

### 参数

1. func *(Function)* : 要节流的函数。
2. [wait=0] *(number)* : 需要节流的毫秒。
3. [options=] *(Object)* : 选项对象。
4. [options.leading=true] *(boolean)* : 指定调用在节流开始前。
5. [options.trailing=true] *(boolean)* : 指定调用在节流结束后。

### 返回

*(Function)* : 返回节流的函数。

### 例子

```javascript
// 避免在滚动时过分的更新定位
jQuery(window).on('scroll', _.throttle(updatePosition, 100)); 
// 点击后就调用 `renewToken`，但5分钟内超过1次。
var throttled = _.throttle(renewToken, 300000, { 'trailing': false });jQuery(element).on('click', throttled); 
// 取消一个 trailing 的节流调用。jQuery(window).on('popstate', throttled.cancel);
```



## 「获取」对象中的某几个字段

### pick

```javascript
var object = { 'a': 1, 'b': '2', 'c': 3 };  
_.pick(object, ['a', 'c']); 
// => { 'a': 1, 'c': 3 }
```



## 「剔除」掉对象中的某几个字段

### omit

```javascript
var object = { 'a': 1, 'b': '2', 'c': 3 }; 
_.omit(object, ['a', 'c']); 
// => { 'b': '2' }
```



###  

## 「判断类型」：

### isUndefined

如果 value 是 undefined ，那么返回 true，否则返回 false

```javascript
_.isUndefined(undefined); // => true  
_.isUndefined(null); // => false
```



### isNull

如果 value 为null，那么返回 true，否则返回 false。

```javascript
_.isNull(null); // => true  
_.isNull(undefined); // => false
```



### isString

如果 value 为一个字符串，那么返回 true，否则返回 false。

```javascript
_.isString('abc'); // => true  
_.isString(1); // => false
```



### isPlainObject

如果 value 为一个普通对象，那么返回 true，否则返回 false。

```javascript
function Foo() { this.a = 1; }  
_.isPlainObject(new Foo); // => false  
_.isPlainObject([1, 2, 3]); // => false  
_.isPlainObject({ 'x': 0, 'y': 0 }); // => true  
_.isPlainObject(Object.create(null)); // => true
```



### isNumber

如果 value 为一个数值，那么返回 true，否则返回 false。

```javascript
_.isNumber(3); // => true  
_.isNumber(Number.MIN_VALUE); // => true  
_.isNumber(Infinity); // => true  
_.isNumber('3'); // => false
```



### isArray

如果value是一个数组返回 true，否则返回 false。

```javascript
_.isArray([1, 2, 3]); // => true  
_.isArray(document.body.children); // => false  
_.isArray('abc'); // => false  
_.isArray(_.noop); // => false
```



### isBoolean

如果 value 是一个布尔值，那么返回 true，否则返回 false。

```javascript
_.isBoolean(false); // => true  
_.isBoolean(null); // => false
```



### isFunction

如果 value 是一个函数，那么返回 true，否则返回 false。

```javascript
_.isFunction(function(){}); // => true  
_.isFunction(''); // => false
```



### isNil

如果 value 为null 或 undefined，那么返回 true，否则返回 false。

```javascript
_.isNil(null); // => true  
_.isNil(void 0); // => true  
_.isNil(NaN); // => false
```

 