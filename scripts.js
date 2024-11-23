// ./scripts.js

// Initialize library data
const library = {
    books: JSON.parse(localStorage.getItem('books')) || [],
    borrowers: JSON.parse(localStorage.getItem('borrowers')) || [],
    queue: JSON.parse(localStorage.getItem('queue')) || [],
  };
  
  // Save data to localStorage
  function saveData() {
    localStorage.setItem('books', JSON.stringify(library.books));
    localStorage.setItem('borrowers', JSON.stringify(library.borrowers));
    localStorage.setItem('queue', JSON.stringify(library.queue));
  }
  
  // Display books
  function displayBooks() {
    const bookList = document.getElementById('book-list');
    if (library.books.length === 0) {
      bookList.innerHTML = '<p>No books available.</p>';
      return;
    }
  
    const table = `
      <table>
        <thead>
          <tr>
            <th>Book ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${library.books.map(book => `
            <tr>
              <td>${book.id}</td>
              <td>${book.title}</td>
              <td>${book.author}</td>
              <td>${book.qty}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    bookList.innerHTML = table;
  }
  
  // Show Modal
  function showModal(contentHtml, formType = '') {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-form-content');
    const closeBtn = document.querySelector('.close');
  
    modalContent.innerHTML = contentHtml;
    modal.style.display = 'block';
  
    if (formType) {
      const form = modalContent.querySelector('form');
      form.addEventListener('submit', e => handleFormSubmit(e, formType));
    }
  
    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };
  
    window.onclick = event => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
  }
  
  // Generate Borrowers List
  function displayBorrowers() {
    if (library.borrowers.length === 0) {
      showModal('<p>No borrowers found.</p>');
      return;
    }
  
    const table = `
      <table>
        <thead>
          <tr>
            <th>USN</th>
            <th>Name</th>
            <th>Borrowed Book ID</th>
          </tr>
        </thead>
        <tbody>
          ${library.borrowers.map(borrower => `
            <tr>
              <td>${borrower.usn}</td>
              <td>${borrower.name}</td>
              <td>${borrower.bookId}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    showModal(`<h2>Borrowers</h2>${table}`);
  }
  
  // Generate Queue List
  function displayQueue() {
    if (library.queue.length === 0) {
      showModal('<p>No borrowers in the queue.</p>');
      return;
    }
  
    const table = `
      <table>
        <thead>
          <tr>
            <th>USN</th>
            <th>Name</th>
            <th>Requested Book ID</th>
          </tr>
        </thead>
        <tbody>
          ${library.queue.map(queueItem => `
            <tr>
              <td>${queueItem.usn}</td>
              <td>${queueItem.name}</td>
              <td>${queueItem.bookId}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    showModal(`<h2>Queue</h2>${table}`);
  }
  
  // Generate Form Content
  function generateFormContent(formType) {
    switch (formType) {
      case 'addBook':
        return `
          <form id="addBookForm">
            <h2>Add Book</h2>
            <label for="bookId">Book ID:</label>
            <input type="text" id="bookId" required />
            <label for="title">Title:</label>
            <input type="text" id="title" required />
            <label for="author">Author:</label>
            <input type="text" id="author" required />
            <label for="qty">Quantity:</label>
            <input type="number" id="qty" min="1" required />
            <button type="submit">Add Book</button>
          </form>
        `;
  
      case 'borrowBook':
        return `
          <form id="borrowBookForm">
            <h2>Borrow Book</h2>
            <label for="borrowBookId">Book ID:</label>
            <input type="text" id="borrowBookId" required />
            <label for="usn">Student USN:</label>
            <input type="text" id="usn" required />
            <label for="name">Student Name:</label>
            <input type="text" id="name" required />
            <button type="submit">Borrow Book</button>
          </form>
        `;
  
      case 'returnBook':
        return `
          <form id="returnBookForm">
            <h2>Return Book</h2>
            <label for="returnUsn">Student USN:</label>
            <input type="text" id="returnUsn" required />
            <button type="submit">Return Book</button>
          </form>
        `;
  
      case 'deleteBook':
        return `
          <form id="deleteBookForm">
            <h2>Delete Book</h2>
            <label for="deleteBookId">Book ID:</label>
            <input type="text" id="deleteBookId" required />
            <button type="submit">Delete Book</button>
          </form>
        `;
  
      default:
        return '<p>Error loading form. Please try again.</p>';
    }
  }
  
  // Handle form submissions
  function handleFormSubmit(e, formType) {
    e.preventDefault();
    const modal = document.getElementById('modal');
  
    switch (formType) {
      case 'addBook':
        const bookId = document.getElementById('bookId').value;
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const qty = parseInt(document.getElementById('qty').value, 10);
  
        if (bookId && title && author && !isNaN(qty)) {
          library.books.push({ id: bookId, title, author, qty });
          saveData();
          modal.style.display = 'none';
          displayBooks();
        } else {
          alert('Invalid input. Please try again.');
        }
        break;
  
      case 'borrowBook':
        const borrowBookId = document.getElementById('borrowBookId').value;
        const usn = document.getElementById('usn').value;
        const name = document.getElementById('name').value;
  
        const bookToBorrow = library.books.find(book => book.id === borrowBookId);
        if (bookToBorrow && bookToBorrow.qty > 0) {
          bookToBorrow.qty--;
          library.borrowers.push({ usn, name, bookId: borrowBookId });
          saveData();
          modal.style.display = 'none';
          displayBooks();
        } else if (!bookToBorrow) {
          alert('Book not found.');
        } else {
          // Add borrower to the queue if book is unavailable
          library.queue.push({ usn, name, bookId: borrowBookId });
          saveData();
          alert('No copies available, you have been added to the queue.');
          modal.style.display = 'none';
        }
        break;
  
      case 'returnBook':
        const returnUsn = document.getElementById('returnUsn').value;
  
        const borrowerIndex = library.borrowers.findIndex(b => b.usn === returnUsn);
        if (borrowerIndex !== -1) {
          const { bookId } = library.borrowers[borrowerIndex];
          const returnedBook = library.books.find(book => book.id === bookId);
          if (returnedBook) returnedBook.qty++;
          library.borrowers.splice(borrowerIndex, 1);
  
          // Check if there are any people waiting in the queue for the returned book
          const queueIndex = library.queue.findIndex(item => item.bookId === bookId);
          if (queueIndex !== -1) {
            const nextInQueue = library.queue[queueIndex];
            // Check if book is available now
            if (returnedBook.qty > 0) {
              returnedBook.qty--;
              library.borrowers.push({ usn: nextInQueue.usn, name: nextInQueue.name, bookId });
              library.queue.splice(queueIndex, 1);
              alert(`Book is now available, ${nextInQueue.name} can borrow it.`);
            }
          }
  
          saveData();
          modal.style.display = 'none';
          displayBooks();
        } else {
          alert('Borrower not found.');
        }
        break;
  
      case 'deleteBook':
        const deleteBookId = document.getElementById('deleteBookId').value;
  
        const bookIndex = library.books.findIndex(book => book.id === deleteBookId);
        if (bookIndex !== -1) {
          library.books.splice(bookIndex, 1);
          saveData();
          modal.style.display = 'none';
          displayBooks();
        } else {
          alert('Book not found.');
        }
        break;
  
      default:
        alert('Error processing form. Please try again.');
    }
  }
  
  // Attach Modal Forms and Actions to Buttons
  document.getElementById('addBookBtn').addEventListener('click', () => {
    const formContent = generateFormContent('addBook');
    showModal(formContent, 'addBook');
  });
  
  document.getElementById('borrowBookBtn').addEventListener('click', () => {
    const formContent = generateFormContent('borrowBook');
    showModal(formContent, 'borrowBook');
  });
  
  document.getElementById('returnBookBtn').addEventListener('click', () => {
    const formContent = generateFormContent('returnBook');
    showModal(formContent, 'returnBook');
  });
  
  document.getElementById('deleteBookBtn').addEventListener('click', () => {
    const formContent = generateFormContent('deleteBook');
    showModal(formContent, 'deleteBook');
  });
  
  document.getElementById('viewBorrowersBtn').addEventListener('click', displayBorrowers);
  document.getElementById('viewQueueBtn').addEventListener('click', displayQueue);
  
  // Initialize
  displayBooks();
  