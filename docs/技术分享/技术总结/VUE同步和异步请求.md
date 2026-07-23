

```javascript
//同步
async init(id) {
	await this.initA()
	await this.initB(id)
},

initA(){
//先执行A成功，再执行B
}
initB(){
//先执行A成功后，再执行B
}
```

```javascript
//异步
init(id){
	this.initA()
	this.initB()
}
initA(){
//同时执行A和B
}
initB(){
//同时执行A和B
}
```
