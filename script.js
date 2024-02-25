// Declare data globally
let data;

function updateTotal() {
    const tableBody = document.getElementById('productTableBody');
    const rows = tableBody.getElementsByTagName('tr');
    let total = 0;

    for (let i = 0; i < rows.length; i++) {
        const priceCell = rows[i].getElementsByTagName('td')[2];
        if (priceCell) {
            const priceValue = parseFloat(priceCell.textContent);
            if (!isNaN(priceValue)) {
                total += priceValue;
            }
        }
    }

    document.getElementById('totalAmount').textContent = total.toFixed(2);
}

// stressfull json starrt here
const jsonUrl = 'product.json';

async function fetchData() {
    try {
        const response = await fetch(jsonUrl);
        data = await response.json(); 

        const dropdown = document.getElementById('productName');
        dropdown.innerHTML = ""; 

        data.forEach(product => {
            const optionElement = document.createElement('option');
            optionElement.textContent = product.name;
            dropdown.appendChild(optionElement);
        });

        document.getElementById('productPrice').value = data[0].price;
        updateStockMessage(); // Call updateStockMessage to initially set the stock message
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to update the price when a different product is selected
function updatePrice() {
    const dropdown = document.getElementById('productName');
    const selectedProduct = dropdown.options[dropdown.selectedIndex].text;

    // Find the selected product data in the fetched data
    const selectedProductData = data.find(product => product.name === selectedProduct);

    if (selectedProductData) {
        // Update the price after ensuring the data is available
        document.getElementById('productPrice').value = selectedProductData.price;
        updateStockMessage(selectedProductData.instock); // Call updateStockMessage with instock value
    }
}


// Function to update the stock message based on the instock property
function updateStockMessage(instock) {
    const stockMessage = document.getElementById('stockMessage');
    const borderColor = document.getElementById('invoiceCover');
    if (instock=="false") { // Checks if instock is false
        stockMessage.style.display = 'block';
        borderColor.style.border = '1px solid red'
    } else {
        stockMessage.style.display = 'none';
        borderColor.style.border = '0px solid black'
    }
}


fetchData();


// search model for products
const searchInput = document.createElement('input');
searchInput.className= "searchInput";
searchInput.type = 'text';
searchInput.placeholder = '   Search product....';
searchInput.addEventListener('input', filterProducts);

const dropdown = document.getElementById('productName');
dropdown.parentNode.insertBefore(searchInput, dropdown);

function filterProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  
  // Filter data and exclude products with null name
  const filteredData = data.filter(product => product.name && product.name.toLowerCase().includes(searchTerm));

  dropdown.innerHTML = ""; // Clear existing options

  filteredData.forEach(product => {
    const optionElement = document.createElement('option');
    optionElement.textContent = product.name;
    dropdown.appendChild(optionElement);
  });
}
// search model for products



// add product to table
function addProductToTable() {
    const productName = document.getElementById('productName').value;
    const productQuantity = document.getElementById('productQuantity').value;
    const productPrice = document.getElementById('productPrice').value;
    

    if (productName && productPrice) {
        const tableBody = document.getElementById('productTableBody');
        const newRow = document.createElement('tr');

        const sendToSheet = document.getElementById('mainSheetName');
        const newProduct = document.createElement('input');
        newProduct.name= "ProductName";

        newRow.innerHTML = `
            <th scope="row">${tableBody.children.length + 1}</th>
            <td>${productName}</td>
            <td>${productQuantity}</td>
            <td>${productPrice*productQuantity}</td>

            <td>
                <button type="button" class="btn btn-danger delete-btn"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        newProduct.value = `
            ${productName}
        `;

        tableBody.appendChild(newRow);
        sendToSheet.appendChild(newProduct);

        document.getElementById('productName').value = '';
        document.getElementById('productQuantity').value = '';
        document.getElementById('productPrice').value = '';

        const deleteButton = newRow.querySelector('.delete-btn');
        deleteButton.addEventListener('click', function () {
            tableBody.removeChild(newRow);
            updateTotal();
        });

        updateTotal();
    }
}
document.getElementById('productForm').addEventListener('submit', function (event) {
    event.preventDefault();
    addProductToTable();
});
// add product to table




// confirming invoce
document.getElementById('generateInvoice').addEventListener('click', function () {
    const totalAmount = document.getElementById('totalAmount').textContent;
    const tableBody = document.getElementById('productTableBody');
    const invoiceTableBody = document.getElementById('invoiceTableBody');
    invoiceTableBody.innerHTML = '';

    for (const row of tableBody.children) {
        const productName = row.getElementsByTagName('td')[0].textContent;
        const productQuantity = row.getElementsByTagName('td')[1].textContent;
        const productPrice = row.getElementsByTagName('td')[2].textContent;

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${productName}</td>
            <td>${productQuantity}</td>
            <td>${productPrice}</td>
        `;
        invoiceTableBody.appendChild(newRow);

        document.getElementById("ProductName").value= productName;
        document.getElementById("ProductQuantity").value= productQuantity;
        document.getElementById("ProductPrice").value= productPrice;
    }

    document.getElementById('invoiceTotal').textContent = totalAmount;

    $('#invoiceModal').modal('show');
});
// confirming invoice


// download pdf invoice
function printInvoice() {
    const invoiceContent = document.querySelector('.invoice-header').innerHTML;
    const totalAmount = document.getElementsByClassName('modal-body')[0].innerHTML;
    const pdfContent = `
        <div style="padding: 1rem; border: 1px solid black">
                ${invoiceContent}
                ${totalAmount}
        </div>
    `;

    const options = {
        margin: 0,
        padding: 0,
        filename: 'micserahsales.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 4 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, 
        // Adjust this line for custom size and orientation
    };

    // Call html2pdf inside the printInvoice function
    html2pdf().from(pdfContent).set(options).save();

    // Return the pdfContent if needed for further processing
    return pdfContent;
}
document.getElementById('submitSave').addEventListener('click', function () {printInvoice();});
// download pdf invoice




// data submit
function sendData(e) {
    e.preventDefault();
    // Collect the form data
    var formData = new FormData(document.getElementById("googleSheet"));
    var keyValuePairs = [];
    for (var pair of formData.entries()) {
        keyValuePairs.push(pair[0] + "=" + pair[1]);
    }
    var formDataString = keyValuePairs.join("&");
    // Send a POST request to your Google Apps Script
    fetch(
        "https://script.google.com/macros/s/AKfycby7IwOQKfkT8KKBobgujiS8tFvZEKu6xtT8fAI0KdPBJw3Mnk8KA1ZkSrxEerCLXv7J/exec",
        {
            redirect: "follow",
            method: "POST",
            body: formDataString,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );
}

document.getElementById("googleSheet").addEventListener("submit", function (e) {
    sendData(e);
});
document.getElementById("mainSheetName").addEventListener("submit", function (e) {
    sendData(e);
});