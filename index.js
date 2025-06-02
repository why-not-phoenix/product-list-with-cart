// PSUEDOCODE:

// Listen for click
    // Change button content when clicked
    // Implement increment an decrement
        // Keep count of clicked items
    // Update cart
        // Implement cart styles
        // Update total cost
// Order confirmation?

const placeOrderButtons = document.querySelectorAll('.menu__item .btn');
const menuItems = document.querySelectorAll('.menu__item__name');
const prices = document.querySelectorAll('.menu__item__price');
const checkOutTrack = document.querySelector('#checkout__head span');
const checkOutCard = document.querySelector('.checkout__calc');
const checkOutItems = checkOutCard.querySelector('.checkout__list');
const emptyCartPlaceholder = document.querySelector('.empty-cart');


const originalButtonHTML = placeOrderButtons[0].innerHTML;

let itemCounts = new Array(placeOrderButtons.length).fill(0);
let cartItemElements = new Array(placeOrderButtons.length).fill(null);
let addedItemIndex = [];

updateCartSize();

function handleClickWrapper(event) {
    const btn = event.currentTarget;
    const i = Array.from(placeOrderButtons).indexOf(btn);
    handleClickOnce(btn, i);
}

// Listen for click
placeOrderButtons.forEach((btn) => {
    btn.addEventListener('click', handleClickWrapper);
});

function handleClickOnce(button, i) {
    itemCounts[i]++;
    updateCartSize();
    buttonSwitch(button, i);
    addItemToCart(menuItems[i].textContent, i);
    button.removeEventListener('click', handleClickWrapper);
}

function buttonSwitch(button, i) {
    button.innerHTML = "";
    button.classList.remove('bg-rose-50')
    button.classList.add('btn--active');

    let count = document.createElement('span');
    count.classList.add('count');
    count.textContent = itemCounts[i];
    
    let removeItem = document.createElement('img');
    removeItem.classList.add('remove-item');
    removeItem.setAttribute('src', 'assets/images/icon-decrement-quantity.svg');
    removeItem.addEventListener('click', function(e){
        e.stopPropagation(); // <- this stops the bubbling to the main button

        if (itemCounts[i] > 0) {
            itemCounts[i]--;
            count.textContent = itemCounts[i];
            updateCartSize();
            if (cartItemElements[i]) {
                cartItemElements[i].qtyEl.textContent = `x ${itemCounts[i]}`;
                 cartItemElements[i].totalEl.textContent = `$${parseFloat(cartItemElements[i].priceEl.textContent.match(/[\d.]+/)[0]) * itemCounts[i]}`
                 updateCartTotal();
            }

            if (itemCounts[i] === 0) {
                button.classList.remove('btn--active');
                button.classList.add('bg-rose-50');
                button.innerHTML = originalButtonHTML;
                button.addEventListener('click', handleClickWrapper);
                if (cartItemElements[i]) {
                    checkOutItems.removeChild(cartItemElements[i].container);
                    const pos = addedItemIndex.indexOf(i);
                    addedItemIndex.splice(pos, 1);
                    cartItemElements[i] = null;
                }
            }
        } 
    });

    
    let addItem = document.createElement('img');
    addItem.classList.add('add-item');
    addItem.setAttribute('src', 'assets/images/icon-increment-quantity.svg');
    addItem.addEventListener('click', function(){
        itemCounts[i]++;
        count.textContent = itemCounts[i];
        updateCartSize();
        if (cartItemElements[i]) {
            cartItemElements[i].qtyEl.textContent = `x ${itemCounts[i]}`;
            cartItemElements[i].totalEl.textContent = `$${parseFloat(cartItemElements[i].priceEl.textContent.match(/[\d.]+/)[0]) * itemCounts[i]}`
            updateCartTotal();
        }
    })

    button.appendChild(removeItem);
    button.appendChild(count);
    button.appendChild(addItem);
}

function updateCartSize() {
    const cartSize = itemCounts.reduce((sum, count) => sum + count, 0);
    checkOutTrack.textContent = cartSize;
    updateCartTotal();
    if (cartSize > 0) {
        checkOutCard.setAttribute('aria-hidden', 'false');
        emptyCartPlaceholder.setAttribute('aria-hidden', 'true');
    } else {
        checkOutCard.setAttribute('aria-hidden', 'true');
        emptyCartPlaceholder.setAttribute('aria-hidden', 'false');
    }
}

