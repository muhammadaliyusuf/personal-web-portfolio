// Click events for buttons
const unread = document.getElementById("unread");
const unreadBtn = document.getElementById("unread-btn");
const read = document.getElementById("read");
const readBtn = document.getElementById("read-btn");

unreadBtn.addEventListener("click", (event) => {
  read.style.display = "none";
  unread.style.display = "flex";
  readBtn.classList.remove("active-btn");
  unreadBtn.classList.add("active-btn");
});

readBtn.addEventListener("click", (event) => {
  read.style.display = "flex";
  unread.style.display = "none";
  unreadBtn.classList.remove("active-btn");
  readBtn.classList.add("active-btn");
});

const STORAGE_KEY = 'BOOKSHELF_APPS';
const books = [];

const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser tidak support Web Storage');
    return false;
  }

  return true;
}

function loadedDataFromStorage() {
  const dataFromWebStorage = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(dataFromWebStorage);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);

    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function addBook() {
  const idBook = generatedID();
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const yearReleased = document.getElementById('inputBookYear').value;
  const readStatus = document.getElementById('inputBookIsComplete').checked;

  const bookObject = generateBookObject(idBook, bookTitle, bookAuthor, yearReleased, readStatus)
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  alert('Data baru berhasil ditambahkan');
}

function generatedID() {
  return +new Date();
}

function generateBookObject(id, book, author, released, isCompleted) {
  return {
    id,
    book,
    author,
    released,
    isCompleted
  }
}

function makeBook(bookObject) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = bookObject.book;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = 'Penulis: ' + bookObject.author;

  const textReleased = document.createElement('p');
  textReleased.innerText = 'Tahun: ' + bookObject.released;

  const containerAction = document.createElement('div')
  containerAction.classList.add('action');

  const container = document.createElement('article');
  container.classList.add('book_item');
  container.append(textTitle, textAuthor, textReleased, containerAction);
  container.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const uncompletedButton = document.createElement('button');
    uncompletedButton.innerText = 'Belum Selesai Dibaca';
    uncompletedButton.classList.add('green');

    uncompletedButton.addEventListener('click', function () {
      moveToUnreadBook(bookObject.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.classList.add('red');

    deleteButton.addEventListener('click', function () {
      deteleBook(bookObject.id);
    });

    containerAction.append(uncompletedButton, deleteButton);
  } else {

    const completedButton = document.createElement('button');
    completedButton.innerText = 'Sudah Dibaca';
    completedButton.classList.add('green');

    completedButton.addEventListener('click', function () {
      addToReadedBook(bookObject.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.classList.add('red')

    deleteButton.addEventListener('click', function () {
      deteleBook(bookObject.id);
    });

    containerAction.append(completedButton, deleteButton);
  }

  return container;
}

function addToReadedBook(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  alert('Anda telah menyelesaikan buku.')
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null
}

function deteleBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  localStorage.setItem("BOOKSHELF_APPS", JSON.stringify(books));
  document.dispatchEvent(new Event(RENDER_EVENT));
  alert("Anda telah menghapus sebuah buku.")
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function moveToUnreadBook(bookId) {
  bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  alert("Anda telah memindahkan buku.")
}

const searchButton = document.getElementById('searchSubmit');
searchButton.addEventListener('click', function (event) {
  const searchBookTitle = document.getElementById('searchBookTitle').value.toLowerCase();
  const title = document.querySelectorAll('article');
  for (const book of title) {
    const judul = book.childNodes[0].innerText.toLowerCase();
    console.log(judul)
    console.log(searchBookTitle)
    if (judul.includes(searchBookTitle)) {
      book.style.display = 'block';
    } else {
      book.style.display = 'none';
    }
  }

  event.preventDefault();
});


document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadedDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById('incompleteBookshelfList');
  uncompletedBookList.innerHTML = '';

  const completedBookList = document.getElementById('completeBookshelfList');
  completedBookList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});
