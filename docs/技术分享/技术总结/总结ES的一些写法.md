##  1.定义常量/变量

这是一个百分百有用,是一个闭着眼睛都会的用法,不过我们注意const/let是es6引入的一个块级作用域的关键字，在{}中定义变量{}外部不能访问，并且不存在变量的提升, let与const定义的变量，不能重复定义，用const申明的变量不能重新赋值。

```javascript
const STATUS = {
 0: '未开始',
 1: '进行中',
 2: '结束了'
};
let userName = 'Maic';
```



##  2.对象/数组解构

项目中会用得非常多，告别那种一一取值再赋值吧

```javascript
const userInfo = {
 name: 'Maic',
 age: 18,
 number: 10
}
const {name,age} = userInfo;
console.log(name, age);

const {name: nname, ...rests } = userInfo
console.log(nname, rests): // Maic {age: 18, number: 10}

const url = new URL('https://github.com/type-challenges/type-challenges/issues?q=label%3A5+label%3Aanswer');
const search = url.search;
const [, params] = search.split('?');
console.log(params) // q=label%3A5+label%3Aanswer

const arr = [1,2,3,4];
const [first, ...rest] = arr;
console.log(first, rest); // 1 [2,3,4]
```

## 3.对象动态赋值

```javascript
var key = 'test';
var obj = {
	[key]: 'test'
};
```



## 4.对象合并

```javascript
const objs = {name: 'Tom', age: 10};
const merge = (target,options) => {
  const ret = Object.assign(Object.create({}), target, options);
  return ret;
}
const nobj = merge(objs, {age: 18})
// or
const nobj2 = {...objs, age:18};
```



## 5.数组合并

```javascript
const arr = [1,2,3];
// 复制操作
const narr = [...arr];
// or
const [...n2arr] = arr;

// 合并数组
const barr = [4,5,6];
const carr = [...arr,...barr];
```



## 6.Map

Map也俗称集合，项目中你可以用此来维护一组if的条件判断，或是以前策略模式的一组数据，可以用此来优化代码，让业务代码可拓展性更强，从此告别冗余的if else,switch case，这个会用得比较多，用下面一段伪代码来感受一下,

```javascript
const queryDetail = () => {
 console.log('query detail');
};
const queryList = () => {
 console.log('query list');
}
const queryPic = () => {
  console.log('query pic')
}
const request = new Map([
 ['getDetail', queryDetail],
 ['queryList', queryList]
]);
if (request.has('getDetail')) {
 request.get('getDetail')();
}
if (!request.has('queryPic')) {
 request.set('queryPic', queryPic);
}
// or 循环执行
request.forEach(fn => {
  fn();
})
request.get('queryPic')();
console.log(request.entries(request));
// 获取所有的值
console.log(request.values(request));
// 获取所有的key
console.log(request.keys(request));
/*
[Map Entries] {
 [ 'getDetail', [Function: queryDetail] ],
 [ 'queryList', [Function: queryList] ],
 [ 'queryPic', [Function: queryPic] ]
}
*/
```



## 7.Map常用的方法

```javascript
const map = new Map();
Reflect.ownKeys(map.__proto__);
/**
[
 0: "constructor"
 1: "get"
 2: "set"
 3: "has"
 4: "delete"
 5: "clear"
 6: "entries"
 7: "forEach"
 8: "keys"
 9: "size"
 10: "values"
 11: Symbol(Symbol.toStringTag)
 12: Symbol(Symbol.iterator)
]
*/
```



## 8.对象转Map

```javascript
const obj = {a:1,b:2};
const map = new Map(Object.entries(obj));
/*
 等价于
 const map = new Map([
  ['a',1],
  ['b',2]
 ]);
*/
console.log(map);// Map(2) { 'a' => 1, 'b' => 2 }
```



## 9.Map转对象

```javascript
var map2 = new Map([['a','123'],['b','234']])
Object.fromEntries(map2.entries()) // {a: '123', b: '234'}


// 与Map的区别是WeakMap是一种弱引用，WeakMap的key必须是非基础数据类型。WeakMap没有遍历的entries、keys、values、size方法，只有get、set、has、delete方法。

const bodyDom = document.getElementsByTagName('body')[0];
const weakMap = new WeakMap();
weakMap.set(bodyDom, 'bodyDom');
console.log(weakMap.get(bodyDom));
```

## 10.Set

一般我们在项目常用去重操作,或者过滤数据处理

 

```javascript
var newset = [...new Set([1,1,2,3])]
 console.log(newset); // 1,2,3
 var arrsSet = new Set();
 arrsSet.add({name: 'Maic'}).add({name: 'Tom'})
 console.log([...arrsSet]);// [ { name: 'Maic' }, { name: 'Tom' } ]
 console.log(newset.has(1)) // true
```

