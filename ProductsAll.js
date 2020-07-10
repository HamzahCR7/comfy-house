//variables
const cartBtn=document.querySelector('.cart-btn');
const closecartBtn=document.querySelector('.close-cart');
const clearcartBtn=document.querySelector('.clear-cart');
const cartDOM=document.querySelector('.cart');
const cartOverlay=document.querySelector('.cart-overlay');
const cartItems=document.querySelector('.cart-items');
const cartTotal=document.querySelector('.cart-total');
const cartContent=document.querySelector('.cart-content');
const productsDOM=document.querySelector('.products-center');


let cart=[];
let buttonDOM=[];
class Product{
async getProducts(){
	try{
		let result=await fetch("productsAll.json");
		let data= await result.json();
		let products=data.items;
		products=products.map(item=>{
			const {title,price,discount}=item.fields;
		const {id}=item.sys;
		const img=item.fields.image.fields.file.url;
		return {title,price,id,img,discount};
		})
		return products;

	}
	catch(error){
		console.log(error);
	}
}

}

class UI{
displayProducts(products){
	// console.log(products);
	let result='';
	products.forEach(product=>{
		result+=`
		<article class="product">
				<div class="img-container">
					<img src=${product.img} class="product-img">
					<button class="bag-btn" data-id=${product.id}><i class="fa fa-shopping-cart"> add to bag</i></button>
				</div>
				<h3>${product.title}</h3>
				<h4>$${product.price} <span class="discounts"> $${product.discount}</span></h4>

			</article>
			
		`
	})
	productsDOM.innerHTML=result;
}
getBagButtons(){
	const btns=[...document.querySelectorAll('.bag-btn')];
	// console.log(btns);
	buttonDOM=btns;
	btns.forEach(button=>{
		let id=button.dataset.id;
		// console.log(id);
		
		
		let inCart=cart.find(item=>item.id===id);
	if(inCart){
		button.innerText="In cart";
		button.disabled=true;
	}
	
		button.addEventListener('click',(event)=>{
			// console.log(event);
			event.target.innerText="In cart";
			event.target.disabled=true;
			let cartItem={...Storage.getProducts(id),amount:1};
			// console.log(cartItem);
			cart=[...cart,cartItem];
			// console.log(cart);
			Storage.saveCart(cart);
			this.setCartValues(cart);
			this.addCartItems(cartItem);
			this.show();
			
			
		});
	
	});
};
setCartValues(cart){
	let temp=0;
	let temptotal=0;
	cart.map(item=>{
		temp +=item.price*item.amount;
		temptotal+=item.amount;
	});
	console.log(temptotal);
	
	cartTotal.innerText=parseFloat(temp.toFixed(2));
	cartItems.innerHTML=temptotal;
}
addCartItems(item){
	const div=document.createElement('div');
	div.classList.add('cart-item');
	div.innerHTML=`
	<img src=${item.img}>
			
	<div >
		<h4>${item.title}</h4>
		<h5>$${item.price}</h5>
		<span class="remove-item" data-id=${item.id}>remove</span>
	</div>
	<div>
		<i class="fa fa-chevron-up" data-id=${item.id}></i>
		<p class="item-amount">${item.amount}</p>
					<i class="fa fa-chevron-down" data-id=${item.id}></i>

	</div>
	`;
	cartContent.appendChild(div);
	console.log(cartContent);
	
}
show(){
	cartOverlay.classList.add('transparentBcg');
	cartDOM.classList.add("showCart");
}
setupApp(){
cart=Storage.getCart();
this.setCartValues(cart);
this.populateCart(cart);
cartBtn.addEventListener('click',this.show);
closecartBtn.addEventListener('click',this.closeCart);
}
populateCart(cart){
cart.forEach(item=>this.addCartItems(item));
}
closeCart(){
	cartOverlay.classList.remove('transparentBcg');
	cartDOM.classList.remove("showCart");
}
cartLogic(){
	clearcartBtn.addEventListener('click',()=>{
		this.clearCart();

	});
	cartContent.addEventListener('click',event=>{
		// console.log(event.target);
		if(event.target.classList.contains('remove-item')){
			let remove=event.target;
			// console.log(remove);
			let id=remove.dataset.id;
			// console.log(id);
			this.removeItem(id);
			cartContent.removeChild(remove.parentElement.parentElement);
			
			
		}
		else if(event.target.classList.contains('fa-chevron-up')){
			let addAmount=event.target;
			let id=addAmount.dataset.id;
			let tempItem=cart.find(item=>item.id===id);
			tempItem.amount=tempItem.amount+1;
			Storage.saveCart(cart);
			this.setCartValues(cart);
			addAmount.nextElementSibling.innerText=tempItem.amount;
		}
		else if(event.target.classList.contains('fa-chevron-down')){
			let lowerAmount=event.target;
			let id=lowerAmount.dataset.id;
			let tempItem=cart.find(item=>item.id===id);
			tempItem.amount=tempItem.amount-1;
		if(tempItem.amount>0){
			Storage.saveCart(cart);
			this.setCartValues(cart);
			lowerAmount.previousElementSibling.innerText=tempItem.amount;
		}
		else{
			cartContent.removeChild(lowerAmount.parentElement.parentElement);
			this.removeItem(id);
		}
		}
		
	})
}
clearCart(){
	// console.log(this);
	let cartItems=cart.map(item=>item.id);
	// console.log(cartItems);
	cartItems.forEach(id=>this.removeItem(id));
	console.log(cartContent.children);
	
	while(cartContent.children.length>0){
		cartContent.removeChild(cartContent.children[0]);
	}
	this.closeCart();
	
}
removeItem(id){
	cart=cart.filter(item=>item.id!==id);
	// console.log(cart);
this.setCartValues(cart);
Storage.saveCart(cart);
let button=this.getSingleButton(id);
button.disabled=false;
button.innerHTML=`<i class="fa fa-shopping-cart">add to Cart</i>`;


}
getSingleButton(id){
	return buttonDOM.find(button=>button.dataset.id===id);
}
};
class Storage{
static storageProducts(products){
localStorage.setItem("products",JSON.stringify(products)
);
}
static getProducts(id){
	let products=JSON.parse(localStorage.getItem('products'));
	return products.find(product=>product.id===id);
}
static saveCart(cart){
	localStorage.setItem("cart",JSON.stringify(cart));
}
static getCart(){
	return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
}
}
document.addEventListener("DOMContentLoaded", ()=>{
	const ui=new UI();
	const products=new Product();
	ui.setupApp();
	products.getProducts().then(products=> {ui.displayProducts(products)
	Storage.storageProducts(products);
}).then(()=>{
	ui.getBagButtons();
	ui.cartLogic();
});
})