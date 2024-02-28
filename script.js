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
    const filteredData = data.filter(product => product.name && product.name.toLowerCase().includes(searchTerm));
    dropdown.innerHTML = "";

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
    const InvoiceCode = document.getElementById('InvoiceCode').value;
    const TimeStamp = document.getElementById('timeStamp').value;
    

    if (productName && productPrice) {
        const sendToSheet = document.getElementById('mainSheetName');
        const tableBody = document.getElementById('productTableBody');
        const newRow = document.createElement('tr');

        const timeStamp = document.createElement('input');
        timeStamp.value = ` ${TimeStamp}`;
        timeStamp.className= "TimeStamp";
        timeStamp.name= "TimeStamp";
        timeStamp.type = "text";
        timeStamp.readOnly ="true";
        tableBody.appendChild(newRow);
        sendToSheet.appendChild(timeStamp);

        const newProduct = document.createElement('input');
        newProduct.value = ` ${productName}`;
        newProduct.className= "ProductName";
        newProduct.name= "ProductName";
        newProduct.type = "text";
        newProduct.readOnly ="true";
        tableBody.appendChild(newRow);
        sendToSheet.appendChild(newProduct);

        const newQuantity = document.createElement('input');
        newQuantity.className = "ProductQuantity";
        newQuantity.name = "ProductQuantity";
        newQuantity.readOnly = "true";
        newQuantity.value = ` ${productQuantity}`;
        tableBody.appendChild(newRow);
        sendToSheet.appendChild(newQuantity);

        const newCode = document.createElement('input');
        newCode.className = "InvoiceCode";
        newCode.name = "InvoiceCode";
        newCode.readOnly = "true";
        newCode.value = ` ${InvoiceCode}`;
        tableBody.appendChild(newRow);
        sendToSheet.appendChild(newCode);

        newRow.innerHTML = `
            <th scope="row">${tableBody.children.length + 1}</th>
            <td>${productName}</td>
            <td>${productQuantity}</td>
            <td>${productPrice*productQuantity}</td>
            <td>${InvoiceCode}</td>

            <td>
                <button type="button" class="btn btn-danger delete-btn"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        

       

        document.getElementById('productName').value = '';
        document.getElementById('productQuantity').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('InvoiceCode').value = '';
        document.getElementById('timeStamp').value = '';


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
        const invoiceCode = row.getElementsByTagName('td')[3].textContent;

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${productName}</td>
            <td>${productQuantity}</td>
            <td>${productPrice}</td>
            <td>${invoiceCode}</td>
        `;
        invoiceTableBody.appendChild(newRow);
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
                ${invoiceContent}<br>
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
    var formData = new FormData(document.getElementById("mainSheetName"));
    var keyValuePairs = [];

    for (var pair of formData.entries()) {
        var element = document.querySelector('.' + pair[0]); // Select elements by class name
        var className = element ? element.classList[0] : ''; // Get the class name if found
        keyValuePairs.push(className + "=" + pair[1]);
    }

    var formDataString = keyValuePairs.join("&");

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

document.getElementById("mainSheetName").addEventListener("submit", function (e) {
    sendData(e);
});


function setDateTime() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    var yyyy = today.getFullYear();
    var formattedDate = yyyy + '-' + mm + '-' + dd;
    
    // Time
    var hh = String(today.getHours()).padStart(2, '0');
    var min = String(today.getMinutes()).padStart(2, '0');
    var formattedTime = hh + ':' + min;
  
    // Combine date and time
    var combinedDateTime = min + '/' + hh + '/' + dd + '/' + mm + '/' + yyyy;
  
    // Set the value of the combined input field
    document.getElementById('timeStamp').value = combinedDateTime;
  }
  window.onload = setDateTime;