根据某个字段找出两组数据中相同的数据,并合并

```javascript
const data1 = [
 {price:100,attr: 'nick'}, 
 {price: 200,attr: '领带'}
];
const data2 = [
 {price:200,attr: '眼镜'}, 
 {price: 5000,attr: '戒子'}, 
 {price:100,attr: 'nick'}
];

const findSomeByKey = (target1, target2, key) => {
  const target2Set = new Set([...target2]);
  const ret = [];
  const tagret = target1.map(v => v[key]);
  target2.forEach(v => {
   Object.entries(v).forEach(s => {
     const [, val] = s;
     if (tagret.includes(val)) {
       const curent = target1.find(v => v[key] === val);
       ret.push(v, curent)
     }
   })
  })
  return ret
}
findSomeByKey(data1, data2, 'price');
/*
[
 {price: 200, attr: '眼镜'},
 {price: 200, attr: '领带'},
 {price: 100, attr: 'nick'},
 {price: 100, attr: 'nick'}
]
```

## 11.Set的常用方法

```javascript
const nset = new Set();
console.log(Reflect.ownKeys(nset.__proto__));
/*
[
 0: "constructor"
 1: "has"
 2: "add"
 3: "delete"
 4: "clear"
 5: "entries"
 6: "forEach"
 7: "size"
 8: "values"
 9: "keys"
 10: Symbol(Symbol.toStringTag)
 11: Symbol(Symbol.iterator)
]
*/
```

## 12.WeakSet

没有循环，没有get,不太常用

```javascript
const nweakSet = new WeakSet([['name','Maic'],['age',18]]);
console.log(nweakSet);
console.log(Reflect.ownKeys(nweakSet.__proto__));
/**
  "constructor"
  1: "delete"
  2: "has"
  3: "add"
  4: Symbol(Symbol.toStringTag)
*/
```

## 13.Reflect

这是es6中比较新的api

```javascript
// 判断对象熟悉是否存在
const nobj = {a: 1}
if ('a' in nobj) {
  console.log('存在')
} else {
 console.log('不存在')
}
// or
console.log(nobj.hasOwnProperty('a'));
// or
console.log(Object.hasOwn(nobj, 'a'))

// now
Reflect.has(nobj, 'a');
// 向对象中添加属性
Reflect.defineProperty(obj,'b', {value: 22})
console.log(nobj); // {a:1,v:2}
// 删除对象属性
Reflect.deleteProperty(nobj, 'a');
console.log(nobj); // {b:22}

// 调用函数
function f() {
 this.age = 18;
 this.arg = [...arguments];
 console.log(this.arg,this.age); // [1,2] 18
}
Reflect.apply(f, this, [1,2]);
// 相当于过去这个
Function.prototype.apply.call(f,this,[1,2])

// 遍厉对象,获取key
console.log(Reflect.ownKeys(nobj));// ['a', 'b']
```

## 14.Proxy

es6对象代理,劫持对象，在vue3中实现双向数据绑定，用Proxy实现一个观察者模式

```javascript
var bucket = new Set();
var effect = (fn) => {
 bucket.add(fn)
}
const proxyOption = {
 set(target, key, val, receiver) {
   const result = Reflect.set(target, key, val, receiver);
   bucket.forEach(item => {
    Reflect.apply(item, this,[])
   })
   return result
 },
 get(target, key,receiver) {
   return Reflect.get(target, key)
 }
}
// 创建观察器
const observer = (obj) => new Proxy(obj, proxyOption);
const obj = {
 name: 'Maic',
 age: 18
}
// 将obj添加到观察器中
const userInfo2 = observer(obj);

effect(() => {
  console.log(userInfo2.name, userInfo2.age);
});

userInfo2.name = 'Tom'; // 触发Proxy
```

## 15.async/await

这个用得太多了，异步变成同步操作,async定义的一个函数，会默认返回一个Promise,注意async中不一定有await,但是有await一定得有async。

```javascript
const featchList = () => new Promise((resolve, reject) => {
 resolve({code: 0, message: '成功'})
})
const requests = async () => {
 try {
  const {code} = await featchList();
 } catch (error) {
   throw error;
 }
 
 console.log(code, '=code');
}
requests();
```

## 16.Class

```javascript
 class Utils {
  constructor(name, age) {
   Object.assign(this, {name, age});
   // or
   /*
    this.name = name;
    this.age = age;
   */
  }
 }
 const utils = new Utils('utils', 18)
```

## 17.函数默认参数

```javascript
function test(name = 'Maic') {
  console.log(name)
}
```

## 18.箭头函数

不过要注意箭头函数的一些特性，比如没有没有自己的this,不能被实例化，也不能用bind,call之类的

```javascript
const request = () => {};
// 以前
const requestFn = function() {}
```

 