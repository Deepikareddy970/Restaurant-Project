async function send() {
  try {
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerName: 'sindhu',
        customerEmail: 'sindhu@gmail.com',
        customerPhone: '1234567890',
        tableNumber: '1',
        items: [
          {
            menuItemId: 'tandoori-chicken',
            name: 'Tandoori Chicken',
            price: 400,
            quantity: 1,
            size: 'full'
          }
        ],
        totalAmount: 400
      })
    });
    console.log("STATUS:", res.status);
    const body = await res.json();
    console.log("BODY:", body);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
send();
