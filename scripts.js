// Define linked list and queue structures
class Book {
  constructor(id, title, author, qty) {
      this.id = id;
      this.title = title;
      this.author = author;
      this.qty = qty;
      this.nxt = null;
      this.pre = null;
  }
}

class Student {
  constructor(usn, name, borrowedBookId) {
      this.usn = usn;
      this.name = name;
      this.borrowedBookId = borrowedBookId;
      this.nxt = null;
      this.pre = null;
  }
}

class QueueNode {
  constructor(usn, name, bookId) {
      this.usn = usn;
      this.name = name;
      this.bookId = bookId;
      this.nxt = null;
  }
}

class Queue {
  constructor() {
      this.front = null;
      this.rear = null;
  }

  enqueue(usn, name, bookId) {
      const newNode = new QueueNode(usn, name, bookId);
      if (!this.rear) {
          this.front = this.rear = newNode;
      } else {
          this.rear.nxt = newNode;
          this.rear = newNode;
      }
  }

  dequeue() {
      if (!this.front) return null;
      const temp = this.front;
      this.front = this.front.nxt;
      if (!this.front) this.rear = null;
      return temp;
  }

  isEmpty() {
      return this.front === null;
  }
}

// Initialize data structures
let bookList = null;
let borrowerList = null;
const waitQueue = new Queue();

// Save and Load to Local Storage
function saveData() {
  const serializedBooks = [];
  let currentBook = bookList;
  while (currentBook) {
      serializedBooks.push({
          id: currentBook.id,
          title: currentBook.title,
          author: currentBook.author,
          qty: currentBook.qty,
      });
      currentBook = currentBook.nxt;
  }

  const serializedBorrowers = [];
  let currentBorrower = borrowerList;
  while (currentBorrower) {
      serializedBorrowers.push({
          usn: currentBorrower.usn,
          name: currentBorrower.name,
          borrowedBookId: currentBorrower.borrowedBookId,
      });
      currentBorrower = currentBorrower.nxt;
  }

  const serializedQueue = [];
  let currentQueueNode = waitQueue.front;
  while (currentQueueNode) {
      serializedQueue.push({
          usn: currentQueueNode.usn,
          name: currentQueueNode.name,
          bookId: currentQueueNode.bookId,
      });
      currentQueueNode = currentQueueNode.nxt;
  }

  localStorage.setItem('bookList', JSON.stringify(serializedBooks));
  localStorage.setItem('borrowerList', JSON.stringify(serializedBorrowers));
  localStorage.setItem('waitQueue', JSON.stringify(serializedQueue));
}

function loadData() {
  const serializedBooks = JSON.parse(localStorage.getItem('bookList') || '[]');
  const serializedBorrowers = JSON.parse(localStorage.getItem('borrowerList') || '[]');
  const serializedQueue = JSON.parse(localStorage.getItem('waitQueue') || '[]');

  bookList = null;
  let previousBook = null;
  for (const book of serializedBooks) {
      const newBook = new Book(book.id, book.title, book.author, book.qty);
      if (!bookList) bookList = newBook;
      if (previousBook) {
          previousBook.nxt = newBook;
          newBook.pre = previousBook;
      }
      previousBook = newBook;
  }


  borrowerList = null;
  let previousBorrower = null;
  for (const borrower of serializedBorrowers) {
      const newBorrower = new Student(borrower.usn, borrower.name, borrower.borrowedBookId);
      if (!borrowerList) borrowerList = newBorrower;
      if (previousBorrower) {
          previousBorrower.nxt = newBorrower;
          newBorrower.pre = previousBorrower;
      }
      previousBorrower = newBorrower;
  }

  waitQueue.front = waitQueue.rear = null;
  for (const queueNode of serializedQueue) {
      waitQueue.enqueue(queueNode.usn, queueNode.name, queueNode.bookId);
  }
}

// Convert linked list to array for local storage
function toArray(list) {
  const result = [];
  let temp = list;
  while (temp) {
      result.push(temp);
      temp = temp.nxt;
  }
  return result;
}

// Convert queue to array for local storage
function toArrayQueue(queue) {
  const result = [];
  let temp = queue.front;
  while (temp) {
      result.push(temp);
      temp = temp.nxt;
  }
  return result;
}

// Recreate linked list from array
function fromArray(data, NodeClass) {
  let head = null;
  let tail = null;
  data.forEach(item => {
      const node = new NodeClass(item.id || item.usn, item.title || item.name, item.author || item.borrowedBookId, item.qty);
      if (!head) {
          head = node;
          tail = node;
      } else {
          tail.nxt = node;
          node.pre = tail;
          tail = node;
      }
  });
  return head;
}

// Modal Handling
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