function addItemToCart(name, index) {
    if (!addedItemIndex.includes(index)) {
        const cartItem = document.createElement('li');
        cartItem.classList.add('cart-item', 'd-flex');

        const cartItemInfo = document.createElement('div');
        cartItemInfo.classList.add('cart-item__info');

        const cartItemName = document.createElement('p');
        cartItemName.classList.add('fw-2');

        const orderDetails = document.createElement('p');
        orderDetails.classList.add('fs-1', 'fw-2', 'text-rose-500');

        const itemQty = document.createElement('span');
        itemQty.classList.add('quantity', 'text-red');

        const itemPrice = document.createElement('span');
        itemPrice.classList.add('fw-1');

        const itemTotal = document.createElement('span');

        const cancelOrder = document.createElement('img');
        cancelOrder.classList.add('cancel-order');
        cancelOrder.setAttribute('src', 'assets/images/icon-remove-item.svg');

        cartItemName.textContent = name;
        itemQty.textContent = `x ${itemCounts[index]}`;
        itemPrice.textContent = prices[index].textContent;

        let priceFigure = parseFloat(itemPrice.textContent.match(/[\d.]+/)[0]);
        itemTotal.textContent = `$ ${priceFigure * itemCounts[index]}`;

        checkOutItems.appendChild(cartItem);
        cartItem.appendChild(cartItemInfo);
        cartItem.appendChild(cancelOrder);

        cancelOrder.addEventListener('click', () => {
            itemCounts[index] = 0;

            // Remove cart DOM
            checkOutItems.removeChild(cartItem);

            // Reset tracking
            cartItemElements[index] = null;
            const pos = addedItemIndex.indexOf(index);
            if (pos !== -1) addedItemIndex.splice(pos, 1);

            // Reset button state
            const button = placeOrderButtons[index];
            button.innerHTML = originalButtonHTML;
            button.classList.remove('btn--active');
            button.classList.add('bg-rose-50');
            button.addEventListener('click', handleClickWrapper);

            updateCartSize();
            updateCartTotal();
        });

        cartItemInfo.appendChild(cartItemName);
        cartItemInfo.appendChild(orderDetails);
        orderDetails.appendChild(itemQty);
        orderDetails.appendChild(itemPrice);
        orderDetails.appendChild(itemTotal);

        cartItemElements[index] = {
            container: cartItem,
            qtyEl: itemQty,
            priceEl: itemPrice,
            totalEl: itemTotal,
        };

        addedItemIndex.push(index);
        updateCartTotal();
    } else {
        cartItemElements[index].qtyEl.textContent = `x ${itemCounts[index]}`;
    }
}

function updateCartTotal() {
    let total = 0;
    for (let i of addedItemIndex) {
        const unitPrice = parseFloat(prices[i].textContent.match(/[\d.]+/)[0]);
        total += unitPrice * itemCounts[i];
    }
    document.querySelector('#cart-total').textContent = `$ ${total.toFixed(2)}`;
}

const orderModal = document.querySelector('#order-modal');
const orderSummaryList = document.querySelector('#order-summary-list');
const newOrderBtn = document.querySelector('#new-order-btn');

const placeOrderBtn = document.querySelector('#order-button');

placeOrderBtn.addEventListener('click', () => {
    if (itemCounts.reduce((a, b) => a + b, 0) === 0) return;

    orderSummaryList.innerHTML = '';

    for (let i of addedItemIndex) {
        const itemName = menuItems[i].textContent;
        const qty = itemCounts[i];
        const price = parseFloat(prices[i].textContent.match(/[\d.]+/)[0]);
        const total = price * qty;
        const imgSrc = placeOrderButtons[i].closest('.menu__item').querySelector('img')?.src;

        const li = document.createElement('li');
        li.className = 'cart-item d-flex';

        const img = document.createElement('img');
        img.src = imgSrc;

        const info = document.createElement('div');
        info.className = 'cart-item__info';

        const nameEl = document.createElement('p');
        nameEl.className = 'fw-2';
        nameEl.textContent = itemName;

        const detailsEl = document.createElement('p');
        detailsEl.className = 'fs-1 fw-2 text-rose-500';
        detailsEl.textContent = `x${qty}  •  $${price.toFixed(2)}`;

        const totalEl = document.createElement('span');
        totalEl.className = 'item-price-total';
        totalEl.textContent = `$${total.toFixed(2)}`;

        info.appendChild(nameEl);
        info.appendChild(detailsEl);

        li.appendChild(img);
        li.appendChild(info);
        li.appendChild(totalEl);

        orderSummaryList.appendChild(li);
    }

    orderModal.classList.remove('hidden');
});


newOrderBtn.addEventListener('click', () => {
    location.reload();
});