// Display Books
function displayBooks() {
  const bookListDiv = document.getElementById('book-list');
  if (!bookList) {
      bookListDiv.innerHTML = '<p>No books available.</p>';
      return;
  }

  const books = toArray(bookList);
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
              ${books.map(book => `
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
  bookListDiv.innerHTML = table;
}

// Generate Forms
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
  }
}

// Handle Form Submissions
function handleFormSubmit(e, formType) {
  e.preventDefault();
  const modal = document.getElementById('modal');

  switch (formType) {
      case 'addBook':
          const bookId = document.getElementById('bookId').value;
          const title = document.getElementById('title').value;
          const author = document.getElementById('author').value;
          const qty = parseInt(document.getElementById('qty').value, 10);

          const newBook = new Book(bookId, title, author, qty);
          if (!bookList) {
              bookList = newBook;
          } else {
              let temp = bookList;
              while (temp.nxt) temp = temp.nxt;
              temp.nxt = newBook;
              newBook.pre = temp;
          }
          saveData();
          modal.style.display = 'none';
          displayBooks();
          break;
      case 'borrowBook':
          const borrowBookId = document.getElementById('borrowBookId').value;
          const usn = document.getElementById('usn').value;
          const name = document.getElementById('name').value;
    

          let book = bookList;
          while (book && book.id !== borrowBookId) book = book.nxt;

          if (!book) {
            // If the book does not exist, show an error and do not add to the queue
            alert('Error: Book does not exist in the library.');
            return;
        }

          if (book && book.qty <= 0) {
              waitQueue.enqueue(usn, name, borrowBookId);
              saveData();
              alert('Book unavailable. Added to the queue.');
          } else {
              book.qty--;
              const newBorrower = new Student(usn, name, borrowBookId);
              newBorrower.nxt = borrowerList;
              if (borrowerList) borrowerList.pre = newBorrower;
              borrowerList = newBorrower;
              saveData();
              alert('Book borrowed successfully!');
          }
          modal.style.display = 'none';
          displayBooks();
          break;
      case 'returnBook':
          const returnUsn = document.getElementById('returnUsn').value;
          let borrower = borrowerList;
          while (borrower && borrower.usn !== returnUsn) borrower = borrower.nxt;

          if (!borrower) {
              alert('Error: Borrower not found.');
              return;
          }

          let returnBook = bookList;
          while (returnBook && returnBook.id !== borrower.borrowedBookId) returnBook = returnBook.nxt;

          if (!returnBook) {
              alert('Error: Book not found.');
              return;
          }

          if (borrower.pre) borrower.pre.nxt = borrower.nxt;
          if (borrower.nxt) borrower.nxt.pre = borrower.pre;
          if (borrower === borrowerList) borrowerList = borrower.nxt;
          
          const waiting = waitQueue.front;
          if (waiting && waiting.bookId === returnBook.id) {
            const newBorrower = new Student(waiting.usn, waiting.name, waiting.bookId);
            newBorrower.nxt = borrowerList;
            if (borrowerList) borrowerList.pre = newBorrower;
            borrowerList = newBorrower;
            waitQueue.dequeue();
          } else {
            returnBook.qty++;
          }
          saveData();
          modal.style.display = 'none';
          displayBooks();
          alert('Book returned successfully!');
          break;
      case 'deleteBook':
          const deleteBookId = document.getElementById('deleteBookId').value;
          let temp = bookList;
          while (temp && temp.id !== deleteBookId) temp = temp.nxt;

          if (!temp) {
              alert('Error: Book not found.');
              return;
          }

          if (temp.pre) temp.pre.nxt = temp.nxt;
          if (temp.nxt) temp.nxt.pre = temp.pre;
          if (temp === bookList) bookList = temp.nxt;
          saveData();
          modal.style.display = 'none';
          displayBooks();
          alert('Book deleted successfully!');
          break;
  }
}

// Event Listeners for Buttons
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

document.getElementById('viewBorrowersBtn').addEventListener('click', () => {
  const borrowers = toArray(borrowerList);
  if (borrowers.length === 0) {
      alert('No borrowers found.');
  } else {
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
                  ${borrowers.map(b => `
                      <tr>
                          <td>${b.usn}</td>
                          <td>${b.name}</td>
                          <td>${b.borrowedBookId}</td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>
      `;
      showModal(`<h2>Borrowers</h2>${table}`);
  }
});

document.getElementById('viewQueueBtn').addEventListener('click', () => {
  const queue = toArrayQueue(waitQueue);
  if (queue.length === 0) {
      alert('No borrowers in the queue.');
  } else {
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
                  ${queue.map(q => `
                      <tr>
                          <td>${q.usn}</td>
                          <td>${q.name}</td>
                          <td>${q.bookId}</td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>
      `;
      showModal(`<h2>Queue</h2>${table}`);
  }
});

// Initialize
loadData();
displayBooks();
